"use client";

import { useMemo, useState } from "react";
import CategoryChips from "./CategoryChips";
import VoteCard from "./VoteCard";
import DebateGrid from "./DebateGrid";
import { useLangTheme } from "./LangThemeProvider";
import { STR } from "@/lib/i18n";

export default function HomeFeed({ initialPosts }) {
  const { lang } = useLangTheme();
  const t = STR[lang];
  const [activeCat, setActiveCat] = useState("all");
  const [index, setIndex] = useState(0);

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? initialPosts
        : initialPosts.filter((p) => p.category === activeCat),
    [initialPosts, activeCat]
  );

  const current = filtered.length ? filtered[index % filtered.length] : null;

  function handleCategoryChange(cat) {
    setActiveCat(cat);
    setIndex(0);
  }

  return (
    <>
      <CategoryChips active={activeCat} onChange={handleCategoryChange} />

      <div className="px-4 sm:px-6 max-w-md mx-auto">
        {current ? (
          <VoteCard
            key={current.id}
            post={current}
            onAdvance={() => setIndex((i) => i + 1)}
          />
        ) : (
          <p className="text-center text-ink-muted py-16 text-sm">
            No debates in this category yet — check back soon.
          </p>
        )}
      </div>

      <DebateGrid
        posts={initialPosts}
        heading={lang === "en" ? "More debates" : "और debates"}
      />
    </>
  );
}
