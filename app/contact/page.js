import Link from "next/link";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";
const CONTACT_EMAIL = "contact@aapkokyalagtahai.com";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Aapko Kya Lagta Hai.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactPage() {
  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">Contact</h1>
          <p className="text-sm text-ink-secondary mt-1">संपर्क करें</p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-ink-secondary">
            <p>
              Got a debate idea, spotted a bug, want a comment or image taken down, or just
              have something to say? Email us — a real person reads every message.
            </p>
            <p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-lg font-bold text-ink-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              This is a small, independently-run project, so replies aren&rsquo;t instant —
              but we do read everything and get back to you.
            </p>
            <p className="text-xs text-ink-muted pt-4">
              For how we handle information you share with us, see our{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              . For the rules of using the site, see our{" "}
              <Link href="/terms" className="underline underline-offset-2">
                Terms
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
