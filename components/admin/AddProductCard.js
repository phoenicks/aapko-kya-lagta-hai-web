"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

const inputStyle = { background: "var(--chip-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" };

// Manually add an Amazon Associates product card — goes live immediately
// (status: 'active') since an admin is the one creating it. See
// app/api/admin/posts/product/route.js for why this is manual rather than
// pulling from Amazon's Product Advertising API.
export default function AddProductCard({ onAdded }) {
  const [promptEn, setPromptEn] = useState("");
  const [promptHi, setPromptHi] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/posts/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptEn, promptHi, category, imageUrl, affiliateUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Added — live now.");
        setMsgOk(true);
        setPromptEn("");
        setPromptHi("");
        setImageUrl("");
        setAffiliateUrl("");
        onAdded?.();
      } else {
        setMsg(data.error || "Couldn't add it");
        setMsgOk(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 mb-8" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-bold mb-1">Add a product debate (Amazon Associates)</p>
      <p className="text-xs text-ink-muted mb-3">
        Goes live immediately. Shows a disclosed &ldquo;Shop it&rdquo; button on the debate card.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Prompt (English) — e.g. Flex or flop?"
          value={promptEn}
          onChange={(e) => setPromptEn(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
          style={inputStyle}
        />
        <input
          placeholder="Prompt (Hindi) — optional"
          value={promptHi}
          onChange={(e) => setPromptHi(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
          style={inputStyle}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          required
          type="url"
          placeholder="Product image URL (https://…)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm"
          style={inputStyle}
        />
        <input
          required
          type="url"
          placeholder="Amazon Associates link (with your ?tag=)"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm sm:col-span-2"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50 sm:col-span-2"
          style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
        >
          {saving ? "Adding…" : "Add & publish"}
        </button>
      </form>
      {msg && (
        <p className="text-xs mt-2" style={{ color: msgOk ? "var(--text-secondary)" : "var(--down-color)" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
