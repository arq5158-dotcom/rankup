import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { AuthorByline } from "@/components/rank/AuthorByline";
import { JsonLd } from "@/components/rank/JsonLd";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  head: () =>
    seoHead({
      title: "Guides | How to Promote a New Website | Pay4Rank",
      description:
        "Pay4Rank guides on how to promote a new website: organic traffic, leaderboard promotion, ranking credits, and featured website placement. For founders with no audience yet.",
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
    to: "/guides/product-hunt-launch-guide" as const,
    title: "Product Hunt launch guide",
    dek: "Checklist, timing, is it worth it — and what to do after the 24 hours.",
  },
  {
    to: "/guides/website-traffic-simple-lasting-guide" as const,
    title: "Website traffic: a simple, lasting guide",
    dek: "How to increase website traffic without betting everything on ads.",
  },
  {
    to: "/guides/hiring-a-link-building-agency" as const,
    title: "Hiring a link building agency",
    dek: "When professional SEO link building and backlink services make sense — and what to avoid.",
  },
  {
    to: "/guides/traffic-site-internet" as const,
    title: "Traffic site internet : guide simple et durable",
    dek: "Comment augmenter le trafic sans tout miser sur la pub. SEO, contenu, UX et suivi.",
  },
];

const QA = [
  {
    q: "What are Pay4Rank guides for?",
    a: "They explain how to promote a new website, how organic traffic actually starts, and when a live leaderboard promotion is a better fit than ads or fake Google ranks.",
  },
  {
    q: "Do these guides sell Google rankings?",
    a: "No. Pay4Rank sells ranking credits for on-site Score and featured website placement on weekly and monthly boards. That is visibility on pay4rank.com, not a search-engine slot.",
  },
  {
    q: "Where should I start?",
    a: "If nobody knows your URL, read how to get traffic to a new website. If you want a lasting SEO plan, read the simple lasting traffic guide. If you want a public climb this week, open ranking credits and Free Spin.",
  },
];

function Page() {
  return (
    <PageShell crumbs={[{ name: "Guides", path: "/guides" }]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: QA.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <p className="page-kicker">Guides</p>
      <h1 className="page-title mt-1 max-w-3xl">How to promote a new website</h1>
      <AuthorByline date="Updated 2 Sep 2026" />

      <article className="mt-6 max-w-2xl space-y-5 text-sm leading-relaxed text-white/58">
        <p>
          This hub collects Pay4Rank guides on website promotion, online brand promotion, and
          leaderboard promotion. If you launched a site and nobody visits it, start here. The
          articles are written for founders, side projects, and anyone who needs a public listing
          without buying a fake Google rank.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">What these guides cover</h2>
        <p>
          Promoting a new website is usually three jobs at once: get the first humans to open the
          URL, give search engines crawlable text, and decide whether you also want a live public
          board. We keep those jobs separate so the pages are not copies of each other.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>First visits when the domain is unknown.</li>
          <li>Lasting organic traffic: SEO, content, UX, tracking — without ads as the only lever.</li>
          <li>Leaderboard promotion: ranking credits, Score, weekly/monthly boards, featured website placement.</li>
          <li>French readers: the same lasting-traffic plan as traffic site internet.</li>
        </ul>

        <h2 className="font-display text-xl font-extrabold text-fg">How to promote a new website (short version)</h2>
        <h3 className="font-display text-base font-bold text-fg">People first, Google second</h3>
        <p>
          A brand-new domain has no history. Search Console can sit on “processing” for days. Direct
          messages, launch directories, and one useful page still work. That is website promotion
          you can do this week.
        </p>
        <h3 className="font-display text-base font-bold text-fg">Leaderboard promotion is a different product</h3>
        <p>
          Pay4Rank is a competitive public board. You buy ranking credits from $1, spend them 1:1
          for Score, and climb the weekly or monthly leaderboard you choose. Higher Score means a
          more visible profile, brand, or website listing. Gold, Silver, and Bronze are featured
          website placement on this site. Weekly Champion gets a homepage spotlight. Credits never
          buy a Google search slot.
        </p>
        <p>
          No budget?{" "}
          <Link to="/spin" className="text-gold hover:underline">
            Free Spin
          </Link>{" "}
          awards Score without a purchase.{" "}
          <Link to="/how-it-works" className="text-gold hover:underline">
            How ranking credits work
          </Link>{" "}
          is the product explainer. Member website links on the board are sponsored listings.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Who should read which guide</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Nobody knows the URL yet</strong> — start with how to get
            traffic to your website.
          </li>
          <li>
            <strong className="text-fg">You want a monthly SEO routine</strong> — read website
            traffic: a simple, lasting guide.
          </li>
          <li>
            <strong className="text-fg">You search in French</strong> — traffic site internet.
          </li>
          <li>
            <strong className="text-fg">You want a public climb this week</strong> — ranking credits,
            Rank Up, or Free Spin — not another keyword article.
          </li>
        </ul>

        <h2 className="font-display text-xl font-extrabold text-fg">All guides</h2>
      </article>

      <ul className="mt-4 max-w-2xl space-y-3">
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

      <article className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-white/58">
        <h2 className="font-display text-xl font-extrabold text-fg">Q&A</h2>
        {QA.map((item) => (
          <section key={item.q}>
            <h3 className="font-display text-base font-bold text-fg">{item.q}</h3>
            <p>{item.a}</p>
          </section>
        ))}
        <p>
          We add a guide only when the search intent is different — not fifty copies of “get more
          traffic.” Online brand promotion on Pay4Rank means a live rank people can browse, plus
          these articles for the slow path.
        </p>
      </article>
    </PageShell>
  );
}
