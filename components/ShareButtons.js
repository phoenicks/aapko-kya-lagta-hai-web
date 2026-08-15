"use client";

import { useState } from "react";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

export default function ShareButtons({ url, text }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const [copied, setCopied] = useState(false);

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const btnClass =
    "px-3.5 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5";
  const btnStyle = {
    background: "var(--chip-bg)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a href={waHref} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
        💬 {t.whatsapp}
      </a>
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
        𝕏 {t.shareOnX}
      </a>
      <button onClick={copyLink} className={btnClass} style={btnStyle}>
        🔗 {copied ? t.linkCopied : t.copyLink}
      </button>
    </div>
  );
}
