"use client";

import { useState } from "react";

// Shared voting logic: optimistic update + server confirmation via
// POST /api/vote (which itself calls the cast_vote() Postgres function,
// so re-voting or flipping a vote is handled correctly server-side too).
export function useVote(post) {
  const [upCount, setUpCount] = useState(post.up_count || 0);
  const [downCount, setDownCount] = useState(post.down_count || 0);
  const [direction, setDirection] = useState(null);
  const [pending, setPending] = useState(false);

  async function castVote(dir) {
    if (pending || direction === dir) return;
    setPending(true);

    const prevUp = upCount;
    const prevDown = downCount;
    const prevDir = direction;

    // optimistic UI
    setDirection(dir);
    if (dir === "up") {
      setUpCount((u) => u + 1);
      if (prevDir === "down") setDownCount((d) => Math.max(d - 1, 0));
    } else {
      setDownCount((d) => d + 1);
      if (prevDir === "up") setUpCount((u) => Math.max(u - 1, 0));
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, direction: dir }),
      });
      if (!res.ok) throw new Error("vote failed");
      const data = await res.json();
      setUpCount(data.upCount);
      setDownCount(data.downCount);
    } catch {
      // roll back on failure
      setUpCount(prevUp);
      setDownCount(prevDown);
      setDirection(prevDir);
    } finally {
      setPending(false);
    }
  }

  const total = upCount + downCount;
  const pctUp = total ? Math.round((upCount / total) * 100) : 0;
  const pctDown = total ? 100 - pctUp : 0;

  return { upCount, downCount, direction, pending, total, pctUp, pctDown, castVote };
}
