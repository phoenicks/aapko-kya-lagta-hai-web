"use client";

import LineChart from "./charts/LineChart";
import BarChart from "./charts/BarChart";
import DonutChart from "./charts/DonutChart";

// One shared palette for anything that needs more than the site's existing
// up/down colors (category bars, the extra line-chart series).
const PALETTE = ["#2a78d6", "#e34948", "#f0a83c", "#4fb477", "#9b6bd6", "#3fb8c4"];

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-bold text-ink-primary">{title}</p>
      <p className="text-xs text-ink-muted mb-3 min-h-[1em]">{subtitle}</p>
      {children}
    </div>
  );
}

function Legend({ series, totals }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {series.map((s, i) => (
        <div key={s.name} className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
          <span className="text-ink-secondary">{s.name}</span>
          <span className="text-ink-muted font-semibold">{totals[i]}</span>
        </div>
      ))}
    </div>
  );
}

function fmtDateLabel(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

function LeaderboardCard({ title, subtitle, items, metric }) {
  return (
    <Card title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <p className="text-xs text-ink-muted">Not enough data yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`/debate/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-xs text-ink-secondary line-clamp-1 block"
                title={item.prompt_en}
              >
                {i + 1}. {item.prompt_en}
              </a>
              <span className="text-xs text-ink-muted">
                {metric === "upRatio"
                  ? `${Math.round(item.upRatio * 100)}% agree · ${item.total} votes`
                  : `${item.commentCount} comment${item.commentCount === 1 ? "" : "s"}`}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function InsightsSection({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">Insights</h2>
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  const { daily, categories, imageSources, leaderboards, minVotesForLeaderboard } = data;
  const labels = daily.map((d) => fmtDateLabel(d.date));

  const votesUp = daily.map((d) => d.votesUp);
  const votesDown = daily.map((d) => d.votesDown);
  const newSessions = daily.map((d) => d.newSessions);
  const newPosts = daily.map((d) => d.posts);
  const newComments = daily.map((d) => d.comments);

  const categoryBars = [...categories]
    .sort((a, b) => b.votes - a.votes)
    .map((c, i) => ({ label: c.label_en, value: c.votes, color: PALETTE[i % PALETTE.length] }));

  const imageDonut = imageSources.map((s) => ({
    label: s.source === "unsplash" ? "Unsplash" : "Pexels",
    value: s.count,
    color: s.source === "unsplash" ? "var(--up-color)" : "#f0a83c",
  }));

  const leaderboardSubtitle = `All-time, active posts with ${minVotesForLeaderboard}+ votes`;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-3">Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Card title="Votes per day" subtitle="Last 30 days">
          <LineChart
            labels={labels}
            series={[
              { name: "👍 Up", color: "var(--up-color)", values: votesUp },
              { name: "👎 Down", color: "var(--down-color)", values: votesDown },
            ]}
          />
          <Legend
            series={[
              { name: "👍 Up", color: "var(--up-color)" },
              { name: "👎 Down", color: "var(--down-color)" },
            ]}
            totals={[sum(votesUp), sum(votesDown)]}
          />
        </Card>

        <Card title="New sessions per day" subtitle="Last 30 days">
          <LineChart labels={labels} series={[{ name: "Sessions", color: PALETTE[3], values: newSessions }]} />
          <Legend series={[{ name: "New sessions", color: PALETTE[3] }]} totals={[sum(newSessions)]} />
        </Card>

        <Card title="New posts & comments per day" subtitle="Last 30 days">
          <LineChart
            labels={labels}
            series={[
              { name: "Posts", color: PALETTE[2], values: newPosts },
              { name: "Comments", color: PALETTE[4], values: newComments },
            ]}
          />
          <Legend
            series={[
              { name: "Posts", color: PALETTE[2] },
              { name: "Comments", color: PALETTE[4] },
            ]}
            totals={[sum(newPosts), sum(newComments)]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <Card title="Votes by category" subtitle="All-time">
          <BarChart items={categoryBars} />
        </Card>
        <Card title="Image source mix" subtitle="All-time, active + disabled posts">
          <DonutChart items={imageDonut} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <LeaderboardCard
          title="Most agreed on"
          subtitle={leaderboardSubtitle}
          items={leaderboards.mostAgreed}
          metric="upRatio"
        />
        <LeaderboardCard
          title="Most controversial"
          subtitle={leaderboardSubtitle}
          items={leaderboards.mostControversial}
          metric="upRatio"
        />
        <LeaderboardCard
          title="Most commented"
          subtitle="All-time, active posts"
          items={leaderboards.mostCommented}
          metric="commentCount"
        />
      </div>
    </div>
  );
}
