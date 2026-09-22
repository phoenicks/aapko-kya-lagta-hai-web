import Link from "next/link";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const metadata = {
  title: "FAQ",
  description: "Common questions about Aapko Kya Lagta Hai, answered plainly.",
  alternates: { canonical: `${siteUrl}/faq` },
};

// Kept as plain question/answer text (not narrative prose like /about) on
// purpose — this is the page an AI answer engine is most likely to lift a
// direct quote from for a brand-name or "how does this work" query, and
// the FAQPage JSON-LD below mirrors this content exactly.
const FAQS = [
  {
    q: "What is Aapko Kya Lagta Hai?",
    a: "Aapko Kya Lagta Hai — literally “what do you think” — is a daily photo-and-question voting site. A new image and question drop every day across six categories (Campus & Hostel Life, Streetwear & Fits, Street Food & Chai, Pop Culture & OTT, Reels & Content, Startup & Hustle). You vote 👍 or 👎 and see how the crowd is leaning.",
  },
  {
    q: "How does voting work?",
    a: "Each debate is one photo and one yes/no-shaped question. Tap 👍 to agree or 👎 to disagree. You can change your vote on the same debate, but each anonymous visitor's vote is only counted once per debate.",
  },
  {
    q: "Do I need an account to vote or comment?",
    a: "No. There's no sign-up, login, or profile. Voting and commenting both work with no account — an anonymous cookie just remembers that a vote on a given debate is yours, so it doesn't get counted twice.",
  },
  {
    q: "Is Aapko Kya Lagta Hai free?",
    a: "Yes, the site is completely free to use, with no paywall or subscription.",
  },
  {
    q: "What languages is it available in?",
    a: "Every debate prompt is written in English and Hindi side by side, and the interface has an EN/हिं toggle.",
  },
  {
    q: "How often are new debates added?",
    a: "New debates are published daily across all six categories, sourced from a rotating pool of prompts paired with fresh photos.",
  },
  {
    q: "Where do the photos come from?",
    a: "Debate images are sourced from Unsplash and Pexels, with photographer credit shown on each debate's own page.",
  },
  {
    q: "Does the site track or store personal information?",
    a: "No accounts, no name or email required, and no third-party ad or analytics trackers. See the Privacy Policy for the full details on what's collected (an anonymous session cookie, and comment text if you choose to comment).",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <AppShell>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">FAQ</h1>
          <p className="text-sm text-ink-secondary mt-1">अक्सर पूछे जाने वाले सवाल</p>

          <div className="mt-8 space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <h2 className="text-base font-bold text-ink-primary">{q}</h2>
                <p className="text-sm leading-relaxed text-ink-secondary mt-1.5">{a}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-ink-secondary mt-8">
            Question not answered here? Visit{" "}
            <Link href="/contact" className="text-ink-primary underline underline-offset-2">
              Contact
            </Link>
            , or read the full{" "}
            <Link href="/privacy" className="text-ink-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
