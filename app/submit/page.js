import AppShell from "@/components/AppShell";
import SubmitDebateForm from "@/components/SubmitDebateForm";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const metadata = {
  title: "Submit a debate",
  description: "Got a debate idea? Submit your own image + prompt to Aapko Kya Lagta Hai.",
  alternates: { canonical: `${siteUrl}/submit` },
};

export default function SubmitPage() {
  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-md mx-auto px-4 sm:px-0 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">Submit a debate</h1>
          <p className="text-sm text-ink-secondary mt-1 mb-6">
            Got a fit check, a hot take, or a hostel story worth judging? Submit it below — every
            submission is reviewed before it goes live.
          </p>
          <SubmitDebateForm />
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
