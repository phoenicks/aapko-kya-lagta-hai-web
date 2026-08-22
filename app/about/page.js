import Link from "next/link";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const metadata = {
  title: "About",
  description: "What Aapko Kya Lagta Hai is, and why it exists.",
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">About</h1>
          <p className="text-sm text-ink-secondary mt-1">आपको क्या लगता है के बारे में</p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-secondary">
            <p>
              <strong className="text-ink-primary">Aapko Kya Lagta Hai</strong> — literally,
              &ldquo;what do you think&rdquo; — is a daily dose of red flags, cursed rooms,
              fit checks, and AI chaos. One photo, one question, two buttons. Swipe 👍 or 👎
              and see if the internet agrees with you.
            </p>
            <p>
              New debates land every day across six categories — Campus &amp; Hostel Life,
              Streetwear &amp; Fits, Street Food &amp; Chai, Pop Culture &amp; OTT, Reels &amp;
              Content, and Startup &amp; Hustle — because that&rsquo;s roughly the full range
              of things worth arguing about at 1am with your group chat.
            </p>
            <p>
              Every debate is written in English and Hindi side by side, because that&rsquo;s
              genuinely how most of our conversations actually happen. No account needed —
              you just show up, vote, and move on with your day.
            </p>
            <p>
              This is an independent, small-scale project — no big team, no funding round,
              just someone who thought the internet needed a place to settle arguments about
              oversized fits and 3am hostel snacks.
            </p>
            <p>
              Got a debate idea, spotted a bug, or just want to say hi? Head over to the{" "}
              <Link href="/contact" className="text-ink-primary underline underline-offset-2">
                Contact page
              </Link>
              .
            </p>
          </div>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
