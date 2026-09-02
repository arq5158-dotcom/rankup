import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  head: () =>
    seoHead({
      title: "Guides | How to Promote a New Website | Pay4Rank",
      description:
        "Short guides on getting traffic to a new website, cheap featured listings, and live leaderboard promotion. Written for founders with no audience yet.",
      path: "/guides",
    }),
  component: Page,
});

const POSTS = [
  {
    to: "/guides/how-to-get-traffic-to-a-new-website" as const,
    title: "How to get traffic to your website",
    dek: "Even if the site is brand new. Free traffic, getting people to view it, and what to skip.",
  },
];

function Page() {
  return (
    <PageShell>
      <p className="page-kicker">Guides</p>
      <h1 className="page-title mt-1">How to get seen</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
        Practical notes for new sites. Not Google rank tricks. Not game boosting.
      </p>
      <ul className="mt-8 space-y-3">
        {POSTS.map((p) => (
          <li key={p.to}>
            <Link
              to={p.to}
              className="glass-card tap block rounded-2xl p-5 transition-colors hover:border-gold/25"
            >
              <p className="font-display text-lg font-extrabold text-fg">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/50">{p.dek}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
