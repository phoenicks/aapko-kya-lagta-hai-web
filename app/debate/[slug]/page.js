import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { findCategory } from "@/lib/categories";
import { computeVerdict } from "@/lib/verdict";
import AppShell from "@/components/AppShell";
import DebateVoter from "@/components/DebateVoter";
import CommentSection from "@/components/CommentSection";
import DebateGrid from "@/components/DebateGrid";
import Footer from "@/components/Footer";

export const revalidate = 120;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

async function getPost(slug) {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return data || null;
}

async function getComments(postId) {
  const { data } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

async function getMorePosts(category, excludeId) {
  const { data } = await supabase
    .from("posts")
    .select("id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count")
    .eq("status", "active")
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(6);
  return data || [];
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Debate not found" };

  const url = `${siteUrl}/debate/${post.slug}`;
  const category = findCategory(post.category);

  return {
    title: post.prompt_en,
    description: `${post.prompt_en} ${post.prompt_hi} — vote and see what everyone else thinks on Aapko Kya Lagta Hai.`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.prompt_en} — Aapko Kya Lagta Hai`,
      description: "Vote 👍 or 👎 and see how the crowd feels.",
      url,
      images: [{ url: post.image_url }],
      section: category?.label_en,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.prompt_en} — Aapko Kya Lagta Hai`,
      images: [post.image_url],
    },
  };
}

export default async function DebatePage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const [comments, morePosts] = await Promise.all([
    getComments(post.id),
    getMorePosts(post.category, post.id),
  ]);

  const url = `${siteUrl}/debate/${post.slug}`;
  // Server-computed so the verdict is present in the raw HTML response —
  // most AI/search crawlers don't execute client JS, and the interactive
  // vote-split bar (DebateVoter/SplitBar) only reveals itself after a real
  // visitor taps a vote button, so without this a debate could have 2,000
  // votes and still show a crawler nothing quotable.
  const { total, text: verdictText } = computeVerdict(post.up_count, post.down_count);

  const discussionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.prompt_en,
    alternativeHeadline: post.prompt_hi,
    image: post.image_url,
    datePublished: post.created_at,
    url,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.up_count || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/DislikeAction",
        userInteractionCount: post.down_count || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: comments.length,
      },
    ],
    commentCount: comments.length,
  };

  // Question/Answer shape specifically, alongside the DiscussionForumPosting
  // above — this is the structured-data pattern answer engines look for
  // when deciding what to quote for an opinion/verdict query, and it's the
  // one place the actual crowd percentage appears as literal text.
  const qaJsonLd = total === 0 ? null : {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: post.prompt_en,
      text: post.prompt_hi,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${verdictText}, out of ${total} votes.`,
        upvoteCount: post.up_count || 0,
      },
    },
  };

  return (
    <AppShell>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(discussionJsonLd) }}
      />
      {qaJsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(qaJsonLd) }}
        />
      )}
      <main className="pb-16">
        <DebateVoter post={post} shareUrl={url} />
        <p className="max-w-md mx-auto px-4 sm:px-0 mt-2 text-center text-xs text-ink-muted">
          {total === 0
            ? "Be the first to judge this one."
            : `${total} people have judged this so far — ${verdictText}.`}
        </p>
        <CommentSection postId={post.id} initialComments={comments} />
        <DebateGrid posts={morePosts} heading="More in this category" />
        <Footer />
      </main>
    </AppShell>
  );
}
