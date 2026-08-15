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
export default function SplitBar({ pctUp, pctDown, total }) {
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

  return (
    <div>
      <div
        className="h-9 rounded-xl overflow-hidden flex border"
        style={{ background: "var(--neutral-mid)", borderColor: "var(--border)" }}
      >
        <div
          className="h-full flex items-center pl-2.5 text-white text-xs font-bold whitespace-nowrap transition-[width] duration-100 ease-out"
          style={{ width: `${display.up}%`, background: "var(--up-color)" }}
        >
          {display.up >= 12 ? `${display.up}%` : ""}
        </div>
        <div
          className="h-full flex items-center justify-end pr-2.5 text-white text-xs font-bold whitespace-nowrap transition-[width] duration-100 ease-out ml-auto"
          style={{ width: `${display.down}%`, background: "var(--down-color)" }}
        >
          {display.down >= 12 ? `${display.down}%` : ""}
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-ink-muted mt-1.5">
        <span>{t.agree}</span>
        <span>{t.disagree}</span>
      </div>
      <p className="text-xs text-ink-secondary mt-2.5">{t.verdict(pctUp, total)}</p>
    </div>
  );
}
