"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useVote } from "@/lib/useVote";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";
import { findCategory } from "@/lib/categories";
import { buildShareCardDataUrl, shareResultImage } from "@/lib/shareCard";
import { burstConfetti, hapticTap } from "@/lib/confetti";
import InlineResultOverlay from "./InlineResultOverlay";

// One full-screen section of the infinite swipe feed. Drag left/right (or
// tap the thumbs buttons, or use the arrow keys when this is the active
// card) to vote — swiping RIGHT / tapping 👍 always means "yes" (up),
// swiping LEFT / tapping 👎 always means "no" (down). This card sits inside
// a vertically scroll-snapping feed (see HomeFeed.js), so the trickiest
// part of this component is telling a horizontal vote-swipe apart from a
// vertical feed-scroll on the very first touchmove — see the pointer
// handlers below for how that's resolved.
export default function VoteCard({ post, index, active, cardRef, onAdvance }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const vote = useVote(post);
  const dragRef = useRef(null);
  const stampUpRef = useRef(null);
  const stampDownRef = useRef(null);
  const [exiting, setExiting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  // Captured the instant the user swipes/taps — independent of whatever
  // happens to the network request afterwards, so "You said 👍" can never
  // flip to "You said 👎" just because a vote call was slow or failed.
  const [castDirection, setCastDirection] = useState(null);

  const drag = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dragging: false,
    axis: null, // null | "horizontal" — vertical drags are left alone for native scroll-snap
    pointerId: null,
  });
  const touchMoveHandlerRef = useRef(null);

  const category = findCategory(post.category);

  // Arrow-key voting for desktop/keyboard users — only the currently
  // active (centered) card responds, so keys don't fire votes on cards
  // that are merely nearby in the scroll list.
  useEffect(() => {
    function onKeyDown(e) {
      if (!active || showOverlay || exiting) return;
      if (e.key === "ArrowRight") tapVote("up");
      else if (e.key === "ArrowLeft") tapVote("down");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, showOverlay, exiting]);

  // Auto-advance to the next card shortly after the result appears, so the
  // feed keeps its scroll momentum instead of waiting on a "Next" tap.
  // Guarded by `active` (read fresh via a ref, not the closed-over prop) so
  // that if the user manually scrolls away in the meantime, the timer
  // doesn't yank them back forward against their own input.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!showOverlay) return;
    const timer = setTimeout(() => {
      if (activeRef.current) onAdvance?.();
    }, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOverlay]);

  // Clean up a lingering non-passive touchmove listener if this card
  // unmounts mid-drag (e.g. category switch during a swipe).
  useEffect(() => {
    return () => unlockAxis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e) {
    // `exiting` covers the brief window after a vote is cast but before the
    // result overlay has appeared — without it, a fast second swipe in that
    // window could re-enter finishSwipe() and cast a second, possibly
    // opposite, vote. `drag.current.dragging` guards against a second
    // finger touching down mid-drag and stomping the first finger's start
    // coordinates.
    if (showOverlay || exiting || drag.current.dragging) return;
    drag.current.dragging = true;
    drag.current.axis = null;
    drag.current.pointerId = e.pointerId;
    const p = point(e);
    drag.current.startX = p.x;
    drag.current.startY = p.y;
    if (dragRef.current) dragRef.current.style.transition = "none";
  }

  // Once a horizontal vote-swipe is detected, capture the pointer and add a
  // native, non-passive touchmove listener so preventDefault() reliably
  // stops the browser from also starting its own scroll for this gesture.
  // `touch-action: pan-y` on the element (below) means the browser hasn't
  // committed to a native gesture yet, so at most a few imperceptible
  // pixels of scroll could happen before this lock fires.
  function lockHorizontalAxis() {
    drag.current.axis = "horizontal";
    const el = dragRef.current;
    if (!el) return;
    try {
      el.setPointerCapture?.(drag.current.pointerId);
    } catch {
      // ignore — pointer capture is a nice-to-have here, not required
    }
    if (!touchMoveHandlerRef.current) {
      const handler = (ev) => {
        if (drag.current.axis === "horizontal") ev.preventDefault();
      };
      touchMoveHandlerRef.current = handler;
      el.addEventListener("touchmove", handler, { passive: false });
    }
  }

  function unlockAxis() {
    const el = dragRef.current;
    if (el && touchMoveHandlerRef.current) {
      el.removeEventListener("touchmove", touchMoveHandlerRef.current);
    }
    touchMoveHandlerRef.current = null;
    drag.current.axis = null;
  }

  function onPointerMove(e) {
    if (!drag.current.dragging || showOverlay) return;
    const p = point(e);
    const dx = p.x - drag.current.startX;
    const dy = p.y - drag.current.startY;

    if (drag.current.axis === null) {
      // Below the lock threshold, keep waiting — don't commit to an axis
      // on a couple of jittery pixels.
      if (Math.hypot(dx, dy) < 10) return;
      // Bias toward "it's a scroll" on ambiguous diagonals: a missed
      // vote-swipe is a much cheaper mistake than an accidental vote.
      if (Math.abs(dx) > Math.abs(dy) * 1.3) {
        lockHorizontalAxis();
      } else {
        drag.current.dragging = false;
        return;
      }
    }

    if (drag.current.axis !== "horizontal") return;

    drag.current.dx = dx;
    const rot = dx / 18;
    const dyDamped = dy * 0.3;
    if (dragRef.current) {
      dragRef.current.style.transform = `translate(${dx}px, ${dyDamped}px) rotate(${rot}deg)`;
    }
    const s = Math.min(Math.abs(dx) / 90, 1);
    if (stampUpRef.current && stampDownRef.current) {
      if (dx > 0) {
        stampUpRef.current.style.opacity = s;
        stampDownRef.current.style.opacity = 0;
      } else if (dx < 0) {
        stampDownRef.current.style.opacity = s;
        stampUpRef.current.style.opacity = 0;
      }
    }
  }

  function onPointerUp() {
    const wasHorizontal = drag.current.axis === "horizontal";
    const wasDragging = drag.current.dragging;
    drag.current.dragging = false;
    unlockAxis();

    if (showOverlay) return;

    if (!wasDragging || !wasHorizontal) {
      // Not a committed horizontal swipe. `wasDragging` still being true
      // here (rather than having been reset mid-move) is specifically the
      // signature of a plain tap with essentially no movement — a vertical
      // scroll attempt already resets it to false itself inside
      // onPointerMove, so this branch can't be confused with someone just
      // trying to scroll the feed. For a product card, that's the "open
      // Amazon" tap — the whole card is the target, not just the small
      // pill badge, since that's what people actually expect to happen
      // when they tap a product photo.
      if (wasDragging && post.affiliate_url) {
        window.open(post.affiliate_url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (dragRef.current) dragRef.current.style.transition = "transform 0.35s cubic-bezier(.2,.9,.3,1)";
    if (Math.abs(drag.current.dx) > 90) {
      finishSwipe(drag.current.dx > 0 ? "up" : "down");
    } else if (dragRef.current) {
      dragRef.current.style.transform = "translate(0,0) rotate(0)";
      if (stampUpRef.current) stampUpRef.current.style.opacity = 0;
      if (stampDownRef.current) stampDownRef.current.style.opacity = 0;
    }
    drag.current.dx = 0;
  }

  // Separate from onPointerUp on purpose — a pointercancel means the
  // gesture was interrupted/hijacked (e.g. the browser took over for its
  // own scrolling), not a deliberate release, so it should never be able to
  // trigger the tap-to-shop navigation above.
  function onPointerCancel() {
    drag.current.dragging = false;
    unlockAxis();
  }

  function finishSwipe(direction) {
    setExiting(true);
    setCastDirection(direction);
    const flyX = direction === "up" ? 700 : -700;
    if (dragRef.current) {
      dragRef.current.style.transform = `translate(${flyX}px, -40px) rotate(${direction === "up" ? 24 : -24}deg)`;
      dragRef.current.style.opacity = "0";
    }
    vote.castVote(direction);
    hapticTap(direction === "up" ? [10, 30, 10] : 12);
    if (direction === "up") burstConfetti();
    setTimeout(() => {
      // The fly-off was just feedback for the swipe, not a permanent exit —
      // this card stays visible (with the result overlay on top of it)
      // until the feed auto-advances to the next one. Without resetting
      // the transform/opacity here, the card would stay flown-off/invisible
      // and the section would show blank page background instead.
      if (dragRef.current) {
        dragRef.current.style.transition = "none";
        dragRef.current.style.transform = "translate(0,0) rotate(0)";
        dragRef.current.style.opacity = "1";
      }
      setShowOverlay(true);
    }, 220);
  }

  function tapVote(direction) {
    if (showOverlay || exiting) return;
    finishSwipe(direction);
  }

  async function handleShare() {
    const dataUrl = await buildShareCardDataUrl({
      post,
      lang,
      direction: castDirection,
      pctUp: vote.pctUp,
      pctDown: vote.pctDown,
    });
    await shareResultImage({ dataUrl, text: `${post.prompt_en} — ${t.tagline}` });
  }

  const debateUrl = `/debate/${post.slug}`;

  return (
    <section
      ref={cardRef}
      data-index={index}
      className="relative w-full snap-start snap-always"
      style={{ height: "100dvh" }}
    >
      <div
        ref={dragRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="absolute inset-0 overflow-hidden select-none"
        style={{
          touchAction: "pan-y",
          background: "var(--neutral-mid)",
          cursor: showOverlay ? "default" : post.affiliate_url ? "pointer" : "grab",
        }}
      >
        <Image
          src={post.image_url}
          alt={post.prompt_en}
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover pointer-events-none"
          draggable={false}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0))" }}
        />
        {category && (
          <div className="absolute top-[calc(env(safe-area-inset-top)+7rem)] left-3.5 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.45)" }}>
            {lang === "en" ? category.label_en : category.label_hi}
          </div>
        )}
        <div
          ref={stampUpRef}
          className="absolute top-[38%] left-5 text-lg font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-lg border-4 opacity-0 pointer-events-none"
          style={{ color: "var(--up-color)", borderColor: "var(--up-color)", transform: "rotate(-14deg)" }}
        >
          {lang === "en" ? "YES" : "हाँ"}
        </div>
        <div
          ref={stampDownRef}
          className="absolute top-[38%] right-5 text-lg font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-lg border-4 opacity-0 pointer-events-none"
          style={{ color: "var(--down-color)", borderColor: "var(--down-color)", transform: "rotate(14deg)" }}
        >
          {lang === "en" ? "NOPE" : "नहीं"}
        </div>

        {!showOverlay && (
          <div className="absolute inset-x-0 bottom-0 p-5 pb-[calc(env(safe-area-inset-bottom)+6rem)] text-white pointer-events-none">
            <p className="text-xl font-bold leading-snug">{post.prompt_en}</p>
            <p className="text-sm opacity-80 mt-1">{post.prompt_hi}</p>
            {post.affiliate_url && (
              <p className="text-xs opacity-70 mt-1.5">🛍️ Tap the photo to shop this on Amazon</p>
            )}
          </div>
        )}
      </div>

      {/* Outside the drag-handled div on purpose, same as the 💬 comments
          link below — a nested <a> inside dragRef risks a tap getting eaten
          by the swipe pointer handlers instead of navigating. */}
      {post.affiliate_url && (
        <a
          href={post.affiliate_url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="absolute top-[calc(env(safe-area-inset-top)+7rem)] right-3.5 z-10 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          🛍️ Shop it
        </a>
      )}

      {showOverlay ? (
        <InlineResultOverlay
          direction={castDirection}
          pctUp={vote.pctUp}
          pctDown={vote.pctDown}
          total={vote.total}
          onShare={handleShare}
        />
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <button
            onClick={() => tapVote("up")}
            aria-label="Thumbs up"
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
            style={{ background: "var(--surface-1)", color: "var(--up-color)" }}
          >
            👍
          </button>
          <Link
            href={debateUrl}
            className="w-11 h-11 rounded-full flex items-center justify-center text-base shadow-card transition-transform duration-150 active:scale-90"
            style={{ background: "var(--surface-1)", color: "var(--text-secondary)" }}
            aria-label="Comments"
          >
            💬
          </Link>
          <button
            onClick={() => tapVote("down")}
            aria-label="Thumbs down"
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
            style={{ background: "var(--surface-1)", color: "var(--down-color)" }}
          >
            👎
          </button>
        </div>
      )}
    </section>
  );
}
