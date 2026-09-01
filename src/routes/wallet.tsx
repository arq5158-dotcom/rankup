import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadAccount } from "@/lib/account-cache";
import { getMyLedger, type LedgerRow } from "@/lib/server/economy";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { BuyCreditsModal } from "@/components/rank/BuyCreditsModal";
import { RankUpModal } from "@/components/rank/RankUpModal";
import { RoutePending } from "@/components/rank/RoutePending";
import { getLeaderboard } from "@/lib/server/rank";
import { formatScore, formatUsd } from "@/lib/utils";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/wallet")({
  head: () =>
    seoHead({
      title: "Credits Wallet",
      description: "Buy Pay4Rank credits, review your wallet, and spend credits for Score.",
      path: "/wallet",
      noindex: true,
    }),
  loader: async () => {
    try {
      const [account, ledger, monthly] = await Promise.all([
        loadAccount(),
        getMyLedger(),
        getLeaderboard({ data: { cycleType: "monthly" } }),
      ]);
      return { account, ledger, monthly };
    } catch {
      return { account: null, ledger: [] as LedgerRow[], monthly: [] };
    }
  },
  staleTime: 8_000,
  pendingComponent: RoutePending,
  component: WalletPage,
});

function kindLabel(row: LedgerRow) {
  if (row.kind === "purchase") return "Purchased";
  if (row.kind === "spend") return "Used to Rank Up";
  if (row.kind === "spin") return "Free Spin (Score)";
  return row.kind;
}

function WalletPage() {
  const loaded = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [buyOpen, setBuyOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);
  const account = loaded.account;
  const ledger = loaded.ledger;

  if (isPending && !account) return <RoutePending />;
  if (!user && !account) return <RedirectToSignIn />;
  if (!account) return <RoutePending />;

  return (
    <div className="relative min-h-screen">
      <Navbar active="Wallet" />
      <main className="page-enter relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Credits wallet</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-black text-fg">
          <Wallet className="h-7 w-7 text-gold" /> Available credits
        </h1>
        <p className="mt-4 font-display text-5xl font-black text-gold-grad tabular-nums">{formatScore(account.credits)}</p>
        <p className="mt-2 text-sm text-white/40">Credits purchased through your account. Public boards show Score only.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setBuyOpen(true)} className="btn-gold tap min-h-12 rounded-xl px-5 text-sm font-extrabold">
            BUY CREDITS
          </button>
          <button type="button" onClick={() => setRankOpen(true)} className="btn-outline tap min-h-12 rounded-xl px-5 text-sm font-bold">
            RANK UP
          </button>
          <Link to="/spin" className="btn-outline tap inline-flex min-h-12 items-center rounded-xl px-5 text-sm font-bold">
            FREE SPIN
          </Link>
        </div>

        <h2 className="mt-10 text-sm font-extrabold tracking-wider text-white/50 uppercase">Credit activity</h2>
        <div className="mt-3 space-y-2">
          {ledger.length === 0 ? (
            <p className="glass-card rounded-2xl p-6 text-center text-sm text-white/40">No credit activity yet.</p>
          ) : (
            ledger.map((row) => (
              <div key={row.id} className="glass-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <div className="min-w-0">
                  <p className={`text-sm font-extrabold tabular-nums ${row.creditsDelta >= 0 ? "text-success" : "text-danger"}`}>
                    {row.creditsDelta >= 0 ? "+" : ""}
                    {formatScore(row.creditsDelta)} Credits
                  </p>
                  <p className="text-xs text-white/40">{kindLabel(row)}</p>
                  <p className="text-[11px] text-white/30">{row.createdAt.replace("T", " ").slice(0, 19)}</p>
                  {row.stripeSessionId ? (
                    <p className="truncate text-[10px] text-white/25">Stripe {row.stripeSessionId.slice(0, 18)}…</p>
                  ) : null}
                </div>
                <div className="text-right">
                  {row.usdAmount != null ? <p className="text-xs text-white/35">${formatUsd(row.usdAmount)}</p> : null}
                  {row.resultingCredits != null ? (
                    <p className="text-xs text-white/45">Bal {formatScore(row.resultingCredits)}</p>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
      <BuyCreditsModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        signedIn
        displayName={account.profile.displayName || user?.displayName || "Competitor"}
      />
      <RankUpModal
        open={rankOpen}
        onClose={() => setRankOpen(false)}
        onBuyCredits={() => {
          setRankOpen(false);
          setBuyOpen(true);
        }}
        credits={account.credits}
        monthlyScore={account.monthlyPaid}
        monthlyRank={account.monthlyRank}
        weeklyScore={account.weeklyPaid ?? 0}
        weeklyRank={account.weeklyRank}
        board={loaded.monthly}
      />
    </div>
  );
}
