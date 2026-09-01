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
      <main className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-black text-gold-grad">How Pay4Rank works</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
          Pay4Rank is a promotional leaderboard. You buy credits with Stripe, spend them 1:1 for Score,
          and take your place on the weekly or monthly board you choose. Top listings get seen — there is no cash prize.
        </p>
        <HowItWorks />
        <Faq withSchema />
        <Link to="/" className="btn-gold tap inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-extrabold sm:w-auto">
          <span>Promote now</span>
        </Link>
      </main>
    </PageShell>
  );
}
