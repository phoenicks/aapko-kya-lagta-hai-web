import Link from "next/link";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";
const CONTACT_EMAIL = "contact@aapkokyalagtahai.com";
const LAST_UPDATED = "21 August 2026";

export const metadata = {
  title: "Privacy Policy",
  description: "How Aapko Kya Lagta Hai handles your information.",
  alternates: { canonical: `${siteUrl}/privacy` },
};

function H2({ children }) {
  return <h2 className="text-base font-bold text-ink-primary mt-8 mb-2">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">Privacy Policy</h1>
          <p className="text-xs text-ink-muted mt-1">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6 text-sm leading-relaxed text-ink-secondary">
            <p>
              Aapko Kya Lagta Hai (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the site&rdquo;)
              is built around one idea: you shouldn&rsquo;t have to hand over any personal
              information to vote on whether an oversized fit is main-character energy. This
              page explains, plainly, what we actually collect and why.
            </p>

            <H2>There are no accounts</H2>
            <p>
              You never sign up, log in, or give us a name or email address just to use the
              site. There&rsquo;s no password, no profile, nothing to reset.
            </p>

            <H2>What we do collect</H2>
            <p>
              <strong className="text-ink-primary">An anonymous session cookie.</strong> When
              you first visit, we set a first-party cookie (<code>apk_sid</code>) containing a
              random ID — not your name, email, or anything that identifies you personally.
              It&rsquo;s used only to (a) recognize that a vote on a debate is yours, so you can
              change your mind instead of it counting twice, and (b) show a rough
              &ldquo;how many people are around right now&rdquo; number on our internal
              dashboard. It lasts up to a year, and you can clear it anytime via your browser
              settings.
            </p>
            <p>
              <strong className="text-ink-primary">Comments, if you post one.</strong> The
              comment text, and a display name if you choose to type one in — it defaults to
              &ldquo;Anonymous&rdquo; if you don&rsquo;t. We don&rsquo;t require or ask for an
              email address to comment. Comments are public once posted, and we can hide any
              comment that breaks our{" "}
              <Link href="/terms" className="text-ink-primary underline underline-offset-2">
                Terms
              </Link>
              .
            </p>
            <p>
              <strong className="text-ink-primary">Standard hosting logs.</strong> Like
              essentially every website, our hosting provider automatically logs things like IP
              address, browser type, and request timestamps for security and operational
              purposes. We don&rsquo;t use this to build a profile of you.
            </p>
            <p>
              <strong className="text-ink-primary">Anything you email us.</strong> If you write
              to {CONTACT_EMAIL}, we&rsquo;ll have whatever you send — obviously.
            </p>

            <H2>What we don&rsquo;t do</H2>
            <p>
              No third-party analytics or advertising trackers (no Google Analytics, no ad
              pixels, no cross-site tracking cookies) run on the site today. We don&rsquo;t sell
              your information, because we don&rsquo;t collect enough of it to sell. We
              don&rsquo;t collect payment information — the site is free and has nothing to
              buy.
            </p>

            <H2>Images</H2>
            <p>
              Debate photos are sourced from Unsplash and Pexels, credited on each debate page.
              Loading a debate page loads that image from Unsplash&rsquo;s or Pexels&rsquo;s own
              servers, which are separate companies with their own privacy practices — see{" "}
              <a
                href="https://unsplash.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-ink-primary underline underline-offset-2"
              >
                Unsplash&rsquo;s
              </a>{" "}
              and{" "}
              <a
                href="https://www.pexels.com/privacy-policy/"
                target="_blank"
                rel="noreferrer"
                className="text-ink-primary underline underline-offset-2"
              >
                Pexels&rsquo;s
              </a>{" "}
              policies if you&rsquo;re curious.
            </p>

            <H2>Your choices</H2>
            <p>
              Because we don&rsquo;t tie anything to your name or email, we usually can&rsquo;t
              look up &ldquo;your&rdquo; data on request the way a site with accounts could. If
              you&rsquo;d like a comment you posted removed, email us the comment text or a link
              to it and we&rsquo;ll take it down. You can also block or clear cookies at any
              time in your browser — the site still works, you&rsquo;ll just occasionally be
              able to vote on the same debate more than once.
            </p>

            <H2>Children</H2>
            <p>
              The site isn&rsquo;t directed at children under 13, and we don&rsquo;t knowingly
              collect information from anyone under 13. If you believe a child has shared
              information with us (e.g. in a comment), email us and we&rsquo;ll remove it.
            </p>

            <H2>Changes to this policy</H2>
            <p>
              We may update this page as the site changes. If we make a material change,
              we&rsquo;ll update the date at the top. Checking back occasionally is on you.
            </p>

            <H2>Contact</H2>
            <p>
              Questions about this policy?{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-ink-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
