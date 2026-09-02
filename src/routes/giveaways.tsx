import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { PageShell } from "@/components/rank/PageShell";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/giveaways")({
  head: () =>
    seoHead({
      title: "Free Website Promotion Giveaway | No Purchase Necessary | Pay4Rank",
      description:
        "Pay4Rank community giveaways are free website promotion — no purchase necessary. Buying ranking credits does not improve odds. Separate from the paid leaderboard.",
      path: "/giveaways",
    }),
  component: Page,
});

function Page() {
  return (
    <PageShell active="Giveaways">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-end gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/25">
            <Gift className="h-6 w-6 text-gold" />
          </span>
          <div>
            <p className="page-kicker">Free promotion</p>
            <h1 className="page-title">Free website promotion giveaways</h1>
            <p className="mt-1 max-w-xl text-sm text-white/45">
              Optional community giveaways. Separate from ranking credits. Never a pay-to-win drawing.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[22px] p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Right now</p>
          <h2 className="mt-1 text-lg font-bold text-fg">No giveaway is live</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            When we run one, the prize, dates, how to enter for free, and full rules will be posted here.
            Until then, the only paid product on Pay4Rank is ranking credits for leaderboard visibility.
          </p>
        </div>

        <article className="glass-card space-y-4 rounded-[22px] p-5 text-sm leading-relaxed text-white/55 sm:p-6">
          <h2 className="font-display text-lg font-extrabold text-fg">How giveaways work</h2>
          <p>
            A Pay4Rank giveaway is a free website promotion drop — gift cards, software, merch, or
            partner products as announced. It is not the leaderboard. You do not need to buy ranking
            credits to enter. Buying credits does not raise your odds. If a promotion is live, a free
            method of entry is posted with the rules.
          </p>
          <p>
            People search for “win free advertising for my site” and “free website promotion
            giveaway.” When we run one, this page is the official entry and winner list. Each
            giveaway has its own dates, eligibility, and announcement. 18+ only. Void where
            prohibited.
          </p>
          <ul className="space-y-2">
            <li>Giveaways are separate from weekly and monthly Score.</li>
            <li>
              <strong className="text-fg">No purchase necessary</strong> when a giveaway is live.
            </li>
            <li>Ranking credits never improve giveaway odds.</li>
            <li>One entry method per person unless that promotion says otherwise.</li>
          </ul>
          <p className="text-[12px] text-white/40">
            Legal: <Link to="/rules" className="text-gold hover:underline">Platform Rules</Link> ·{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms</Link>
          </p>
        </article>
      </div>
    </PageShell>
  );
}
