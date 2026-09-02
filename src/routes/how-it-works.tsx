import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { Faq } from "@/components/rank/Faq";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seoHead({
      title: "How to Climb a Live Leaderboard | Pay4Rank",
      description:
        "How to promote your brand on a live ranking leaderboard: buy ranking credits from $1, spend 1 credit = 1 Score, climb weekly or monthly boards, or use Free Spin.",
      path: "/how-it-works",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="How It Works">
      <p className="page-kicker">The loop</p>
      <h1 className="page-title mt-1">How to climb the leaderboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
        Promote your profile, brand, or website on a live ranking leaderboard. Buy ranking credits,
        spend them 1:1 for Score, and climb the weekly or monthly board you choose. Top listings get seen — there is no cash prize.
      </p>
      <div className="mt-6 space-y-5">
        <HowItWorks />
        <Faq withSchema />
        <Link to="/" className="btn-gold tap inline-flex min-h-11 w-full items-center justify-center rounded-xl px-6 text-sm font-extrabold sm:w-auto">
          <span>Promote now</span>
        </Link>
      </div>
    </PageShell>
  );
}
