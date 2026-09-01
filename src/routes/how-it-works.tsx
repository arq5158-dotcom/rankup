import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { Faq } from "@/components/rank/Faq";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seoHead({
      title: "How Pay4Rank Works",
      description:
        "Buy credits with Stripe, spend them for Score, climb weekly and monthly boards. Visibility — not cash prizes.",
      path: "/how-it-works",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="How It Works">
      <p className="page-kicker">The loop</p>
      <h1 className="page-title mt-1">How Pay4Rank works</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
        Pay4Rank is a promotional leaderboard. You buy credits with Stripe, spend them 1:1 for Score,
        and take your place on the weekly or monthly board you choose. Top listings get seen — there is no cash prize.
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
