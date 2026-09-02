import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { JsonLd } from "@/components/rank/JsonLd";
import { AuthorByline, authorJsonLd, EDITORIAL } from "@/components/rank/AuthorByline";
import { seoHead, SITE_NAME, SITE_URL, absUrl } from "@/lib/seo";

const PATH = "/guides/how-to-get-traffic-to-a-new-website";
const TITLE = "How to get traffic to your website (even if it's brand new)";
const DESC =
  "How to get traffic to your website when nobody knows it exists. Drive traffic for free, get people to view your site, and skip buying Google rankings. First 100 visits — not a fantasy #1.";

const QA = [
  {
    q: "How do I get traffic to my website if it is new?",
    a: "Tell people who already know you, list the site on launch directories, and publish one page that answers a real question. Google will not send traffic on day one. Free traffic is messages, listings, and useful pages — not a purchased search rank.",
  },
  {
    q: "How can I get traffic to my website for free?",
    a: "Post the link where your audience already is, submit to Product Hunt or Indie Hackers, write one useful guide, and use free listing tools. Pay4Rank also has a free daily promotion spin for Score on its leaderboard. None of that buys a Google first-page slot.",
  },
  {
    q: "How do I get people to view my website?",
    a: "Ask them directly, then put the URL in front of people already browsing launch lists or a live leaderboard. A featured placement is a public listing people can click. It is not the same as organic Google traffic.",
  },
  {
    q: "How do I get traffic to my website fast?",
    a: "Fast traffic is paid ads or a listing people already visit. SEO is slow for a new domain. If you need people this week, post it, list it, or buy a visible spot on a board. Do not buy fake Google rankings.",
  },
];

