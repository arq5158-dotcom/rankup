import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, Trophy, Zap } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getLeaderboard,
  getMyAccount,
  getPrizes,
  getStripeStatus,
  type BoardEntry,
  type PrizeRow,
} from "@/lib/server/rank";
import { SceneBackground } from "@/components/rank/Background";
import { Navbar } from "@/components/rank/Navbar";
import { Podium } from "@/components/rank/Podium";
import { PrizePools } from "@/components/rank/PrizePools";
import { LeaderboardTable } from "@/components/rank/LeaderboardTable";
import { ParticipatePanel } from "@/components/rank/ParticipatePanel";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { FluidFold } from "@/components/rank/motion";
import { seoHead, SITE_DESCRIPTION } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Pay4Rank — Promotional Leaderboard",
      description: SITE_DESCRIPTION,
      path: "/",
    }),
  loader: async () => {
    const [monthly, prizes, stripe] = await Promise.all([
      getLeaderboard({ data: { cycleType: "monthly" } }),
      getPrizes(),
      getStripeStatus(),
    ]);
    return { monthly, prizes, stripe };
  },
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
  const { monthly, prizes, stripe } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [showAll, setShowAll] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [board, setBoard] = useState<BoardEntry[]>(monthly);
  const [prizeRows, setPrizeRows] = useState<PrizeRow[]>(prizes);

  useEffect(() => {
    setBoard(monthly);
    setPrizeRows(prizes);
  }, [monthly, prizes]);

  useEffect(() => {
    if (!user) {
      setAccount(null);
      return;
    }
    void getMyAccount()
      .then(setAccount)
      .catch(() => setAccount(null));
  }, [user]);

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
      if (window.location.hash === "#rank-up") setPayOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const jumpToRankUp = () => {
    setPayOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("rank-up")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative min-h-screen">
      <SceneBackground />
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
                  Buy ranking credits, outperform the board, and get your profile, brand, or site seen.
                </p>
                <button
                  type="button"
                  onClick={jumpToRankUp}
                  className="btn-gold relative z-10 mt-4 hidden min-h-[48px] w-fit items-center gap-1.5 rounded-[14px] px-7 pr-6 text-[15px] font-extrabold sm:mt-5 sm:inline-flex sm:min-h-[50px] sm:px-8 sm:pr-7"
                >
                  <span>Promote Now</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <TrustRow className="mt-7 hidden lg:grid" />
              </div>
              <Podium entries={board.slice(0, 3)} />
            </div>
            <div className="mt-4 flex flex-col items-start gap-3 sm:hidden">
              <p className="max-w-[36ch] text-[13px] leading-[1.55] text-pretty text-white/62">
                Buy ranking credits, outperform the board, and get your profile, brand, or site seen.
              </p>
              <button
                type="button"
                onClick={jumpToRankUp}
                className="btn-gold relative z-10 inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-[14px] px-6 text-[15px] font-extrabold"
              >
                <span>Participate Now</span>
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
                  Create an account to buy ranking credits and put your profile on the live board.
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
              <FluidFold open={!payOpen}>
                <button
                  type="button"
                  onClick={() => setPayOpen(true)}
                  className="glass-card tap mb-0 flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-bold text-fg">Buy ranking credits</span>
                    <span className="mt-0.5 block text-[12px] text-white/40">
                      Climb the live board after checkout confirms.
                    </span>
                  </span>
                  <span className="btn-gold shrink-0 rounded-[12px] px-4 py-2 text-[12px] font-extrabold">Enter</span>
                </button>
              </FluidFold>
              <FluidFold open={payOpen}>
                <ParticipatePanel
                  open
                  onClose={() => setPayOpen(false)}
                  signedIn={signedIn}
                  defaultName={displayName}
                  defaultNote={account?.profile.shortNote || ""}
                  defaultLink={account?.profile.webLink || ""}
                  stripeReady={stripe.configured}
                  isOwner={Boolean(account?.profile.isOwner)}
                />
              </FluidFold>
            </div>
          </aside>

          <div className="order-3">
            <PrizePools prizes={prizeRows} />
          </div>

          <div className="order-4 lg:col-span-2">
            <LeaderboardTable entries={board} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
