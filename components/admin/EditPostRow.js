"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

const inputStyle = { background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" };

// Replaces a post's normal table row while it's being edited — covers every
// field an admin might need to fix: both prompts, category, the image URL
// (this is exactly what would have fixed the Amazon card issue by hand,
// without needing to delete and recreate it), and the affiliate link.
export default function EditPostRow({ post, colSpan, saving, error, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    promptEn: post.prompt_en || "",
    promptHi: post.prompt_hi || "",
    category: post.category || CATEGORIES[0].id,
    imageUrl: post.image_url || "",
    affiliateUrl: post.affiliate_url || "",
  });

  function set(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  return (
    <tr className="border-t" style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}>
      <td colSpan={colSpan} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
          <input
            value={draft.promptEn}
            onChange={(e) => set("promptEn", e.target.value)}
            placeholder="Prompt (English)"
            className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
            style={inputStyle}
          />
          <input
            value={draft.promptHi}
            onChange={(e) => set("promptHi", e.target.value)}
            placeholder="Prompt (Hindi)"
            className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
            style={inputStyle}
          />
          <select
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
            className="rounded-xl px-3 py-2 text-sm"
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label_en}
              </option>
            ))}
          </select>
          <input
            value={draft.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="Image URL (https://…)"
            className="rounded-xl px-3 py-2 text-sm"
            style={inputStyle}
          />
          <input
            value={draft.affiliateUrl}
            onChange={(e) => set("affiliateUrl", e.target.value)}
            placeholder="Affiliate link (optional — leave blank to remove)"
            className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
            style={inputStyle}
          />
        </div>

        {error && (
          <p className="text-xs mt-2" style={{ color: "var(--down-color)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className="rounded-full px-4 py-1.5 text-xs font-bold disabled:opacity-50"
            style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-full px-4 py-1.5 text-xs font-bold disabled:opacity-50"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
