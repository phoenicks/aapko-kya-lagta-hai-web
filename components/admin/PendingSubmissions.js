"use client";

import { findCategory } from "@/lib/categories";

// User-submitted debates land here (status:'pending') until an admin
// approves (-> active, goes live) or rejects (-> disabled, stays hidden but
// isn't deleted, matching how the rest of the dashboard treats status).
export default function PendingSubmissions({ posts, onDecide, decidingId }) {
  if (posts.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">
          Pending submissions
        </h2>
        <p className="text-sm text-ink-muted">No submissions waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">
        Pending submissions ({posts.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((post) => {
          const category = findCategory(post.category);
          const deciding = decidingId === post.id;
          return (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="" className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">
                  {category?.label_en || post.category}
                </p>
                <p className="text-sm font-semibold text-ink-primary line-clamp-2">{post.prompt_en}</p>
                <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">{post.prompt_hi}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onDecide(post, "active")}
                    disabled={deciding}
                    className="flex-1 rounded-full py-1.5 text-xs font-bold disabled:opacity-50"
                    style={{ background: "var(--up-color)", color: "#fff" }}
                  >
                    {deciding ? "…" : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => onDecide(post, "disabled")}
                    disabled={deciding}
                    className="flex-1 rounded-full py-1.5 text-xs font-bold disabled:opacity-50"
                    style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
                  >
                    {deciding ? "…" : "✕ Reject"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
