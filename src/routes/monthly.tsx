import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/monthly")({
  head: () =>
    seoHead({
      title: "Monthly Prize Pool",
      description:
        "Rank Up monthly prize pool — top three split the cash. Live rankings after Stripe confirms your contribution.",
      path: "/monthly",
    }),
  loader: async () => {
    const [monthly, prizes] = await Promise.all([
      getLeaderboard({ data: { cycleType: "monthly" } }),
      getPrizes(),
    ]);
    return { monthly, prizes };
  },
  component: Monthly,
});

function Monthly() {
  const { monthly, prizes } = Route.useLoaderData();
  const [showAll, setShowAll] = useState(true);
  return (
    <PageShell active="Monthly">
      <main className="relative z-10 mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-black text-gold-grad">Monthly Prize Pool</h1>
        <p className="text-sm text-white/40">Top 3 split the pool. New season, new champions.</p>
        <Podium entries={monthly.slice(0, 3)} />
        <PrizePools prizes={prizes} />
        <LeaderboardTable entries={monthly} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
      </main>
    </PageShell>
  );
}
