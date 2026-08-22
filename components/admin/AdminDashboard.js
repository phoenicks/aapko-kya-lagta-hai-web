"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InsightsSection from "./InsightsSection";

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

  async function toggleStatus(post) {
    const nextStatus = post.status === "active" ? "disabled" : "active";
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p)));
    await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, status: nextStatus }),
    });
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
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
