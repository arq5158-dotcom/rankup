import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rank/PageShell";
import { HowItWorks } from "@/components/rank/HowItWorks";
import { Faq } from "@/components/rank/Faq";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seoHead({
      title: "How Rank Up Works",
      description:
        "Pay through Stripe, climb the live leaderboard, and win monthly or weekly prizes. Placement is by confirmed contribution — not by chance.",
      path: "/how-it-works",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="How It Works">
      <main className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-black text-gold-grad">How Rank Up works</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-white/50">
          Rank Up is a live prize leaderboard. You choose a contribution, pay securely with Stripe, and
          take your place by confirmed total — not by chance.
        </p>
        <HowItWorks />
        <Faq withSchema />
        <Link to="/" className="btn-gold tap inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-extrabold sm:w-auto">
          <span>Enter now</span>
        </Link>
      </main>
    </PageShell>
  );
}
