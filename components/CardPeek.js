import { findCategory } from "@/lib/categories";

// The static "next card" peeking out from behind the active VoteCard —
// purely visual (no interactivity, no vote logic), scaled down and
// nudged back to sell the stacked-deck illusion. Swap positions with the
// real VoteCard once the user advances (VoteCard's own mount animation
// then handles the "promote to front" motion).
export default function CardPeek({ post }) {
  if (!post) return null;
  const category = findCategory(post.category);

  return (
    <div
      className="absolute inset-0 rounded-card overflow-hidden"
      style={{
        background: "var(--neutral-mid)",
        transform: "scale(0.94) translateY(14px)",
        boxShadow: "0 10px 30px rgba(11,11,11,0.12)",
      }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.image_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "rgba(11,11,11,0.28)" }} />
      {category && (
        <div
          className="absolute top-3.5 left-3.5 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm opacity-70"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          {category.label_en}
        </div>
      )}
    </div>
  );
}
