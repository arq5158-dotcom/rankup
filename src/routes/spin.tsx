import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { PageShell } from "@/components/rank/PageShell";
import { RoutePending } from "@/components/rank/RoutePending";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimSpin, getMySpinState, getSpinConfig, startFreeSpin, type SpinSegment } from "@/lib/server/spin";
import { loadAccount } from "@/lib/account-cache";
import { formatScore, publicErrorMessage, safeImageSrc } from "@/lib/utils";
import type { CycleType } from "@/lib/players";
import { Segmented } from "@/components/rank/motion";
import { seoHead } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/spin")({
  head: () =>
    seoHead({
      title: "Free Leaderboard Spin — Bonus Score Without Buying Credits | Pay4Rank",
      description:
        "Climb the ranking leaderboard for free. Spin for bonus Score on the weekly or monthly board. Sign in to spin. Credits stay in your wallet.",
      path: "/spin",
    }),
  loader: async () => getSpinConfig(),
  staleTime: 15_000,
  pendingComponent: RoutePending,
  component: SpinPage,
});

const SLICE = 360 / 6;

function Wheel({
  segments,
  rotation,
  spinning,
}: {
  segments: SpinSegment[];
  rotation: number;
  spinning: boolean;
}) {
  const filled = Array.from({ length: 6 }, (_, i) => segments.find((s) => s.slot === i + 1) || {
    slot: i + 1,
    label: `+${100 * (i + 1)}`,
    scoreReward: 100 * (i + 1),
    image: null,
    enabled: true,
  });
  return (
    <div className="wheel-stage">
      <div className="wheel-pointer" />
      <div
        className={`wheel-disk ${spinning ? "is-spinning" : ""}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="wheel-conic" />
        {filled.map((s, i) => {
          const angle = i * SLICE + SLICE / 2;
          const img = safeImageSrc(s.image);
          return (
            <div
              key={s.slot}
              className="wheel-label"
              style={{ transform: `rotate(${angle}deg) translateY(-118px)` }}
            >
              {img ? <img src={img} alt="" className="wheel-art" /> : null}
              <span>+{formatScore(s.scoreReward)}</span>
            </div>
          );
        })}
        <div className="wheel-hub" />
      </div>
    </div>
  );
}

function SpinPage() {
  const { segments: initial } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [segments, setSegments] = useState(initial);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pending, setPending] = useState<{ id: string; slot: number; score: number } | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [cycle, setCycle] = useState<CycleType>("monthly");
  const [result, setResult] = useState<{
    score: number;
    cycleType: CycleType;
    boardScore: number;
    rank: number | null;
    prevRank: number | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void getMySpinState()
      .then((s) => {
        setSegments(s.segments);
        setCanSpin(s.canSpin);
        setPending(s.pending);
      })
      .catch(() => null);
  }, [user?.id]);

  if (isPending && user) return <RoutePending />;

  const spin = async () => {
    if (!user) return;
    if (spinning || busy) return;
    setBusy(true);
    try {
      const res = await startFreeSpin();
      setSpinning(true);
      const land = 360 * 6 + (360 - ((res.slot - 1) * SLICE + SLICE / 2));
      setRotation((r) => r + land);
      window.setTimeout(() => {
        setSpinning(false);
        setPending({ id: res.id, slot: res.slot, score: res.score });
        setCanSpin(false);
      }, 4200);
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not spin."));
    } finally {
      setBusy(false);
    }
  };

  const claim = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await claimSpin({ data: { spinId: pending.id, cycleType: cycle } });
      setResult({
        score: res.score,
        cycleType: res.cycleType,
        boardScore: res.boardScore,
        rank: res.rank,
        prevRank: res.prevRank,
      });
      setPending(null);
      await loadAccount(true);
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not claim."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell active="Free Spin">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase">Free score spin</p>
        <h1 className="font-hero text-4xl tracking-[0.06em] text-fg sm:text-5xl">SPIN. SCORE. CLIMB.</h1>
        <p className="mx-auto max-w-md text-sm text-white/50">
          Spin for free bonus Score on the weekly or monthly board — you pick which. Never credits, only Score.
        </p>
        <div className="mx-auto max-w-xs">
          <Segmented
            value={cycle}
            onChange={setCycle}
            options={[
              { id: "monthly", label: "Monthly" },
              { id: "weekly", label: "Weekly" },
            ]}
          />
        </div>
        <Wheel segments={segments} rotation={rotation} spinning={spinning} />
        {user ? (
          <button
            type="button"
            disabled={busy || spinning || !canSpin || Boolean(pending)}
            onClick={() => void spin()}
            className="btn-gold tap mx-auto flex min-h-14 min-w-[220px] items-center justify-center gap-2 rounded-full px-8 text-sm font-extrabold"
          >
            {busy || spinning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            SPIN FREE
          </button>
        ) : (
          <Link
            to="/login"
            search={{ mode: "in" }}
            className="btn-gold tap mx-auto flex min-h-14 min-w-[220px] items-center justify-center gap-2 rounded-full px-8 text-sm font-extrabold"
          >
            <Sparkles className="h-4 w-4" />
            SIGN IN TO SPIN
          </Link>
        )}
        {user && !canSpin && !pending && !result ? (
          <p className="text-xs text-white/40">Next free spin unlocks in 24 hours.</p>
        ) : null}
        {!user ? (
          <p className="text-xs text-white/40">Free for every signed-in player. One spin per day. Score only — never credits.</p>
        ) : null}
        <Link to="/" className="block text-xs text-gold">Back to leaderboard</Link>
      </div>
      {pending && !spinning ? (
        <div className="modal-layer is-open fixed inset-0 z-[96] grid place-items-center bg-black/75 p-4">
          <div className="modal-card glass-card w-full max-w-sm rounded-2xl p-6 text-center">
            <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">You won</p>
            <p className="mt-2 font-display text-4xl font-black text-gold-grad">+{formatScore(pending.score)} SCORE</p>
            <p className="mt-2 text-xs text-white/40">Claim onto the {cycle} board.</p>
            <div className="mx-auto mt-3 max-w-xs">
              <Segmented
                value={cycle}
                onChange={setCycle}
                options={[
                  { id: "monthly", label: "Monthly" },
                  { id: "weekly", label: "Weekly" },
                ]}
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void claim()}
              className="btn-gold tap mt-5 min-h-12 w-full rounded-xl text-sm font-extrabold"
            >
              CLAIM +{formatScore(pending.score)} SCORE
            </button>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="modal-layer is-open fixed inset-0 z-[96] grid place-items-center bg-black/75 p-4">
          <div className="modal-card glass-card w-full max-w-sm rounded-2xl p-6 text-center">
            <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Score claimed</p>
            <p className="mt-2 font-display text-3xl font-black text-fg">+{formatScore(result.score)}</p>
            <p className="mt-3 text-sm text-white/50 capitalize">
              New {result.cycleType} score {formatScore(result.boardScore)}
            </p>
            {result.prevRank && result.rank && result.rank < result.prevRank ? (
              <p className="mt-2 text-sm font-bold text-success">
                YOU MOVED UP! #{result.prevRank} → #{result.rank}
              </p>
            ) : null}
            <button type="button" onClick={() => setResult(null)} className="btn-gold tap mt-5 min-h-12 w-full rounded-xl text-sm font-extrabold">
              Keep climbing
            </button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
