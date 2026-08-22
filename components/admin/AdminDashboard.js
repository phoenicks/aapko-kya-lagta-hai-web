"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InsightsSection from "./InsightsSection";
import PendingSubmissions from "./PendingSubmissions";
import AddProductCard from "./AddProductCard";
import EditPostRow from "./EditPostRow";

const STAT_LABELS = [
  { key: "activeUsers24h", label: "Active users (24h)" },
  { key: "activePosts", label: "Active posts" },
  { key: "totalPosts", label: "Total posts" },
  { key: "totalVotes", label: "Total votes" },
  { key: "totalComments", label: "Total comments" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");
  const [refreshingId, setRefreshingId] = useState(null);
  const [decidingId, setDecidingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [rowError, setRowError] = useState({ id: null, message: "" });

  async function load() {
    setLoading(true);
    const [statsRes, postsRes, insightsRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/posts"),
      fetch("/api/admin/insights"),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (postsRes.ok) setPosts((await postsRes.json()).posts || []);
    if (insightsRes.ok) setInsights(await insightsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Shared by the Enable/Disable toggle and the Pending-submission
  // Approve/Reject buttons: apply the change optimistically, but — unlike
  // the old version of this function — actually check whether the save
  // succeeded, and put the row back the way it was (with a visible error)
  // if it didn't. Without that check, a failed save silently looked
  // identical to a successful one, which is exactly how a "disabled" post
  // was still showing live on the site: the dashboard said Disabled, the
  // database never got the update.
  async function updateStatus(post, nextStatus) {
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p)));
    setRowError({ id: null, message: "" });
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, status: post.status } : p)));
        setRowError({ id: post.id, message: data.error || "Couldn't save — try again" });
        return false;
      }
      return true;
    } catch {
      setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, status: post.status } : p)));
      setRowError({ id: post.id, message: "Couldn't reach the server — try again" });
      return false;
    }
  }

  async function toggleStatus(post) {
    const nextStatus = post.status === "active" ? "disabled" : "active";
    await updateStatus(post, nextStatus);
  }

  async function decideSubmission(post, status) {
    setDecidingId(post.id);
    try {
      await updateStatus(post, status);
    } finally {
      setDecidingId(null);
    }
  }

  function startEdit(post) {
    setRowError({ id: null, message: "" });
    setEditingId(post.id);
  }

  async function saveEdit(post, draft) {
    setSavingEdit(true);
    setRowError({ id: null, message: "" });
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          promptEn: draft.promptEn,
          promptHi: draft.promptHi,
          category: draft.category,
          imageUrl: draft.imageUrl,
          affiliateUrl: draft.affiliateUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id: post.id, message: data.error || "Couldn't save — try again" });
        return;
      }
      setPosts((ps) =>
        ps.map((p) =>
          p.id === post.id
            ? {
                ...p,
                prompt_en: draft.promptEn,
                prompt_hi: draft.promptHi,
                category: draft.category,
                image_url: draft.imageUrl,
                affiliate_url: draft.affiliateUrl || null,
              }
            : p
        )
      );
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  }

  async function deletePost(post) {
    const confirmed = confirm(
      `Permanently delete "${post.prompt_en}"? This also deletes its votes and comments and can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(post.id);
    setRowError({ id: null, message: "" });
    try {
      const res = await fetch(`/api/admin/posts?id=${encodeURIComponent(post.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError({ id: post.id, message: data.error || "Couldn't delete — try again" });
        return;
      }
      setPosts((ps) => ps.filter((p) => p.id !== post.id));
    } finally {
      setDeletingId(null);
    }
  }

  async function refreshImage(post) {
    setRefreshingId(post.id);
    try {
      const res = await fetch("/api/admin/posts/refresh-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, image_url: data.post.image_url } : p)));
      } else {
        alert(data.error || "Couldn't fetch a new image");
      }
    } finally {
      setRefreshingId(null);
    }
  }

  async function runFetchNow() {
    setFetching(true);
    setFetchMsg("");
    try {
      const res = await fetch("/api/admin/trigger-fetch", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFetchMsg(`Added ${data.inserted} new debates (${data.failed} failed).`);
        load();
      } else {
        setFetchMsg(data.error || "Fetch failed");
      }
    } finally {
      setFetching(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-page px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">Aapko Kya Lagta Hai — Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={runFetchNow}
            disabled={fetching}
            className="rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
            style={{ background: "var(--up-color)", color: "#fff" }}
          >
            {fetching ? "Fetching…" : "Fetch new images now"}
          </button>
          <button
            onClick={logout}
            className="rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
          >
            Log out
          </button>
        </div>
      </div>

      {fetchMsg && (
        <p className="text-sm mb-4 text-ink-secondary">{fetchMsg}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {STAT_LABELS.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl p-4"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            <p className="text-2xl font-extrabold">{stats ? stats[s.key] : "—"}</p>
            <p className="text-xs text-ink-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {!loading && (
        <PendingSubmissions
          posts={posts.filter((p) => p.status === "pending")}
          onDecide={decideSubmission}
          decidingId={decidingId}
        />
      )}

      <AddProductCard onAdded={load} />

      <InsightsSection data={insights} loading={loading} />

      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">
        Posts
      </h2>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted" style={{ background: "var(--chip-bg)" }}>
                <th className="p-3">Image</th>
                <th className="p-3">Prompt</th>
                <th className="p-3">Category</th>
                <th className="p-3">Votes (👍/👎)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Enable / disable</th>
                <th className="p-3">Image</th>
                <th className="p-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {posts.filter((post) => post.status !== "pending").map((post) =>
                editingId === post.id ? (
                  <EditPostRow
                    key={post.id}
                    post={post}
                    colSpan={8}
                    saving={savingEdit}
                    error={rowError.id === post.id ? rowError.message : ""}
                    onSave={(draft) => saveEdit(post, draft)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={post.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.image_url} alt="" className="w-12 h-16 object-cover rounded-lg" />
                    </td>
                    <td className="p-3 max-w-xs">
                      <a
                        href={`/debate/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {post.prompt_en}
                      </a>
                      {rowError.id === post.id && (
                        <p className="text-xs mt-1" style={{ color: "var(--down-color)" }}>
                          {rowError.message}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-ink-secondary">{post.category}</td>
                    <td className="p-3 text-ink-secondary">
                      {post.up_count} / {post.down_count}
                    </td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: post.status === "active" ? "rgba(42,120,214,0.15)" : "rgba(227,73,72,0.15)",
                          color: post.status === "active" ? "var(--up-color)" : "var(--down-color)",
                        }}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleStatus(post)}
                        className="rounded-full px-3 py-1.5 text-xs font-bold"
                        style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
                      >
                        {post.status === "active" ? "Disable" : "Enable"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => refreshImage(post)}
                        disabled={refreshingId === post.id}
                        className="rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                        style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
                        title="Pull a different Unsplash/Pexels image for this post, keeping its prompt, votes, and comments"
                      >
                        {refreshingId === post.id ? "Fetching…" : "🔄 New image"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(post)}
                          className="rounded-full px-3 py-1.5 text-xs font-bold"
                          style={{ background: "var(--chip-bg)", border: "1px solid var(--border)" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deletePost(post)}
                          disabled={deletingId === post.id}
                          className="rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                          style={{ background: "rgba(227,73,72,0.12)", color: "var(--down-color)" }}
                        >
                          {deletingId === post.id ? "…" : "🗑 Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
