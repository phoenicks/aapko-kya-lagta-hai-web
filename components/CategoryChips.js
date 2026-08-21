"use client";

import { CATEGORIES } from "@/lib/categories";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

// `overlay` renders translucent white pills for use on top of a full-bleed
// image (the home feed) instead of the solid chip styling used elsewhere.
export default function CategoryChips({ active, onChange, overlay = false }) {
  const { lang } = useLangTheme();
  const t = STR[lang];

  function chipStyle(isActive) {
    if (overlay) {
      return isActive
        ? { background: "#fff", color: "#0b0b0b", borderColor: "transparent" }
        : { background: "rgba(255,255,255,0.16)", color: "#fff", borderColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(6px)" };
    }
    return {
      background: isActive ? "var(--chip-bg-active)" : "var(--chip-bg)",
      color: isActive ? "var(--chip-text-active)" : "var(--text-secondary)",
      borderColor: isActive ? "transparent" : "var(--border)",
    };
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-3 max-w-3xl mx-auto">
      <button
        onClick={() => onChange("all")}
        className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
        style={chipStyle(active === "all")}
      >
        {t.allCats}
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
          style={chipStyle(active === c.id)}
        >
          {lang === "en" ? c.label_en : c.label_hi}
        </button>
      ))}
    </div>
  );
}
