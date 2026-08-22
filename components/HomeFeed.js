"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Header from "./Header";
import CategoryChips from "./CategoryChips";
import VoteCard from "./VoteCard";
import EndOfFeedCard from "./EndOfFeedCard";
import AdSlotCard from "./AdSlotCard";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

const PAGE_SIZE = 8;
// How many cards from the end of the loaded list to place the "load more"
// sentinel — big enough that the next page is usually ready before the
// user actually scrolls that far.
const PREFETCH_AHEAD = 3;
// Every Nth real debate, an ad slot is interleaved into the feed (see
// AdSlotCard — it's a no-op with no ad network configured yet).
const AD_EVERY_N = 6;

async function fetchPostsPage({ category, cursor, signal }) {
  const params = new URLSearchParams({ category, limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/posts?${params.toString()}`, { signal });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

// Orchestrates the full-screen infinite-scroll swipe feed: owns the
// paginated post list, the active category, which card is currently
// centered (for arrow-key voting), and the two IntersectionObservers that
// drive "load more as you approach the end" and "which card is active".
export default function HomeFeed({ initialPosts, initialCursor, initialHasMore }) {
  const { lang } = useLangTheme();
  const t = STR[lang];

  const [activeCat, setActiveCat] = useState("all");
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [retryTick, setRetryTick] = useState(0);

  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const cardRefs = useRef({});
  const abortRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const isFirstCatRun = useRef(true);
  // Bumped on every category switch. loadMore() captures this at fetch time
  // and discards its result if a newer switch has happened by the time the
  // fetch resolves — otherwise a slow in-flight page-N fetch for a category
  // the user has since navigated away from can land and corrupt the new
  // category's post list/cursor.
  const categoryGenerationRef = useRef(0);
  const cursorRef = useRef(cursor);
  const hasMoreRef = useRef(hasMore);
  const activeCatRef = useRef(activeCat);

  // Synced via effect (not mutated inline during render) so these stay
  // correct for the closures inside loadMore()/the IntersectionObserver
  // callbacks without reaching for a bigger useReducer rewrite for what's
  // fundamentally just "read the latest value from an async callback".
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    activeCatRef.current = activeCat;
  }, [activeCat]);

  // Category switch: abort any in-flight fetch, clear the list immediately
  // (never show stale-category cards while loading), refetch page 1, reset
  // scroll to the top. Skipped on first mount — the "all" category's page 1
  // already arrived server-rendered via initialPosts.
  useEffect(() => {
    if (isFirstCatRun.current) {
      isFirstCatRun.current = false;
      return;
    }

    categoryGenerationRef.current += 1;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    // Unblock pagination immediately rather than waiting for the aborted
    // request's own `finally` to release it.
    isFetchingMoreRef.current = false;

    setLoadingCategory(true);
    setLoadError(false);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });

    fetchPostsPage({ category: activeCat, cursor: null, signal: controller.signal })
      .then(({ posts: newPosts, nextCursor, hasMore: more }) => {
        if (abortRef.current !== controller) return; // superseded by a newer switch
        setPosts(newPosts);
        setCursor(nextCursor);
        setHasMore(more);
      })
      .catch((err) => {
        if (err.name === "AbortError" || abortRef.current !== controller) return;
        console.error("Category fetch failed:", err);
        setLoadError(true);
      })
      .finally(() => {
        if (abortRef.current !== controller) return; // let the newer request own loading state
        setLoadingCategory(false);
      });

    return () => controller.abort();
  }, [activeCat, retryTick]);

  async function loadMore() {
    if (isFetchingMoreRef.current || !hasMoreRef.current || !cursorRef.current) return;
    isFetchingMoreRef.current = true;
    const generation = categoryGenerationRef.current;
    try {
      const { posts: more, nextCursor, hasMore: stillMore } = await fetchPostsPage({
        category: activeCatRef.current,
        cursor: cursorRef.current,
      });
      if (generation !== categoryGenerationRef.current) return; // category changed mid-fetch
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setCursor(nextCursor);
      setHasMore(stillMore);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      isFetchingMoreRef.current = false;
    }
  }

  // Prefetch-ahead sentinel: fires loadMore() once the user scrolls near
  // the end of what's currently loaded.
  useEffect(() => {
    const root = scrollRef.current;
    const el = sentinelRef.current;
    if (!root || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root, rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length, hasMore, activeCat]);

  // Active-card tracker: whichever card is most centered in the viewport
  // becomes the one that responds to arrow-key voting.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number(entry.target.dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root, threshold: [0.6] }
    );
    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  function handleCategoryChange(cat) {
    if (cat === activeCat) return;
    setActiveCat(cat);
  }

  function goToNext(fromIndex) {
    const nextEl = cardRefs.current[fromIndex + 1];
    if (nextEl) nextEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sentinelIndex = Math.max(posts.length - PREFETCH_AHEAD, 0);

  return (
    <div className="h-dvh relative overflow-hidden">
      {/* Floats on top of the feed instead of taking its own row, so every
          card gets the full viewport height and the vote buttons never end
          up below the fold. */}
      <div className="absolute top-0 inset-x-0 z-20">
        <div
          className="absolute inset-x-0 top-0 h-44 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}
        />
        <div className="relative">
          <Header overlay />
          <CategoryChips active={activeCat} onChange={handleCategoryChange} overlay />
        </div>
      </div>
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain touch-pan-y scrollbar-none"
      >
        {loadingCategory ? (
          <FeedSkeleton />
        ) : loadError ? (
          <FeedError message={t.couldntLoad} retryLabel={t.tryAgain} onRetry={() => setRetryTick((n) => n + 1)} />
        ) : posts.length === 0 ? (
          <EndOfFeedCard variant="empty" />
        ) : (
          <>
            {posts.map((post, i) => (
              <Fragment key={post.id}>
                {i === sentinelIndex && <div ref={sentinelRef} aria-hidden="true" className="h-px" />}
                <VoteCard
                  post={post}
                  index={i}
                  active={i === activeIndex}
                  cardRef={(el) => {
                    if (el) cardRefs.current[i] = el;
                    else delete cardRefs.current[i];
                  }}
                  onAdvance={() => goToNext(i)}
                />
                {/* Purely a rendering-layer insertion — not part of `posts`,
                    so it never touches cardRefs/data-index and can't throw
                    off arrow-key nav or the active-card observer above. */}
                {(i + 1) % AD_EVERY_N === 0 && <AdSlotCard key={`ad-${post.id}`} />}
              </Fragment>
            ))}
            {!hasMore && <EndOfFeedCard variant="end" />}
          </>
        )}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center" style={{ height: "100dvh" }}>
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--border)", borderTopColor: "var(--text-primary)" }}
        aria-label="Loading"
      />
    </div>
  );
}

function FeedError({ message, retryLabel, onRetry }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-8 gap-4"
      style={{ height: "100dvh" }}
    >
      <p className="text-sm text-ink-secondary">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-full text-xs font-bold"
        style={{ background: "var(--chip-bg-active)", color: "var(--chip-text-active)" }}
      >
        {retryLabel}
      </button>
    </div>
  );
}
