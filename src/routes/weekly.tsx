import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { RoutePending } from "@/components/rank/RoutePending";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/weekly")({
  head: () =>
    seoHead({
      title: "Weekly Challenge",
      description:
        "Pay4Rank weekly spotlight — #1 gets the Weekly Champion badge and featured placement. Rankings reset every Sunday.",
      path: "/weekly",
    }),
  loader: async () => {
    const [weekly, prizes] = await Promise.all([
      getLeaderboard({ data: { cycleType: "weekly" } }),
      getPrizes(),
    ]);
    return { weekly, prizes };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Weekly,
});

function Weekly() {
  const { weekly, prizes } = Route.useLoaderData();
  const [showAll, setShowAll] = useState(true);
  return (
    <PageShell active="Weekly">
      <main className="relative z-10 mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end gap-3">
          <img
            src="/rank/cup-weekly.webp?v=3d4"
            alt=""
            draggable={false}
            className="trophy-3d h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <div>
            <h1 className="font-display text-3xl font-black text-gold-grad">Weekly Challenge</h1>
            <p className="mt-1 text-sm text-white/40">Only #1 is featured this week. Rankings reset every Sunday.</p>
          </div>
        </div>
        <Podium entries={weekly.slice(0, 3)} />
        <PrizePools prizes={prizes} />
        <LeaderboardTable entries={weekly} showAll={showAll} onToggle={() => setShowAll((v) => !v)} cycle="weekly" />
      </main>
    </PageShell>
  );
}
