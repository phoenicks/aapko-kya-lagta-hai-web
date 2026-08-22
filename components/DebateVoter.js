"use client";

import { useState } from "react";
import Image from "next/image";
import { useVote } from "@/lib/useVote";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";
import { findCategory } from "@/lib/categories";
import { buildShareCardDataUrl, shareResultImage } from "@/lib/shareCard";
import { burstConfetti, hapticTap } from "@/lib/confetti";
import SplitBar from "./SplitBar";
import ShareButtons from "./ShareButtons";

// The single-debate card used on /debate/[slug] — tap-to-vote (no swipe
// deck here, it's a standalone page), with the split bar revealed inline
// once you've voted, plus share buttons.
export default function DebateVoter({ post, shareUrl }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const vote = useVote(post);
  const category = findCategory(post.category);
  // Same reasoning as VoteCard: capture what was actually tapped so the
  // label can't flip due to a slow/failed network response.
  const [castDirection, setCastDirection] = useState(null);

  function handleVote(direction) {
    setCastDirection(direction);
    vote.castVote(direction);
    hapticTap(direction === "up" ? [10, 30, 10] : 12);
    if (direction === "up") burstConfetti();
  }

  async function handleShareImage() {
    const dataUrl = await buildShareCardDataUrl({
      post,
      lang,
      direction: castDirection,
      pctUp: vote.pctUp,
      pctDown: vote.pctDown,
    });
    await shareResultImage({ dataUrl, text: `${post.prompt_en} — ${t.tagline}` });
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-0">
      <div
        className="relative rounded-card overflow-hidden shadow-card"
        style={{ background: "var(--neutral-mid)", aspectRatio: "3 / 4" }}
      >
        <Image
          src={post.image_url}
          alt={post.prompt_en}
          fill
          priority
          sizes="(min-width: 768px) 448px, 100vw"
          className="object-cover"
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
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h1 className="text-xl font-bold leading-snug">{post.prompt_en}</h1>
          <p className="text-sm opacity-80 mt-1">{post.prompt_hi}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => handleVote("up")}
          aria-label="Thumbs up"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
          style={{
            background: castDirection === "up" ? "var(--up-color)" : "var(--surface-1)",
            color: castDirection === "up" ? "#fff" : "var(--up-color)",
          }}
        >
          👍
        </button>
        <button
          onClick={() => handleVote("down")}
          aria-label="Thumbs down"
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-card transition-transform duration-150 active:scale-90"
          style={{
            background: castDirection === "down" ? "var(--down-color)" : "var(--surface-1)",
            color: castDirection === "down" ? "#fff" : "var(--down-color)",
          }}
        >
          👎
        </button>
      </div>

      {post.affiliate_url && (
        <div className="mt-4 text-center">
          <a
            href={post.affiliate_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold"
            style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
          >
            🛍️ Shop it on Amazon
          </a>
          <p className="text-[11px] text-ink-muted mt-1.5">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      )}

      {post.image_credit_name && (
        <p className="text-center text-[11px] text-ink-muted mt-3">
          Photo by{" "}
          {post.image_credit_url ? (
            <a href={post.image_credit_url} target="_blank" rel="noopener noreferrer" className="underline">
              {post.image_credit_name}
            </a>
          ) : (
            post.image_credit_name
          )}{" "}
          on {post.image_source === "unsplash" ? "Unsplash" : "Pexels"}
        </p>
      )}

      {castDirection && (
        <div className="mt-5 rounded-2xl p-4" style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold mb-3">
            {castDirection === "up" ? t.youSaidUp : t.youSaidDown}
          </p>
          <SplitBar pctUp={vote.pctUp} pctDown={vote.pctDown} total={vote.total} />
          <button
            onClick={handleShareImage}
            className="w-full mt-4 rounded-xl py-3 text-sm font-bold transition-transform duration-150 active:scale-95"
            style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
          >
            {t.share}
          </button>
        </div>
      )}

      <div className="mt-5">
        <ShareButtons url={shareUrl} text={`${post.prompt_en} — ${t.tagline}`} />
      </div>
    </div>
  );
}
