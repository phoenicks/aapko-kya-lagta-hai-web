"use client";

import Link from "next/link";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

export default function Header() {
  const { lang, theme, toggleLang, toggleTheme } = useLangTheme();
  const t = STR[lang];

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-3xl mx-auto">
      <Link href="/" className="flex flex-col leading-tight">
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-ink-primary leading-tight">
          Aapko Kya Lagta Hai
        </span>
        <span className="text-xs text-ink-secondary">{t.tagline}</span>
      </Link>
      <div className="flex gap-2">
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          className="w-9 h-9 rounded-full border text-xs font-bold flex items-center justify-center"
          style={{ background: "var(--chip-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          {lang === "en" ? "EN" : "हि"}
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full border text-sm flex items-center justify-center"
          style={{ background: "var(--chip-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
