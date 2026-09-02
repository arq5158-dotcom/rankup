import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { JsonLd } from "@/components/rank/JsonLd";
import { AuthorByline, authorJsonLd, EDITORIAL } from "@/components/rank/AuthorByline";
import { seoHead, SITE_NAME, SITE_URL, absUrl } from "@/lib/seo";

const PATH = "/guides/how-to-get-traffic-to-a-new-website";
const TITLE = "How to get traffic to your website (even if it's brand new)";
const DESC =
  "How to get traffic to a new website, free ways to get website traffic, and how to get website traffic fast — without buying a Google rank. First visits, not a fake #1.";

const FAQ = [
  {
    q: "How do I get traffic to my website if it is new?",
    a: "Tell people, get listed, and publish one useful page. Google waits.",
  },
  {
    q: "How can I get traffic to my website for free?",
    a: "Use posts, directories, and one guide. Optional: Pay4Rank Free Spin. It is not a purchased Google rank.",
  },
  {
    q: "How do I get people to view my website?",
    a: "Put the URL where humans already look — chats, launch lists, or a live leaderboard.",
  },
  {
    q: "How do I get traffic to my website fast?",
    a: "Ads or a public listing this week. SEO is not fast on a new domain.",
  },
];

const QA = [
  {
    q: "Why should a brand-new website focus on people before Google?",
    a: "A new domain often has no trust, links, or history, so Google may take time to crawl and rank it. The fastest first visits come from direct human actions: sending the link to people, posting in relevant communities, submitting to launch sites, or using public promotion boards.",
  },
  {
    q: "What kind of page should I create first for SEO?",
    a: "Create one useful, crawlable page that answers a real question your audience already asks. It should have clear text in the HTML, a specific title or heading, and a simple next step. Avoid copying the same description across multiple pages, because duplicate content can make pages look like copies.",
  },
  {
    q: "Are launch directories worth using for a new website?",
    a: "Yes, but they are not magic. Directories and launch sites can give you backlinks, indexing signals, and a few real visitors in the same week. They work best when you submit a clear homepage, a short description, and a screenshot to categories where people are already looking for new products.",
  },
  {
    q: "Does Pay4Rank help with Google rankings?",
    a: "Pay4Rank is a public promotion board, not a way to buy Google placement. Ranking credits can help a site climb a weekly or monthly leaderboard and maybe get featured there, but they do not buy a Google search slot or guarantee organic rankings.",
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
          mainEntity: [...FAQ, ...QA].map((item) => ({
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
      <AuthorByline date="Updated 2 Sep 2026" />

      <article className="glass-card mt-8 max-w-2xl space-y-5 rounded-2xl p-5 text-[15px] leading-[1.7] text-white/62 sm:p-8">
        <img
          src="/rank/mountains.webp"
          alt="Pay4Rank mountain backdrop for a live website ranking leaderboard — public promotion, not Google Ads"
          className="mb-2 w-full rounded-xl object-cover"
          width={1200}
          height={480}
        />

        <h2 className="font-display text-xl font-extrabold text-fg">The reality of a brand-new website</h2>
        <p>
          If you launched yesterday, Google does not owe you visitors. Search Console can be
          verified and still show nothing for days. That is normal. A brand-new site is invisible
          until people and crawlers have a reason to look.
        </p>
        <p>
          This guide answers how to get traffic to your website, how to drive traffic to your
          website, and how to get traffic to a new website. The same problem shows up in every
          search: you need first visits, not a fake #1 rank. Pay4Rank is one option at the end — a
          live leaderboard for websites, not a Google Ads account. {EDITORIAL.name} writes from
          operating that board, not from selling SEO retainers.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Your first visitors come from people, not Google</h2>
        <h3 className="font-display text-base font-bold text-fg">Send the URL to humans who already know you</h3>
        <p>
          Your first visitors usually come from a message you send: X, Discord, email, Indie
          Hackers, or a niche subreddit if you are allowed to post there. One honest post beats
          twenty keyword tricks.
        </p>
        <p>
          Write what it is, who it is for, and the URL. Do not ask strangers to “like and share.”
          Ask two people to open it on their phone and tell you what is confusing.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Use directories and launch sites</h2>
        <h3 className="font-display text-base font-bold text-fg">Where founders already browse</h3>
        <p>
          Directories and launch sites are not magic, but they are indexed and they send humans.
          Product Hunt, BetaList, Indie Hackers, MicroLaunch, Launching Next, and DEV “Show” posts
          can each give you a backlink and a few clicks the same week.
        </p>
        <p>
          Submit the real homepage, a short description, and a screenshot. If a site asks for a
          category, pick “marketing / promotion / community,” not “SEO tool.” You are not selling
          Google positions.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Give Google something it can crawl</h2>
        <h3 className="font-display text-base font-bold text-fg">Text in the HTML, not an empty shell</h3>
        <p>
          Google needs text it can crawl. A leaderboard that loads empty and fills in later is a
          weak page. A guide like this one — a title, an H1, and a few hundred words in the HTML —
          is something a crawler can match to a query.
        </p>
        <p>
          Pick one question your customer already types. Answer it in plain language. Put a clear
          next step at the bottom. Do not clone the same paragraph onto every URL. Duplicate
          descriptions make Google treat pages as copies.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">What pay for rank is not</h2>
        <h3 className="font-display text-base font-bold text-fg">Not game boosting, not fake backlinks</h3>
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

        <h2 className="font-display text-xl font-extrabold text-fg">Use Pay4Rank as a public promotion board</h2>
        <h3 className="font-display text-base font-bold text-fg">Ranking credits, Score, featured placement</h3>
        <img
          src="/rank/cup-gold.webp"
          alt="Gold featured placement trophy for the monthly ranking leaderboard on Pay4Rank"
          className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          width={144}
          height={144}
        />
        <p>
          Some people want a Product Hunt alternative that stays up all month: a public profile, a
          link, a score, and a chance to get featured. That is what Pay4Rank is. You buy ranking
          credits from $1, spend them for Score, and climb a weekly or monthly leaderboard. Top
          listings get featured placement. Credits never buy a Google search slot.
        </p>
        <p>
          No budget this week? There is a{" "}
          <Link to="/spin" className="text-gold hover:underline">
            free daily promotion spin
          </Link>{" "}
          for Score. Giveaways, when live, are separate and free to enter.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">How free traffic really works</h2>
        <h3 className="font-display text-base font-bold text-fg">Free ways to get website traffic</h3>
        <p>
          Free traffic is not a tool that “generates visitors.” It is work: messages, listings, and
          one useful page. If you want free ways to get website traffic, start with the same list
          every time: post, list, and publish.
        </p>
        <p>
          Paid ads are faster. SEO is slower. A free daily spin on a promotion board can put your
          listing in front of people who already look at ranks, but it will not put you on Google’s
          first page overnight.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">How to get people to view your website</h2>
        <p>
          People view a site when a human or a listing puts the URL in front of them. Ask. Get
          listed. Put a public profile where others are already competing for attention. “Need
          traffic for my website” is usually that gap — nobody has seen the link yet — not a
          missing keyword on the homepage.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">How to get website traffic fast</h2>
        <img
          src="/rank/cup-weekly.webp"
          alt="Weekly Champion cup — featured placement on the Pay4Rank weekly leaderboard"
          className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          width={144}
          height={144}
        />
        <p>
          Fast means paid or already crowded rooms: ads, a launch post, a featured listing. If you
          need to get website traffic fast, do not wait on Search Console. If someone promises fast
          organic #1 for “increase website traffic,” they are selling a story.
        </p>
        <p>
          Use fast channels for the first hundred visits. Use SEO for the long phrases later.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">A simple first-traffic checklist</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Ship a homepage that says what you do in one sentence.</li>
          <li>Tell twenty people. List on two launch sites.</li>
          <li>Write one useful page.</li>
          <li>Submit a sitemap. Wait. Do not refresh Google every hour.</li>
          <li>If you want a public climb, use a live leaderboard — including Pay4Rank if it fits.</li>
        </ol>

        <h2 className="font-display text-xl font-extrabold text-fg">FAQ</h2>
        {FAQ.map((item) => (
          <section key={item.q}>
            <h3 className="font-display text-base font-bold text-fg">{item.q}</h3>
            <p>{item.a}</p>
          </section>
        ))}

        <h2 className="font-display text-xl font-extrabold text-fg">Q&A</h2>
        {QA.map((item) => (
          <section key={item.q}>
            <h3 className="font-display text-base font-bold text-fg">{item.q}</h3>
            <p>
              <span className="text-white/40">Short answer: </span>
              {item.a}
            </p>
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
