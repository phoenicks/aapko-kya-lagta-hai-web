"use client";

import { useState } from "react";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

export default function CommentSection({ postId, initialComments }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const [comments, setComments] = useState(initialComments || []);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, authorName: name.trim(), body: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((c) => [data.comment, ...c]);
        setBody("");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-0 mt-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">
        {t.comments} {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-2 mb-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={40}
          className="rounded-full border px-4 py-2 text-sm bg-transparent"
          style={{ borderColor: "var(--border)", background: "var(--chip-bg)", color: "var(--text-primary)" }}
        />
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.commentPlaceholder}
            maxLength={280}
            className="flex-1 rounded-full border px-4 py-2 text-sm bg-transparent"
            style={{ borderColor: "var(--border)", background: "var(--chip-bg)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="rounded-full px-5 text-sm font-bold disabled:opacity-50"
            style={{ background: "var(--up-color)", color: "#fff" }}
          >
            {t.post}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.noComments}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "var(--up-color)" }}
              >
                {(c.author_name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold">{c.author_name}</p>
                <p className="text-sm text-ink-secondary break-words">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
