"use client";

import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";
import Footer from "./Footer";

// A real, full-screen, snap-aligned section shown at the end of the
// infinite-scroll feed — either "you've reached the end of what's loaded"
// or "this category is empty" — so scrolling never dead-ends on blank
// space or a jarring hard stop.
export default function EndOfFeedCard({ variant = "end" }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const isEmpty = variant === "empty";

  return (
    <div
      className="relative w-full snap-start snap-always flex flex-col items-center justify-center text-center px-8"
      style={{ height: "100dvh" }}
    >
      <div className="text-5xl mb-4" aria-hidden="true">
        {isEmpty ? "🗂️" : "🎉"}
      </div>
      <p className="text-lg font-bold mb-2 text-ink-primary">
        {isEmpty ? t.noDebatesInCategory : t.caughtUp}
      </p>
      {!isEmpty && <p className="text-sm text-ink-secondary">{t.checkBackTomorrow}</p>}
      {!isEmpty && (
        <>
          <p className="text-xs text-ink-muted mt-8 max-w-xs">
            Images sourced from Unsplash &amp; Pexels, credited on each debate page.
          </p>
          {/* This card lives inside the feed's own scroll container, so
              (unlike the page-level footer) it's actually reachable by
              swiping/scrolling all the way through — the right place for
              About/Privacy/Terms/Contact to live on the homepage. */}
          <div className="mt-4">
            <Footer compact />
          </div>
        </>
      )}
    </div>
  );
}
