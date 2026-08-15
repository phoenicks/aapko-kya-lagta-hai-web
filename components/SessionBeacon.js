"use client";

import { useEffect } from "react";

// Fires one lightweight heartbeat per browser tab session so /admin can show
// a rough active-users count. Not analytics tracking beyond that.
export default function SessionBeacon() {
  useEffect(() => {
    const key = "apk_tracked_this_session";
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;

    fetch("/api/track", { method: "POST" })
      .then(() => window.sessionStorage.setItem(key, "1"))
      .catch(() => {});
  }, []);

  return null;
}
