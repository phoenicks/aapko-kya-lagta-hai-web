"use client";

import { useEffect, useState } from "react";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

// The animated diverging vote-split bar — blue (agree) vs red (disagree),
// per the validated Aapko Kya Lagta Hai palette (dataviz skill, blue/red diverging
// pair, both checks PASS in light & dark).
export default function SplitBar({ pctUp, pctDown, total }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const [animated, setAnimated] = useState({ up: 0, down: 0 });

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated({ up: pctUp, down: pctDown }));
    });
    return () => cancelAnimationFrame(raf);
  }, [pctUp, pctDown]);

  return (
    <div>
      <div
        className="h-9 rounded-xl overflow-hidden flex border"
        style={{ background: "var(--neutral-mid)", borderColor: "var(--border)" }}
      >
        <div
          className="h-full flex items-center pl-2.5 text-white text-xs font-bold whitespace-nowrap transition-all duration-700 ease-out"
          style={{ width: `${animated.up}%`, background: "var(--up-color)" }}
        >
          {animated.up >= 12 ? `${pctUp}%` : ""}
        </div>
        <div
          className="h-full flex items-center justify-end pr-2.5 text-white text-xs font-bold whitespace-nowrap transition-all duration-700 ease-out ml-auto"
          style={{ width: `${animated.down}%`, background: "var(--down-color)" }}
        >
          {animated.down >= 12 ? `${pctDown}%` : ""}
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
