"use client";

import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";
import SplitBar from "./SplitBar";

// Replaces the old full-viewport "thank you" bottom sheet. Sits inline on
// the card itself (in the same spot the vote controls just were), doesn't
// block scrolling or dim the rest of the screen, and the card auto-advances
// shortly after this appears (see VoteCard's finishSwipe/showOverlay timer)
// — so this only needs to communicate the result and offer a share action,
// not a "next" button.
export default function InlineResultOverlay({ direction, pctUp, pctDown, total, onShare }) {
  const { lang } = useLangTheme();
  const t = STR[lang];

  return (
    <div
      className="absolute inset-x-0 bottom-0 px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0))" }}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold mb-1.5">
            {direction === "up" ? t.youSaidUp : t.youSaidDown}
          </p>
          <SplitBar pctUp={pctUp} pctDown={pctDown} total={total} compact />
        </div>
        <button
          onClick={onShare}
          aria-label={t.share}
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-150 active:scale-90"
          style={{ background: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(6px)" }}
        >
          ↗
        </button>
      </div>
    </div>
  );
}