export const Route = createFileRoute("/guides/how-to-get-traffic-to-a-new-website")({
  head: () =>
    seoHead({
      title: `${TITLE} | Pay4Rank`,
      description: DESC,
      path: PATH,
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESC,
          datePublished: "2026-09-02",
          dateModified: "2026-09-02",
          author: authorJsonLd(),
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: absUrl("/og.jpg") },
          },
          mainEntityOfPage: absUrl(PATH),
        }}
      />
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
      <p className="page-kicker">
        <Link to="/guides" className="text-gold/80 hover:text-gold">
          Guides
        </Link>
      </p>
      <h1 className="page-title mt-1 max-w-3xl">{TITLE}</h1>
      <AuthorByline date="Updated 2 Sep 2026 · 8 min read" />

      <article className="glass-card mt-8 max-w-2xl space-y-5 rounded-2xl p-5 text-[15px] leading-[1.7] text-white/62 sm:p-8">
        <p>
          If you launched yesterday, Google does not owe you visitors. Search Console can be
          verified and still show nothing for days. That is normal. A brand-new site is invisible
          until people and crawlers have a reason to look.
        </p>
        <p>
          This guide answers “how to get traffic to your website,” “how to drive traffic to your
          website,” and “how to get traffic to a brand new website.” Same problem: first visits,
          not a fantasy #1 ranking. Pay4Rank is one option at the end — a live leaderboard for
          websites, not a Google Ads account. Written by {EDITORIAL.name}.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">How to get your first visitors</h2>
        <h3 className="font-display text-base font-bold text-fg">Tell humans who already know you</h3>
        <p>
          Your first visitors will not come from Google. They come from a message you send: X,
          a Discord, an email to ten people who said “send me the link,” Indie Hackers, a niche
          subreddit if you are allowed to post there. One honest post beats twenty keyword tricks.
        </p>
        <p>
          Write what it is, who it is for, and the URL. Do not ask strangers to “like and share.”
          Ask two people to open it on their phone and tell you what is confusing.
        </p>

        <h3 className="font-display text-base font-bold text-fg">Get listed where founders already browse</h3>
        <p>
          Directories and launch sites are not magic, but they are indexed and they send humans.
          Product Hunt, BetaList, Indie Hackers, MicroLaunch, Launching Next, DEV “Show” posts.
          Each listing is a backlink and a chance at a handful of clicks the same week.
        </p>
        <p>
          Submit the real homepage, a short description, and a screenshot. If a site asks for a
          category, pick “marketing / promotion / community,” not “SEO tool.” You are not selling
          Google positions.
        </p>

        <h3 className="font-display text-base font-bold text-fg">Publish one page that answers a real question</h3>
        <p>
          Google needs text it can crawl. A leaderboard that loads empty and fills in later is a
          weak page. A guide like this one — a title, an H1, H2s, H3s, and a few hundred words in
          the HTML — is something a crawler can match to a query.
        </p>
        <p>
          Pick one question your customer already types. Answer it in plain language. Put a clear
          next step at the bottom. Do not clone the same paragraph onto every URL. Duplicate
          descriptions make Google treat pages as copies.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">What not to buy</h2>
        <h3 className="font-display text-base font-bold text-fg">Do not buy a Google rank</h3>
        <p>
          “Pay for rank” in games means boosting an account. “Pay for rank” in SEO spam means fake
          backlinks. Neither is this. Buying a guaranteed first-page slot is how sites get ignored
          or worse. Cheap website promotion that you can see — a public listing, a featured
          placement, a weekly board — is a different product.
        </p>
        <p>
          SEO for a new domain is slow: brand name first, then long phrases, then maybe broader
          terms if people link to you. Anyone selling “page one in two weeks” on big keywords is
          selling you a story.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">If you want a live board, not an ad account</h2>
        <h3 className="font-display text-base font-bold text-fg">Ranking credits and featured placement</h3>
        <p>
          Some people want a Product Hunt alternative that stays up all month: a public profile, a
          link, a score, a chance to get featured. That is what{" "}
          <Link to="/" className="text-gold hover:underline">
            Pay4Rank
          </Link>{" "}
          is. You buy ranking credits from $1, spend them for Score, and climb a{" "}
          <Link to="/weekly" className="text-gold hover:underline">
            weekly
          </Link>{" "}
          or{" "}
          <Link to="/monthly" className="text-gold hover:underline">
            monthly
          </Link>{" "}
          leaderboard. Top listings get featured placement. Credits never buy a Google search slot.
        </p>
        <p>
          No budget this week? There is a{" "}
          <Link to="/spin" className="text-gold hover:underline">
            free daily promotion spin
          </Link>{" "}
          for Score. Giveaways, when live, are separate and free to enter.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Free, viewed, and fast traffic</h2>
        <h3 className="font-display text-base font-bold text-fg">How to get traffic to your website for free</h3>
        <p>
          Free traffic is not a tool that “generates visitors.” It is work: messages, listings, and
          one useful page. How to increase website traffic for free on a new domain is the same
          list as above. Paid ads are faster. SEO is slower. A free daily spin on a promotion
          board can put your listing in front of people already looking at ranks — it still will
          not put you on Google’s first page overnight.
        </p>

        <h3 className="font-display text-base font-bold text-fg">How to get people to view your website</h3>
        <p>
          People view a site when a human or a listing puts the URL in front of them. Ask. Get
          listed. Put a public profile where others are already competing for attention. “Need
          traffic for my website” is usually that gap — nobody has seen the link yet — not a
          missing keyword on the homepage.
        </p>

        <h3 className="font-display text-base font-bold text-fg">How to get traffic to your website fast</h3>
        <p>
          Fast means paid or already-crowded rooms: ads, a launch post, a featured listing.
          “How to drive traffic to your website” in a week is not Search Console. If someone
          promises fast organic #1 for “increase website traffic,” they are selling a story.
          Use fast channels for the first hundred visits. Use SEO for the long phrases later.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">A simple first-week plan</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Ship a homepage that states what you do in one sentence.</li>
          <li>Tell twenty people. List on two launch sites.</li>
          <li>Write one useful page (you are reading an example).</li>
          <li>Submit a sitemap. Wait. Do not refresh Google every hour.</li>
          <li>If you want a public climb, use a live leaderboard — including Pay4Rank if it fits.</li>
        </ol>

        <h2 className="font-display text-xl font-extrabold text-fg">Q&A</h2>
        {QA.map((item) => (
          <section key={item.q}>
            <h3 className="font-display text-base font-bold text-fg">{item.q}</h3>
            <p>{item.a}</p>
          </section>
        ))}
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/"
          className="btn-gold tap inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-extrabold"
        >
          View the live leaderboard
        </Link>
        <Link
          to="/how-it-works"
          className="btn-outline tap inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-bold"
        >
          How ranking credits work
        </Link>
      </div>
    </PageShell>
  );
}
