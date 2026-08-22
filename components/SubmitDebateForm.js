"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

const MAX_LEN = 140;

export default function SubmitDebateForm() {
  const router = useRouter();
  const { lang } = useLangTheme();
  const t = STR[lang];

  const [promptEn, setPromptEn] = useState("");
  const [promptHi, setPromptHi] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imgOk, setImgOk] = useState(null); // null = untested, true/false = preview result

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptEn, promptHi, category, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — try again.");
        return;
      }
      setSuccess(true);
      setPromptEn("");
      setPromptHi("");
      setImageUrl("");
      setImgOk(null);
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <p className="text-3xl mb-2" aria-hidden="true">🎉</p>
        <p className="font-bold text-ink-primary mb-1">{t.submitSuccessTitle}</p>
        <p className="text-sm text-ink-secondary mb-5">{t.submitSuccessBody}</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setSuccess(false)}
            className="rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
          >
            {t.submitAnother}
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
          >
            {t.backToFeed}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-1.5">
          {t.submitPromptEnLabel}
        </label>
        <input
          type="text"
          required
          maxLength={MAX_LEN}
          value={promptEn}
          onChange={(e) => setPromptEn(e.target.value)}
          placeholder={t.submitPromptEnPlaceholder}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <p className="text-[11px] text-ink-muted mt-1">{promptEn.length}/{MAX_LEN}</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-1.5">
          {t.submitPromptHiLabel}
        </label>
        <input
          type="text"
          maxLength={MAX_LEN}
          value={promptHi}
          onChange={(e) => setPromptHi(e.target.value)}
          placeholder={t.submitPromptHiPlaceholder}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-1.5">
          {t.submitCategoryLabel}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === "en" ? c.label_en : c.label_hi}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-1.5">
          {t.submitImageLabel}
        </label>
        <input
          type="url"
          required
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImgOk(null);
          }}
          placeholder="https://…/photo.jpg"
          className="w-full rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <p className="text-[11px] text-ink-muted mt-1">{t.submitImageHint}</p>
        {imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="mt-2 w-full max-h-48 object-cover rounded-xl"
            style={{ background: "var(--chip-bg)", display: imgOk === false ? "none" : "block" }}
            onLoad={() => setImgOk(true)}
            onError={() => setImgOk(false)}
          />
        )}
        {imgOk === false && <p className="text-xs mt-1" style={{ color: "var(--down-color)" }}>{t.submitImagePreviewFailed}</p>}
      </div>

      {error && (
        <p className="text-sm rounded-xl px-3.5 py-2.5" style={{ background: "rgba(227,73,72,0.12)", color: "var(--down-color)" }}>
          {error}
        </p>
      )}

      <p className="text-xs text-ink-muted">{t.submitModerationNote}</p>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl py-3 text-sm font-bold disabled:opacity-50"
        style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
      >
        {submitting ? t.submitSubmitting : t.submitSubmit}
      </button>
    </form>
  );
}
