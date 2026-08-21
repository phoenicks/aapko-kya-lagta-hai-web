"use client";

import Link from "next/link";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

// `overlay` renders a lighter-weight version meant to float on top of a
// full-bleed image (the home feed) — white text, translucent pill buttons,
// tighter spacing — instead of the solid-background bar used on other pages.
export default function Header({ overlay = false }) {
  const { lang, theme, toggleLang, toggleTheme } = useLangTheme();
  const t = STR[lang];

  const btnStyle = overlay
    ? { background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.3)", color: "#fff", backdropFilter: "blur(6px)" }
    : { background: "var(--chip-bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <header
      className={`flex items-center justify-between px-4 sm:px-6 pb-3 max-w-3xl mx-auto ${
        overlay ? "pt-[calc(env(safe-area-inset-top)+0.75rem)]" : "pt-[calc(env(safe-area-inset-top)+1rem)] pb-4"
      }`}
    >
      <Link href="/" className="flex flex-col leading-tight">
        <span
          className={`text-lg sm:text-xl font-extrabold tracking-tight leading-tight ${overlay ? "" : "text-ink-primary"}`}
          style={overlay ? { color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.35)" } : undefined}
        >
          Aapko Kya Lagta Hai
        </span>
        <span
          className={`text-xs ${overlay ? "" : "text-ink-secondary"}`}
          style={overlay ? { color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.35)" } : undefined}
        >
          {t.tagline}
        </span>
      </Link>
      <div className="flex gap-2">
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          className="w-9 h-9 rounded-full border text-xs font-bold flex items-center justify-center"
          style={btnStyle}
        >
          {lang === "en" ? "EN" : "हि"}
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full border text-sm flex items-center justify-center"
          style={btnStyle}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
