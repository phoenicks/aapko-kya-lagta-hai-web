import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findCategory } from "@/lib/categories";
import { getDigestGroups, getDigestPosts, monthLabel } from "@/lib/digest";
import { computeVerdict } from "@/lib/verdict";
import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export const revalidate = 3600;

export async function generateStaticParams() {
  const groups = await getDigestGroups();
  return groups.map((g) => ({ category: g.category, month: g.month }));
}

export async function generateMetadata({ params }) {
  const category = findCategory(params.category);
  if (!category) return { title: "Roundup not found" };

  const label = monthLabel(params.month);
  return {
    title: `${category.label_en} — ${label} Roundup`,
    description: `Every ${category.label_en} debate from ${label} on Aapko Kya Lagta Hai, with its own result.`,
    alternates: { canonical: `${siteUrl}/digest/${category.id}/${params.month}` },
  };
}

export default async function DigestMonthPage({ params }) {
  const category = findCategory(params.category);
  if (!category) notFound();
  if (!/^\d{4}-\d{2}$/.test(params.month)) notFound();

  const posts = await getDigestPosts(category.id, params.month);
  if (posts.length === 0) notFound();

  const label = monthLabel(params.month);
  const totalVotes = posts.reduce((sum, p) => sum + (p.up_count || 0) + (p.down_count || 0), 0);

  // ItemList of individual Question/Answer entries — the honest structured
  // shape for a roundup of *different* questions, rather than one merged
  // percentage that would blur distinct debates together.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.label_en} — ${label} Roundup`,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, i) => {
      const { total, text } = computeVerdict(post.up_count, post.down_count);
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/debate/${post.slug}`,
        item: {
          "@type": "QAPage",
          mainEntity: {
            "@type": "Question",
            name: post.prompt_en,
            text: post.prompt_hi,
            answerCount: 1,
            acceptedAnswer: {
              "@type": "Answer",
              text: total === 0 ? "Not yet judged." : `${text}, out of ${total} votes.`,
              upvoteCount: post.up_count || 0,
            },
          },
        },
      };
    }),
  };

  return (
    <AppShell>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <main className="pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            <Link href="/digest" className="underline underline-offset-2">Monthly Roundups</Link>
            {" · "}
            <Link href={`/category/${category.id}`} className="underline underline-offset-2">
              {category.label_en}
            </Link>
          </p>
          <h1 className="text-2xl font-extrabold text-ink-primary mt-2">
            {category.label_en} — {label} Roundup
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            {posts.length} debate{posts.length === 1 ? "" : "s"} judged, {totalVotes} vote{totalVotes === 1 ? "" : "s"} cast in {label}.
          </p>

          <ol className="mt-8 space-y-6">
            {posts.map((post) => {
              const { total, text } = computeVerdict(post.up_count, post.down_count);
              return (
                <li key={post.id} className="flex gap-3 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
                  <Link href={`/debate/${post.slug}`} className="shrink-0">
                    <div
                      className="relative rounded-xl overflow-hidden"
                      style={{ width: 72, height: 96, background: "var(--neutral-mid)" }}
                    >
                      <Image src={post.image_url} alt={post.prompt_en} fill sizes="72px" className="object-cover" />
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/debate/${post.slug}`} className="text-sm font-bold text-ink-primary hover:underline underline-offset-2">
                      {post.prompt_en}
                    </Link>
                    <p className="text-xs text-ink-secondary mt-0.5">{post.prompt_hi}</p>
                    <p className="text-xs text-ink-muted mt-1.5">
                      {total === 0 ? "Not yet judged." : `${text}, out of ${total} votes.`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <Footer />
      </main>
    </AppShell>
  );
}
