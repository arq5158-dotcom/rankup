import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { AuthorByline } from "@/components/rank/AuthorByline";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  head: () =>
    seoHead({
      title: "Guides | How to Promote a New Website | Pay4Rank",
      description:
        "Guides on how to get traffic to a new website, cheap featured listings, and live leaderboard promotion. Written for founders with no audience yet.",
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
  {
    to: "/guides/traffic-site-internet" as const,
    title: "Traffic site internet : guide simple et durable",
    dek: "Comment augmenter le trafic sans tout miser sur la pub. SEO, contenu, UX et suivi.",
  },
  {
    to: "/guides/website-traffic-simple-lasting-guide" as const,
    title: "Website traffic: a simple, lasting guide",
    dek: "How to increase website traffic without betting everything on ads.",
  },
];

function Page() {
  return (
    <PageShell>
      <p className="page-kicker">Guides</p>
      <h1 className="page-title mt-1">How to get seen</h1>
      <AuthorByline date="Updated 2 Sep 2026" />
      <article className="mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-white/55">
        <h2 className="font-display text-lg font-extrabold text-fg">Website promotion guides</h2>
        <p>
          These guides are for people with a new website and almost no visitors. They cover how to
          get traffic to your website, how to promote a side project, and when a live ranking
          leaderboard is a better fit than Google Ads. They are not game-rank boosting and not a
          promise of first-page Google results.
        </p>
        <p>
          Start with the traffic article if nobody knows your URL yet. Then read{" "}
          <Link to="/how-it-works" className="text-gold hover:underline">
            how ranking credits work
          </Link>{" "}
          if you want a public featured placement on Pay4Rank’s weekly or monthly boards. Free Spin
          is there if you want to climb without buying credits.
        </p>
        <p>
          We add a new guide only when the search intent is different — not fifty copies of “get
          more traffic.” If you came from a launch list or a keyword tool, pick the piece that
          matches the job you actually have.
        </p>
      </article>
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
