import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { RoutePending } from "@/components/rank/RoutePending";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/monthly")({
  head: () =>
    seoHead({
      title: "Monthly Board",
      description:
        "Pay4Rank monthly board — top three get Gold, Silver, and Bronze featured placement. Score from credit spends and Free Spin.",
      path: "/monthly",
    }),
  loader: async () => {
    const [monthly, weekly, prizes] = await Promise.all([
      getLeaderboard({ data: { cycleType: "monthly" } }),
      getLeaderboard({ data: { cycleType: "weekly" } }),
      getPrizes(),
    ]);
    return { monthly, weekly, prizes };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Monthly,
});

function Monthly() {
  const { monthly, weekly, prizes } = Route.useLoaderData();
  const [showAll, setShowAll] = useState(true);
  return (
    <PageShell active="Monthly">
      <main className="relative z-10 mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end gap-3">
          <img
            src="/rank/cup-gold.webp?v=3d4"
            alt=""
            draggable={false}
            className="trophy-3d h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <div>
            <h1 className="font-display text-3xl font-black text-gold-grad">Monthly board</h1>
            <p className="mt-1 text-sm text-white/40">Top 3 get featured placement. New month, new climb.</p>
          </div>
        </div>
        <Podium entries={monthly.slice(0, 3)} />
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
        <LeaderboardTable entries={monthly} showAll={showAll} onToggle={() => setShowAll((v) => !v)} cycle="monthly" />
      </main>
    </PageShell>
  );
}
