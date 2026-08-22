"use client";

import { useEffect, useRef } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

// One native ad slot, sized and snap-positioned exactly like a real debate
// card (see VoteCard/EndOfFeedCard) so it doesn't break the feed's scroll
// rhythm. Renders nothing at all — not even an empty placeholder — until
// both NEXT_PUBLIC_ADSENSE_CLIENT_ID and NEXT_PUBLIC_ADSENSE_SLOT_ID are
// set, so this ships safely today and starts showing real ads the moment
// AdSense approves the site and those two env vars are added on Vercel.
// No redeploy needed at that point — just add the env vars and redeploy
// once (env var changes require a redeploy to reach the running app).
export default function AdSlotCard() {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || !SLOT_ID || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error("AdSense push failed:", err);
    }
  }, []);

  if (!CLIENT_ID || !SLOT_ID) return null;

  return (
    <div
      className="relative w-full snap-start snap-always flex flex-col items-center justify-center"
      style={{ height: "100dvh", background: "var(--neutral-mid)" }}
    >
      <p className="text-[10px] uppercase tracking-wide text-ink-muted mb-2">Advertisement</p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: "420px", height: "70%" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
