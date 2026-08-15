"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useVote } from "@/lib/useVote";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";
import { findCategory } from "@/lib/categories";
import { buildShareCardDataUrl } from "@/lib/shareCard";
import { burstConfetti, hapticTap } from "@/lib/confetti";
import SplitBar from "./SplitBar";
import CardPeek from "./CardPeek";

// The swipeable deck card used on the home feed. Drag left/right or tap the
// thumbs buttons (or use the arrow keys) — swiping RIGHT / tapping 👍 always
// means "yes" (up), swiping LEFT / tapping 👎 always means "no" (down).
// After voting, a result sheet slides up with the live split and a link
// through to the full debate page (comments live there). `nextPost`, if
// given, peeks out from behind for the stacked-deck effect.
export default function VoteCard({ post, nextPost, onAdvance }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const vote = useVote(post);
  const cardRef = useRef(null);
  const stampUpRef = useRef(null);
  const stampDownRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [exiting, setExiting] = useState(false);
  // Captured the instant the user swipes/taps — independent of whatever
  // happens to the network request afterwards, so "You said 👍" can never
  // flip to "You said 👎" just because a vote call was slow or failed.
  const [castDirection, setCastDirection] = useState(null);
  const drag = useRef({ startX: 0, startY: 0, dx: 0, dragging: false });

  const category = findCategory(post.category);

  // Entrance animation: every time this component mounts (i.e. every time
  // a card is promoted to the front of the deck), it scales/fades in from
  // the peeked position instead of just popping into place.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = "scale(0.94) translateY(14px)";
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        el.style.transition = "transform 0.38s cubic-bezier(.2,.9,.3,1), opacity 0.38s ease";
        el.style.opacity = "1";
        el.style.transform = "scale(1) translateY(0)";
      });
      el.__raf2 = raf2;
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (el.__raf2) cancelAnimationFrame(el.__raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow-key voting for desktop/keyboard users — → is yes, ← is no.
  useEffect(() => {
    function onKeyDown(e) {
      if (revealed || exiting) return;
      if (e.key === "ArrowRight") tapVote("up");
      else if (e.key === "ArrowLeft") tapVote("down");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, exiting]);

  function point(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e) {
    if (revealed) return;
    drag.current.dragging = true;
    const p = point(e);
    drag.current.startX = p.x;
    drag.current.startY = p.y;
    if (cardRef.current) cardRef.current.style.transition = "none";
  }

  function onPointerMove(e) {
    if (!drag.current.dragging || revealed) return;
    const p = point(e);
    // Positive dx = dragging right = "yes". Negative dx = dragging left = "no".
    const dx = p.x - drag.current.startX;
    const dy = (p.y - drag.current.startY) * 0.3;
    drag.current.dx = dx;
    const rot = dx / 18;
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
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
    if (!drag.current.dragging || revealed) return;
    drag.current.dragging = false;
    if (cardRef.current) cardRef.current.style.transition = "transform 0.35s cubic-bezier(.2,.9,.3,1)";
    if (Math.abs(drag.current.dx) > 90) {
      // dx > 0 (dragged right) => "up" / yes. dx < 0 (dragged left) => "down" / no.
      finishSwipe(drag.current.dx > 0 ? "up" : "down");
    } else if (cardRef.current) {
      cardRef.current.style.transform = "translate(0,0) rotate(0)";
      if (stampUpRef.current) stampUpRef.current.style.opacity = 0;
      if (stampDownRef.current) stampDownRef.current.style.opacity = 0;
    }
    drag.current.dx = 0;
  }

  function finishSwipe(direction) {
    setExiting(true);
    setCastDirection(direction);
    const flyX = direction === "up" ? 700 : -700;
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${flyX}px, -40px) rotate(${direction === "up" ? 24 : -24}deg)`;
      cardRef.current.style.opacity = "0";
    }
    vote.castVote(direction);
    hapticTap(direction === "up" ? [10, 30, 10] : 12);
    if (direction === "up") burstConfetti();
    setTimeout(() => setRevealed(true), 280);
  }

  function tapVote(direction) {
    if (revealed || exiting) return;
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
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "aapkokyalagtahai-result.png";
    a.click();
  }

  const debateUrl = `/debate/${post.slug}`;

  return (
    <div className="relative">
      <div className="relative" style={{ aspectRatio: "3 / 4" }}>
        <CardPeek post={nextPost} />
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 rounded-card overflow-hidden shadow-card select-none"
          style={{ touchAction: "none", background: "var(--neutral-mid)", cursor: revealed ? "default" : "grab" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.prompt_en}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0))" }}
          />
          {category && (
            <div className="absolute top-3.5 left-3.5 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.45)" }}>
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
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-lg font-bold leading-snug">{post.prompt_en}</p>
            <p className="text-sm opacity-80 mt-1">{post.prompt_hi}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => tapVote("down")}
          aria-label="Thumbs down"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
          style={{ background: "var(--surface-1)", color: "var(--down-color)" }}
        >
          👎
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
          onClick={() => tapVote("up")}
          aria-label="Thumbs up"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
          style={{ background: "var(--surface-1)", color: "var(--up-color)" }}
        >
          👍
        </button>
      </div>
      <p className="text-center text-[11px] text-ink-muted mt-2 hidden sm:block">
        {lang === "en" ? "Tip: use ← / → arrow keys to vote" : "Tip: वोट के लिए ← / → arrow keys दबाएं"}
      </p>

      {revealed && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/50"
            onClick={() => {
              setRevealed(false);
              onAdvance?.();
            }}
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-20 rounded-sheet p-5 pb-7 max-w-3xl mx-auto"
            style={{ background: "var(--surface-1)", boxShadow: "0 -10px 30px rgba(0,0,0,0.25)" }}
          >
            <div className="w-9 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--gridline)" }} />
            <h3 className="text-base font-bold mb-3">
              {castDirection === "up" ? t.youSaidUp : t.youSaidDown} — {t.viewDebate.replace(" →", "")}
            </h3>
            <SplitBar pctUp={vote.pctUp} pctDown={vote.pctDown} total={vote.total} />
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 rounded-xl py-3 text-sm font-bold transition-transform duration-150 active:scale-95"
                style={{ background: "var(--chip-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                {t.share}
              </button>
              <Link
                href={debateUrl}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-center transition-transform duration-150 active:scale-95"
                style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
              >
                {t.viewDebate}
              </Link>
              <button
                onClick={() => {
                  setRevealed(false);
                  onAdvance?.();
                }}
                className="flex-1 rounded-xl py-3 text-sm font-bold transition-transform duration-150 active:scale-95"
                style={{ background: "var(--chip-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                {t.next}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
