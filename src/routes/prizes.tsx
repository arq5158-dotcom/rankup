import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard, getPrizes } from "@/lib/server/rank";
import { PageShell } from "@/components/rank/PageShell";
import { PrizePools } from "@/components/rank/PrizePools";
import { seoHead } from "@/lib/seo";
import { RoutePending } from "@/components/rank/RoutePending";

export const Route = createFileRoute("/prizes")({
  head: () =>
    seoHead({
      title: "Featured Placement Tiers | Top 3 Leaderboard Benefits | Pay4Rank",
      description:
        "Gold, Silver, Bronze, and Weekly Champion featured placement on Pay4Rank: homepage spotlight, badges, and Hall of Fame. Visibility perks — not cash prizes.",
      path: "/prizes",
    }),
  loader: async () => {
    const [prizes, weekly] = await Promise.all([
      getPrizes(),
      getLeaderboard({ data: { cycleType: "weekly", limit: 1 } }),
    ]);
    return { prizes, weekly };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Page,
});

function Page() {
  const { prizes, weekly } = Route.useLoaderData();
  return (
    <PageShell active="Positions">
      <div className="flex items-end gap-3">
        <img
          src="/rank/cup-gold.webp?v=3d4"
          alt=""
          draggable={false}
          className="trophy-3d h-12 w-12 object-contain sm:h-14 sm:w-14"
        />
        <div>
          <p className="page-kicker">Visibility</p>
          <h1 className="page-title">Featured placement tiers</h1>
          <p className="mt-1 max-w-xl text-sm text-white/45">
            Top 3 monthly and the weekly #1 get extra visibility, badges, and history. There is no cash prize for rank.
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-xl text-sm text-white/45">
        Ranking credits buy promotion. Featured titles are part of the listing. See the{" "}
        <a href="/rules" className="text-gold hover:underline">
          platform rules
        </a>
        .
      </p>
      <div className="mt-6">
        <PrizePools prizes={prizes} weeklyChampion={weekly[0] ?? null} />
      </div>
      <article className="glass-card mt-6 space-y-3 rounded-2xl p-5 text-sm leading-relaxed text-white/55 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-fg">What a featured spot actually is</h2>
        <p>
          A featured placement on Pay4Rank is extra room on the public site: trophy styling, badges,
          and a homepage spotlight for Weekly Champion. Monthly Gold, Silver, and Bronze are the top
          three Score totals when the month ends (and while they hold those ranks live). That is a
          listing benefit, not a cash purse and not a Google Ads placement.
        </p>
        <p>
          If you searched for a paid featured listing for websites, a homepage spotlight, or top-3
          leaderboard benefits, this page is the map. Climb with ranking credits or Free Spin Score
          on the monthly or weekly board. Other players can pass you until the cycle archives.
        </p>
      </article>
    </PageShell>
  );
}