"use client";

import { useEffect, useRef, useState } from "react";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// The animated diverging vote-split bar — blue (agree) vs red (disagree),
// per the validated Aapko Kya Lagta Hai palette (dataviz skill, blue/red diverging
// pair, both checks PASS in light & dark). Both the bar width AND the
// percentage numbers count up together over ~700ms.
// `compact`: slimmer rendering (shorter bar, no agree/disagree legend row,
// light text) for use inside InlineResultOverlay, which sits on top of a
// photo rather than the page background — default false leaves DebateVoter's
// usage untouched.
export default function SplitBar({ pctUp, pctDown, total, compact = false }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const [display, setDisplay] = useState({ up: 0, down: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    // small delay so the sheet has finished sliding up before the count starts
    const kickoff = requestAnimationFrame(() => {
      function tick(now) {
        const elapsed = now - start;
        const p = easeOutCubic(Math.min(elapsed / duration, 1));
        setDisplay({ up: Math.round(pctUp * p), down: Math.round(pctDown * p) });
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(kickoff);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pctUp, pctDown]);

  const showPct = compact ? 16 : 12;

  return (
    <div>
      <div
        className={`${compact ? "h-6" : "h-9"} rounded-xl overflow-hidden flex border`}
        style={{
          background: compact ? "rgba(255,255,255,0.18)" : "var(--neutral-mid)",
          borderColor: compact ? "rgba(255,255,255,0.28)" : "var(--border)",
        }}
      >
        <div
          className={`h-full flex items-center ${compact ? "pl-2" : "pl-2.5"} text-white text-xs font-bold whitespace-nowrap transition-[width] duration-100 ease-out`}
          style={{ width: `${display.up}%`, background: "var(--up-color)" }}
        >
          {display.up >= showPct ? `${display.up}%` : ""}
        </div>
        <div
          className={`h-full flex items-center justify-end ${compact ? "pr-2" : "pr-2.5"} text-white text-xs font-bold whitespace-nowrap transition-[width] duration-100 ease-out ml-auto`}
          style={{ width: `${display.down}%`, background: "var(--down-color)" }}
        >
          {display.down >= showPct ? `${display.down}%` : ""}
        </div>
      </div>
      {!compact && (
        <div className="flex justify-between text-[11px] text-ink-muted mt-1.5">
          <span>{t.agree}</span>
          <span>{t.disagree}</span>
        </div>
      )}
      <p className={`text-xs mt-2.5 ${compact ? "text-white/85" : "text-ink-secondary"}`}>
        {t.verdict(pctUp, total)}
      </p>
    </div>
  );
}
