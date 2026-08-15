"use client";

import { CATEGORIES } from "@/lib/categories";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

export default function CategoryChips({ active, onChange }) {
  const { lang } = useLangTheme();
  const t = STR[lang];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-3 max-w-3xl mx-auto">
      <button
        onClick={() => onChange("all")}
        className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
        style={{
          background: active === "all" ? "var(--chip-bg-active)" : "var(--chip-bg)",
          color: active === "all" ? "var(--chip-text-active)" : "var(--text-secondary)",
          borderColor: active === "all" ? "transparent" : "var(--border)",
        }}
      >
        {t.allCats}
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
          style={{
            background: active === c.id ? "var(--chip-bg-active)" : "var(--chip-bg)",
            color: active === c.id ? "var(--chip-text-active)" : "var(--text-secondary)",
            borderColor: active === c.id ? "transparent" : "var(--border)",
          }}
        >
          {lang === "en" ? c.label_en : c.label_hi}
        </button>
      ))}
    </div>
  );
}
