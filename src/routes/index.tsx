import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, Trophy, Zap } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { CycleType } from "@/lib/players";
import {
  getLeaderboard,
  getPrizes,
  getStripeStatus,
  type BoardEntry,
  type PrizeRow,
} from "@/lib/server/rank";
import { loadAccount, peekAccount, type MyAccount } from "@/lib/account-cache";
import { Navbar } from "@/components/rank/Navbar";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { BuyCreditsModal } from "@/components/rank/BuyCreditsModal";
import { RankUpModal } from "@/components/rank/RankUpModal";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { RoutePending } from "@/components/rank/RoutePending";
import { seoHead, SITE_DESCRIPTION } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Pay4Rank — Promotional Leaderboard",
      description: SITE_DESCRIPTION,
      path: "/",
    }),
  loader: async () => {
    const [monthly, weekly, prizes, stripe] = await Promise.all([
      getLeaderboard({ data: { cycleType: "monthly" } }),
      getLeaderboard({ data: { cycleType: "weekly" } }),
      getPrizes(),
      getStripeStatus(),
    ]);
    return { monthly, weekly, prizes, stripe };
  },
  staleTime: 20_000,
  pendingComponent: RoutePending,
  component: Home,
});

function TrustRow({ className = "" }: { className?: string }) {
  return (
    <ul className={`trust-row w-full max-w-[400px] ${className}`}>
      {[
        { icon: Trophy, t: "Get Seen", s: "Featured Placement" },
        { icon: Lock, t: "Secure Payments", s: "Powered by Stripe" },
        { icon: Zap, t: "Live Rankings", s: "Real-time Updates" },
      ].map((f) => (
        <li key={f.t} className="flex min-w-0 flex-col items-center gap-1.5 px-1.5 py-1 text-center sm:gap-2 sm:px-2">
          <f.icon className="h-5 w-5 text-gold sm:h-[22px] sm:w-[22px]" strokeWidth={1.7} />
          <div className="min-w-0">
            <p className="text-[11px] leading-tight font-semibold text-fg sm:text-[12px]">{f.t}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-white/42">{f.s}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const { monthly, weekly, prizes, stripe } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [showAll, setShowAll] = useState(false);
  const [cycle, setCycle] = useState<CycleType>("monthly");
  const [payOpen, setPayOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);
  const [account, setAccount] = useState<MyAccount | null>(() => peekAccount());
  const [monthlyBoard, setMonthlyBoard] = useState<BoardEntry[]>(monthly);
  const [weeklyBoard, setWeeklyBoard] = useState<BoardEntry[]>(weekly);
  const [prizeRows, setPrizeRows] = useState<PrizeRow[]>(prizes);
  const board = cycle === "weekly" ? weeklyBoard : monthlyBoard;

  useEffect(() => {
    setMonthlyBoard(monthly);
    setWeeklyBoard(weekly);
    setPrizeRows(prizes);
  }, [monthly, weekly, prizes]);

  useEffect(() => {
    if (!user) {
      setAccount(null);
      return;
    }
    void loadAccount()
      .then(setAccount)
      .catch(() => setAccount(null));
  }, [user?.id]);

  const signedIn = Boolean(user);
  const isAdmin = Boolean(account?.profile.isAdmin);
  const displayName = account?.profile.displayName || user?.displayName || "";
  const email = account?.profile.email || user?.primaryEmail || "";
  const image = account?.profile.profileImage || user?.profileImageUrl || null;
  const completeness = account?.completeness ?? 20;
  const monthlyRank = account?.monthlyRank ?? null;
  const weeklyRank = account?.weeklyRank ?? null;
  const twoFactor = account?.profile.twoFactorEnabled ?? false;

  const navAccount = signedIn
    ? {
        name: displayName || "Competitor",
        email,
        image,
        completeness,
        monthlyRank,
        weeklyRank,
        twoFactor,
        isAdmin,
        isOwner: Boolean(account?.profile.isOwner),
      }
    : null;

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#rank-up") setRankOpen(true);
      if (window.location.hash === "#buy") setPayOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const jumpToRankUp = () => {
    setRankOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("rank-up")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative min-h-screen">
      <Navbar active="Leaderboard" account={navAccount} />

      <main id="main" className="relative z-10 mx-auto max-w-[1640px] px-3 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 pt-2 sm:pt-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,300px)] lg:items-start lg:gap-x-8 lg:gap-y-5 lg:pt-4">
          <section className="order-1 min-w-0">
            <div className="grid items-end gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8">
              <div className="flex min-w-0 flex-col">
                <h1 className="font-hero flex flex-col gap-[0.18em] text-[36px] leading-none font-normal tracking-[0.05em] sm:text-[52px] lg:text-[64px]">
                  <span className="text-fg">PAY.</span>
                  <span className="text-fg">CLIMB.</span>
                  <span className="text-gold-grad">GET SEEN.</span>
                </h1>
                <p className="mt-3 hidden max-w-[34ch] text-[13px] leading-[1.55] text-pretty text-white/62 sm:mt-4 sm:block sm:text-[14px]">
                  Buy credits, spend them for Score, and get your profile, brand, or site seen.
                </p>
                <button
                  type="button"
                  onClick={jumpToRankUp}
                  className="btn-gold relative z-10 mt-4 hidden min-h-[48px] w-fit items-center gap-1.5 rounded-[14px] px-7 pr-6 text-[15px] font-extrabold sm:mt-5 sm:inline-flex sm:min-h-[50px] sm:px-8 sm:pr-7"
                >
                  <span>RANK UP</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <TrustRow className="mt-7 hidden lg:grid" />
              </div>
              <Podium entries={board.slice(0, 3)} />
            </div>
            <div className="mt-4 flex flex-col items-start gap-3 sm:hidden">
              <p className="max-w-[36ch] text-[13px] leading-[1.55] text-pretty text-white/62">
                Buy credits, spend them for Score, and get your profile, brand, or site seen.
              </p>
              <button
                type="button"
                onClick={jumpToRankUp}
                className="btn-gold relative z-10 inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-[14px] px-6 text-[15px] font-extrabold"
              >
                <span>RANK UP</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <TrustRow className="mt-5 grid lg:hidden" />
          </section>

          <aside className="order-2 flex flex-col-reverse gap-4 lg:order-2 lg:row-span-2 lg:flex-col">
            {!signedIn && !isPending ? (
              <div className="glass-card card-3d rounded-[22px] p-4">
                <p className="text-[15px] font-bold text-fg">Join the climb</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-pretty text-white/55">
                  Create an account to buy credits, spend them for Score, and put your profile on the live board.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    search={{ mode: "in" }}
                    className="btn-outline tap inline-flex min-h-11 items-center justify-center rounded-[12px] text-sm font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    search={{ mode: "up" }}
                    className="btn-gold tap inline-flex min-h-11 items-center justify-center rounded-[12px] text-sm font-extrabold"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : null}
            <div id="rank-up" className="scroll-mt-24">
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="glass-card tap mb-0 flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-4 text-left"
              >
                <span>
                  <span className="block text-sm font-bold text-fg">Buy credits</span>
                  <span className="mt-0.5 block text-[12px] text-white/40">
                    $1 = 1,000 credits. Spend credits 1:1 for Score.
                  </span>
                </span>
                <span className="btn-gold shrink-0 rounded-[12px] px-4 py-2 text-[12px] font-extrabold">Buy</span>
              </button>
            </div>
          </aside>

          <div className="order-3">
            <PrizePools prizes={prizeRows} weeklyChampion={weeklyBoard[0] ?? null} />
          </div>

          <div className="order-4 lg:col-span-2">
            <LeaderboardTable
              entries={board}
              showAll={showAll}
              onToggle={() => setShowAll((v) => !v)}
              cycle={cycle}
              onCycleChange={setCycle}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
      <RankUpModal
        open={rankOpen}
        onClose={() => setRankOpen(false)}
        onBuyCredits={() => {
          setRankOpen(false);
          setPayOpen(true);
        }}
        credits={account?.credits ?? 0}
        monthlyScore={account?.monthlyPaid ?? 0}
        monthlyRank={monthlyRank}
        weeklyScore={account?.weeklyPaid ?? 0}
        weeklyRank={weeklyRank}
        board={monthlyBoard}
        weeklyBoard={weeklyBoard}
        onDone={() => {
          void loadAccount(true).then(setAccount).catch(() => null);
        }}
      />
      <BuyCreditsModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        signedIn={signedIn}
        displayName={displayName}
        stripeReady={stripe.configured}
        isOwner={Boolean(account?.profile.isOwner)}
      />
    </div>
  );
}
