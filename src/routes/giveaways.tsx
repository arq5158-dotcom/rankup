import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { PageShell } from "@/components/rank/PageShell";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/giveaways")({
  head: () =>
    seoHead({
      title: "Community Giveaways — No Purchase Necessary",
      description:
        "Pay4Rank giveaways are separate from the paid leaderboard. No purchase necessary. Buying ranking credits does not improve your odds. 18+ only.",
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
            <p className="page-kicker">Community</p>
            <h1 className="page-title">Giveaways</h1>
            <p className="mt-1 max-w-xl text-sm text-white/45">
              Optional community promotions. Separate from ranking credits. Never a pay-to-win drawing.
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

        <div className="glass-card space-y-3 rounded-[22px] p-5 sm:p-6">
          <h2 className="text-sm font-extrabold tracking-[0.14em] text-fg uppercase">How giveaways work</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-white/55">
            <li>Giveaways are operated separately from the paid weekly and monthly leaderboards.</li>
            <li>
              <strong className="text-fg">No purchase necessary</strong> where the law requires a free method of
              entry — and we offer one whenever a giveaway is live.
            </li>
            <li>
              Buying ranking credits does <strong className="text-fg">not</strong> increase your chance of
              winning a giveaway.
            </li>
            <li>Each giveaway has its own eligibility, entry period, rules, and winner announcement.</li>
            <li>Prizes may include gift cards, tech, software, merch, or partner products as announced.</li>
            <li>18+ only. Void where prohibited. One entry method per person unless a given promotion says otherwise.</li>
          </ul>
          <p className="pt-1 text-[12px] text-white/40">
            Full legal terms: <Link to="/rules" className="text-gold hover:underline">Platform Rules</Link> ·{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
