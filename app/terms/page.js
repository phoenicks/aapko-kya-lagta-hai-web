import Link from "next/link";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";
const CONTACT_EMAIL = "contact@aapkokyalagtahai.com";
const LAST_UPDATED = "21 August 2026";

export const metadata = {
  title: "Terms of Service",
  description: "The rules for using Aapko Kya Lagta Hai.",
  alternates: { canonical: `${siteUrl}/terms` },
};

function H2({ children }) {
  return <h2 className="text-base font-bold text-ink-primary mt-8 mb-2">{children}</h2>;
}

export default function TermsPage() {
  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">Terms of Service</h1>
          <p className="text-xs text-ink-muted mt-1">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6 text-sm leading-relaxed text-ink-secondary">
            <p>
              These are the ground rules for using Aapko Kya Lagta Hai (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;the site&rdquo;). By using the site, you agree to them.
              If you don&rsquo;t agree, please don&rsquo;t use the site.
            </p>

            <H2>What the site is</H2>
            <p>
              A free, no-account-needed platform for voting on daily &ldquo;debates&rdquo;
              (an image plus a bilingual prompt) with a 👍 or 👎, browsing by category, and
              leaving short comments. That&rsquo;s it — there&rsquo;s nothing to buy and no
              subscription.
            </p>

            <H2>Who can use it</H2>
            <p>
              You must be at least 13 years old to use this site. If you&rsquo;re under 18,
              please only use it with the involvement of a parent or guardian where your local
              law requires it.
            </p>

            <H2>Comments and content you post</H2>
            <p>
              When you post a comment or submit your own debate (prompt + image link), you&rsquo;re
              solely responsible for it, and you grant us a non-exclusive, royalty-free license to
              display it on the site (and remove it, at our discretion). Submitted debates are
              reviewed before they go live, and we&rsquo;re not obligated to publish any
              submission. Please don&rsquo;t post or submit anything that is illegal, harassing,
              hateful, sexually explicit, involves minors in any inappropriate way, impersonates
              someone else, spams, or infringes someone else&rsquo;s rights — including images you
              don&rsquo;t have the right to use. We can hide or remove any comment or submitted
              debate, and can limit or end anyone&rsquo;s access to the site, at any time, without
              needing to explain why.
            </p>

            <H2>Acceptable use</H2>
            <p>
              Please don&rsquo;t: scrape or hammer the site or its API in a way that degrades it
              for others; try to manipulate vote counts (bots, vote farms, script-driven
              spam-voting); attempt to bypass any security or rate-limiting measure; or use the
              site to distribute malware or attack anyone.
            </p>

            <H2>Affiliate links and ads</H2>
            <p>
              Some debate cards include a &ldquo;Shop it&rdquo; link to a product on Amazon. As
              an Amazon Associate, we earn from qualifying purchases made through those links, at
              no extra cost to you. Any such card is clearly marked. We may also show
              advertising elsewhere on the site.
            </p>

            <H2>Debate content and images</H2>
            <p>
              Debate prompts, the site&rsquo;s name, design, and code are ours. Photos used in
              debates are sourced from Unsplash and Pexels under their respective free-to-use
              licenses and credited on each debate page — those images remain the property of
              their original photographers. Using the site&rsquo;s built-in share buttons to
              share a debate link is fine; scraping or republishing our content wholesale
              isn&rsquo;t.
            </p>
            <p>
              If you believe a photo on the site shouldn&rsquo;t be here — you&rsquo;re the
              photographer and didn&rsquo;t intend it to be used this way, or you appear in a
              photo and want it removed — email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-ink-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              and we&rsquo;ll take it down.
            </p>

            <H2>No warranty</H2>
            <p>
              The site is provided &ldquo;as is.&rdquo; We don&rsquo;t guarantee it&rsquo;ll
              always be available, error-free, or that vote counts and percentages are
              perfectly accurate at every moment — this is a small, independently-run project,
              not a mission-critical service.
            </p>

            <H2>Limitation of liability</H2>
            <p>
              To the fullest extent the law allows, we aren&rsquo;t liable for any indirect,
              incidental, or consequential damages arising from your use of the site. Nothing
              here limits liability where the law doesn&rsquo;t allow it to be limited.
            </p>

            <H2>Changes</H2>
            <p>
              We may update the site or these Terms at any time. Continuing to use the site
              after a change means you accept the updated Terms — if we make a material change
              we&rsquo;ll update the date at the top of this page.
            </p>

            <H2>Governing law</H2>
            <p>These Terms are governed by the laws of India.</p>

            <H2>Contact</H2>
            <p>
              Questions about these Terms? See our{" "}
              <Link href="/privacy" className="text-ink-primary underline underline-offset-2">
                Privacy Policy
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-ink-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
