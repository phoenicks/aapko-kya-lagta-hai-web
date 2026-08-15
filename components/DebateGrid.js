import Link from "next/link";
import { findCategory } from "@/lib/categories";

// Plain, crawlable grid of debate links — this is what lets Google (and
// people who'd rather scroll than swipe) discover every individual debate
// page. Renders real <a href> tags with real text, no JS required.
export default function DebateGrid({ posts, heading }) {
  if (!posts?.length) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {heading && (
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-4">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {posts.map((post) => {
          const category = findCategory(post.category);
          const total = (post.up_count || 0) + (post.down_count || 0);
          const pctUp = total ? Math.round((post.up_count / total) * 100) : null;
          return (
            <Link
              key={post.id}
              href={`/debate/${post.slug}`}
              className="group rounded-2xl overflow-hidden relative shadow-card"
              style={{ background: "var(--neutral-mid)", aspectRatio: "3 / 4" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.prompt_en}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                {category && (
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                    {category.label_en}
                  </span>
                )}
                <p className="text-sm font-semibold leading-snug line-clamp-3">{post.prompt_en}</p>
                {pctUp !== null && (
                  <p className="text-[11px] opacity-75 mt-1">
                    {pctUp}% 👍 · {total} votes
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
