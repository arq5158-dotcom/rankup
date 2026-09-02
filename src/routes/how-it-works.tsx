import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { Faq } from "@/components/rank/Faq";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seoHead({
      title: "How Ranking Credits Work | Live Leaderboard Promotion | Pay4Rank",
      description:
        "How Pay4Rank works: buy ranking credits from $1, spend them for Score, and climb a live weekly or monthly website ranking leaderboard. Featured placement, not Google Ads.",
      path: "/how-it-works",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="How It Works">
      <p className="page-kicker">Leaderboard promotion</p>
      <h1 className="page-title mt-1">How ranking credits work</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
        Pay4Rank is a paid promotion leaderboard for websites, brands, and projects. You buy ranking
        credits, spend them to climb a live board, and get your listing seen. It is not a Google
        ranking service and not a cash prize.
      </p>
      <div className="mt-6 space-y-5">
        <HowItWorks />

        <article className="glass-card space-y-4 rounded-2xl p-5 text-sm leading-relaxed text-white/55 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-fg">A live leaderboard for websites</h2>
          <p>
            Most “promote my website” tools are ads, directories, or launch lists. Pay4Rank is a
            competitive public board. Your profile sits next to other listings. Rank is Score. Score
            comes from ranking credits you spend, or from a Free Spin. When someone else spends more
            on that board, they can pass you. That is the product: pay to climb a leaderboard, stay
            visible while you hold the slot, get featured if you finish top three monthly or first
            weekly.
          </p>
          <h2 className="font-display text-lg font-extrabold text-fg">Credits, Score, and rank</h2>
          <p>
            Ranking credits are an in-app balance. Default conversion is $1 USD = 1,000 credits
            (admin can change future purchases). Credits sit in your wallet until you spend them.
            Spending 1 credit adds 1 Score on the weekly board or the monthly board — you choose.
            Wallet credits never set rank. Only Score does. Weekly Score and monthly Score are
            separate. A weekly reset zeros weekly Score only. Credits never reset.
          </p>
          <h2 className="font-display text-lg font-extrabold text-fg">Who this is for</h2>
          <p>
            Founders who need a cheap featured listing. Side projects that want a public profile with
            a live rank. Creators, newsletters, shops, portfolios, and tools that need a link in
            front of people who already came to look at a leaderboard. If you searched for a Product
            Hunt alternative, a cheap way to advertise a link, or a weekly leaderboard promotion
            site, this is that: a paid featured placement you climb, not a guaranteed search-engine
            position.
          </p>
          <h2 className="font-display text-lg font-extrabold text-fg">What we do not sell</h2>
          <p>
            We do not sell Google rankings, game rank boosts, or lottery tickets. Featured Gold,
            Silver, Bronze, and Weekly Champion are on-site visibility: extra placement, badges, and
            history. Member website links are marked as sponsored and do not pass our ranking signal.
            18+ only.
          </p>
        </article>

        <Faq withSchema />
        <Link
          to="/"
          className="btn-gold tap inline-flex min-h-11 w-full items-center justify-center rounded-xl px-6 text-sm font-extrabold sm:w-auto"
        >
          View the live leaderboard
        </Link>
        <p className="text-sm text-white/40">
          New site with no visitors?{" "}
          <Link to="/guides/how-to-get-traffic-to-a-new-website" className="text-gold hover:underline">
            How to get traffic to a brand new website
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
