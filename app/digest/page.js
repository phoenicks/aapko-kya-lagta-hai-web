import Link from "next/link";
import { findCategory } from "@/lib/categories";
import { getDigestGroups, monthLabel } from "@/lib/digest";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const revalidate = 3600;

export const metadata = {
  title: "Monthly Roundups",
  description: "Every debate's individual result, grouped by category and month.",
  alternates: { canonical: `${siteUrl}/digest` },
};

export default async function DigestIndexPage() {
  const groups = await getDigestGroups();

  const byMonth = new Map();
  for (const g of groups) {
    const list = byMonth.get(g.month) || [];
    list.push(g);
    byMonth.set(g.month, list);
  }
  const months = [...byMonth.keys()]; // already sorted newest-first by getDigestGroups

  return (
    <AppShell>
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold text-ink-primary">Monthly Roundups</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Every debate that month, category by category, with its own result — not one
            merged number, since each debate asks a different question.
          </p>

          {months.length === 0 && (
            <p className="text-sm text-ink-muted mt-8">No roundups yet — check back once a month's worth of debates has been judged.</p>
          )}

          <div className="mt-8 space-y-8">
            {months.map((month) => (
              <div key={month}>
                <h2 className="text-base font-bold text-ink-primary mb-2">{monthLabel(month)}</h2>
                <ul className="space-y-1.5">
                  {byMonth.get(month).map((g) => {
                    const category = findCategory(g.category);
                    if (!category) return null;
                    return (
                      <li key={g.category}>
                        <Link
                          href={`/digest/${g.category}/${g.month}`}
                          className="text-sm text-ink-primary underline underline-offset-2"
                        >
                          {category.label_en}
                        </Link>
                        <span className="text-xs text-ink-muted ml-2">
                          {g.count} debate{g.count === 1 ? "" : "s"} · {g.totalVotes} votes total
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
