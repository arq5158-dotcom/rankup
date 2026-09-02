import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { JsonLd } from "@/components/rank/JsonLd";
import { AuthorByline, authorJsonLd } from "@/components/rank/AuthorByline";
import { seoHead, SITE_NAME, SITE_URL, absUrl } from "@/lib/seo";

const PATH = "/guides/product-hunt-launch-guide";
const TITLE = "Product Hunt launch guide (and what to do after 24 hours)";
const DESC =
  "A Product Hunt launch guide and checklist: best time to launch, how to get featured, whether Product Hunt is worth it, and a live leaderboard that stays up after launch day.";

const QA = [
  {
    q: "Is Product Hunt worth it?",
    a: "It can be, if you already have hunters, a clear one-liner, and a product people can try the same day. It is not a traffic machine for an empty site. One day of attention, then it is gone.",
  },
  {
    q: "What is the best time to launch on Product Hunt?",
    a: "Pacific morning on a Tuesday–Thursday is the usual advice so US hunters see it during the vote window. Weekends and holidays are quieter. Timezone matters more than a magic hour.",
  },
  {
    q: "How do you get featured on Product Hunt?",
    a: "You cannot buy the homepage the way people mean “featured.” You ship a real product, get a hunter, write a clear tagline, and earn upvotes. Paid Product Hunt ads are a separate product.",
  },
  {
    q: "What should you do after Product Hunt?",
    a: "Keep a public listing somewhere that does not reset overnight. Directories, Indie Hackers, and a live ranking leaderboard (including Pay4Rank) stay visible after launch day.",
  },
];

export const Route = createFileRoute("/guides/product-hunt-launch-guide")({
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
      <AuthorByline date="Updated 2 Sep 2026" />

      <article className="glass-card mt-8 max-w-2xl space-y-5 rounded-2xl p-5 text-[15px] leading-[1.7] text-white/62 sm:p-8">
        <img
          src="/rank/cup-weekly.webp"
          alt="Weekly featured placement cup — a public listing that stays visible after a Product Hunt launch day"
          className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36"
          width={144}
          height={144}
        />
        <p>
          People type “product hunt” when they want the site itself. You will not outrank
          ProductHunt.com. This Product Hunt launch guide is for founders who want the 24-hour
          window to work — and a plan for the week after, when the launch page is dead.
        </p>
        <p>
          Pay4Rank is not Product Hunt. We run a live ranking leaderboard. Ranking credits buy Score
          and featured website placement on our weekly and monthly boards. Member links are
          sponsored. Use PH for a launch spike. Use a board if you want the listing to stay up.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Is Product Hunt worth it?</h2>
        <p>
          Sometimes. A Product Hunt day can send hundreds of curious clicks if hunters already know
          you, the demo works, and the tagline is obvious. It is not worth it if the site is a
          coming-soon page, you have zero community, or you expected Google traffic from the launch.
        </p>
        <p>
          “Is Product Hunt worth it” is really: do you have a shippable product and people who will
          upvote without being asked in a spammy way? If not, skip the launch. List the site on
          quieter directories and come back when you can demo.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">How Product Hunt works (short)</h2>
        <h3 className="font-display text-base font-bold text-fg">One day, then it drops</h3>
        <p>
          How does Product Hunt work: products go live for a voting day. Rank that day drives
          homepage placement. The next day a new set replaces you. That is why a launch guide
          matters more than a forever SEO page about the brand name.
        </p>
        <h3 className="font-display text-base font-bold text-fg">Hunters, makers, comments</h3>
        <p>
          A hunter (or you, as maker) posts the listing. First-hour comments and a working link
          matter more than a long manifesto. Fake upvotes get you nowhere useful.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Best time to launch on Product Hunt</h2>
        <p>
          The usual best time to launch on Product Hunt is a Tuesday, Wednesday, or Thursday
          morning Pacific, so US hunters see it while votes are open. Avoid US holidays and dead
          weekends unless your audience is elsewhere.
        </p>
        <p>
          Do not overfit the clock. A broken demo at the “perfect” hour loses to a solid Tuesday
          noon. Prepare the night before: screenshots, first comment, maker’s first hour on the
          thread.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">Product Hunt checklist</h2>
        <h3 className="font-display text-base font-bold text-fg">Before you hit launch</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>A URL that loads on a phone in under a few seconds.</li>
          <li>One sentence: who it is for and what they can do in 60 seconds.</li>
          <li>Gallery: product UI, not a logo on a gradient.</li>
          <li>A hunter who has used it, or you posting as maker with a real first comment.</li>
          <li>Support tab open for the first four hours.</li>
        </ul>
        <h3 className="font-display text-base font-bold text-fg">Launch day</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Reply to every genuine comment. Do not paste the same pitch.</li>
          <li>Tell people who already know you. Do not raid unrelated Discords.</li>
          <li>Watch the demo path. If signup is broken, fix it before more traffic hits.</li>
        </ul>

        <h2 className="font-display text-xl font-extrabold text-fg">How to get featured on Product Hunt</h2>
        <p>
          How to get featured on Product Hunt: earn the day’s rank. There is no Pay4Rank-style
          “buy Score for this board.” Product Hunt ads exist; they are not the same as organic
          featured placement on the homepage. If someone sells you a guaranteed #1, walk away.
        </p>
        <p>
          Featured on Product Hunt, in practice, means hunters saw a clear product and voted. Write
          the tagline like a billboard. Hide the novel until after they click.
        </p>

        <h2 className="font-display text-xl font-extrabold text-fg">After the 24 hours</h2>
        <p>
          The launch page is not a home. The next week you still need a public listing: Indie
          Hackers, BetaList, a directory, or a live leaderboard that does not reset overnight.
        </p>
        <p>
          Pay4Rank is one of those boards. Buy ranking credits from $1, spend them for Score, climb
          weekly or monthly. Free Spin if you want Score with no purchase. That is featured
          placement on our site, not a Product Hunt badge and not a Google rank.
        </p>
        <p>
          If you wanted a Product Hunt alternative that stays up all month, that is the difference:
          PH is a day. A ranking leaderboard is a season.
        </p>

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
          to="/guides"
          className="btn-outline tap inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-bold"
        >
          All guides
        </Link>
        <Link
          to="/"
          className="btn-gold tap inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-extrabold"
        >
          Live leaderboard
        </Link>
      </div>
    </PageShell>
  );
}
