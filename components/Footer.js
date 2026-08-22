import Link from "next/link";

const LINKS = [
  { href: "/submit", label: "Submit a debate" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

// Shared site-wide footer nav. Used on every page (not just the homepage)
// so About/Privacy/Terms/Contact stay reachable from wherever someone
// lands — a debate shared on WhatsApp, a category page from search, etc.
//
// `compact` drops the outer padding/credit line and just renders the link
// row, for placing inside EndOfFeedCard (which already has its own
// "Images sourced from..." line and sits inside the feed's own scroll
// container rather than the page's normal document flow).
export default function Footer({ compact = false }) {
  const nav = (
    <nav className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium ${compact ? "" : "mb-3"}`}>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-ink-muted underline-offset-2 hover:text-ink-secondary hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  if (compact) return nav;

  return (
    <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center text-ink-muted">
      {nav}
      <p className="text-xs">
        Aapko Kya Lagta Hai — आपको क्या लगता है? · Images sourced from Unsplash &amp; Pexels, credited on each debate page.
      </p>
    </footer>
  );
}
