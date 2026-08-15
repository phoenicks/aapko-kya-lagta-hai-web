"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl p-6 shadow-card"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-lg font-extrabold mb-1">Aapko Kya Lagta Hai — Admin</h1>
        <p className="text-sm text-ink-secondary mb-5">Enter the admin password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          className="w-full rounded-xl border px-4 py-2.5 text-sm mb-3"
          style={{ borderColor: "var(--border)", background: "var(--chip-bg)", color: "var(--text-primary)" }}
        />
        {error && <p className="text-xs mb-3" style={{ color: "var(--down-color)" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
          style={{ background: "var(--text-primary)", color: "var(--surface-1)" }}
        >
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
