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
import { ProfileCard } from "@/components/rank/ProfileMenu";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { seoHead, SITE_DESCRIPTION } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Rank Up — Live Prize Leaderboard",
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

function Home() {
  const { monthly, prizes, stripe } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [showAll, setShowAll] = useState(false);
  const [payOpen, setPayOpen] = useState(true);
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

  const jumpToRankUp = () => {
    setPayOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("rank-up")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const profile = signedIn && !isPending ? (
    <ProfileCard
      name={displayName || "Competitor"}
      email={email}
      image={image}
      completeness={completeness}
      monthlyRank={monthlyRank}
      weeklyRank={weeklyRank}
      twoFactor={twoFactor}
      isAdmin={false}
      className="w-full"
    />
  ) : (
    <div className="glass-card rounded-[22px] p-5">
      <p className="text-sm font-bold text-fg">Join the climb</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-pretty text-white/45">
        Create an account to enter the board and track your rank live.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/login"
          search={{ mode: "in" }}
          className="btn-outline tap inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-bold"
        >
          Login
        </Link>
        <Link
          to="/login"
          search={{ mode: "up" }}
          className="btn-gold tap inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-extrabold"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar active="Leaderboard" account={navAccount} />

      <main id="main" className="relative z-10 mx-auto max-w-[1520px] px-4 pb-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-start lg:gap-5 lg:pt-5">
          <div className="contents lg:flex lg:flex-col lg:gap-4">
            <section className="order-1 grid items-end gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:gap-3">
              <div className="flex min-w-0 max-w-full flex-col lg:pb-6">
                <h1 className="font-display text-[44px] leading-[0.82] font-bold tracking-[-0.02em] text-balance sm:text-[60px] lg:text-[72px]">
                  <span className="text-fg">PAY.</span>
                  <br />
                  <span className="text-fg">CLIMB.</span>
                  <br />
                  <span className="text-gold-grad">WIN.</span>
                </h1>
                <p className="mt-5 max-w-[34ch] text-[13px] leading-relaxed text-pretty text-white/48 sm:text-[14px]">
                  Secure your spot on the leaderboard, outperform, and win real prizes.
                </p>
                <button
                  type="button"
                  onClick={jumpToRankUp}
                  className="btn-gold relative z-10 mt-6 inline-flex min-h-[52px] w-fit items-center gap-1.5 rounded-2xl px-8 text-[15px] font-extrabold sm:min-h-[54px] sm:px-9"
                >
                  Participate Now <ChevronRight className="h-4 w-4" />
                </button>
                <ul className="mt-8 grid w-full grid-cols-3">
                  {[
                    { icon: Trophy, t: "Real Prizes", s: "For Top Rankers" },
                    { icon: Lock, t: "Secure Payments", s: "Powered by Stripe" },
                    { icon: Zap, t: "Live Rankings", s: "Real-time Updates" },
                  ].map((f) => (
                    <li key={f.t} className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center">
                      <f.icon className="h-[18px] w-[18px] text-gold" strokeWidth={1.8} />
                      <div className="min-w-0">
                        <p className="text-[11px] leading-tight font-semibold text-fg">{f.t}</p>
                        <p className="mt-0.5 text-[10px] leading-tight text-white/38">{f.s}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <Podium entries={board.slice(0, 3)} />
            </section>

            <div className="order-3">
              <PrizePools prizes={prizeRows} />
            </div>
            <div className="order-4">
              <LeaderboardTable entries={board} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
            </div>
          </div>

          <div className="contents lg:flex lg:flex-col lg:gap-4">
            <div className="order-2">{profile}</div>
            <div className="order-5">
              <ParticipatePanel
                open={payOpen}
                onClose={() => setPayOpen(false)}
                signedIn={signedIn}
                defaultName={displayName}
                defaultNote={account?.profile.shortNote || ""}
                defaultLink={account?.profile.webLink || ""}
                stripeReady={stripe.configured}
                isOwner={Boolean(account?.profile.isOwner)}
              />
              {!payOpen && (
                <button
                  type="button"
                  onClick={() => setPayOpen(true)}
                  className="glass-card tap flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-bold text-fg">Participate & Rank Up</span>
                    <span className="mt-0.5 block text-[12px] text-white/40">
                      Join the live board after checkout confirms.
                    </span>
                  </span>
                  <span className="btn-gold shrink-0 rounded-xl px-4 py-2 text-[12px] font-extrabold">Enter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
