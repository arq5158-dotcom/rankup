import { useMemo, useState } from "react";
import { Loader2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { spendCredits } from "@/lib/server/rank";
import { loadAccount } from "@/lib/account-cache";
import { formatScore, publicErrorMessage } from "@/lib/utils";
import type { CycleType } from "@/lib/players";
import type { BoardEntry } from "@/lib/server/rank";
import { usePresence, Segmented } from "./motion";

const PRESETS = [1000, 5000, 10_000, 25_000];

function estimateRank(board: BoardEntry[], after: number) {
  const better = board.filter((e) => e.amountPaid > after).length;
  return better + 1;
}

export function RankUpModal({
  open,
  onClose,
  onBuyCredits,
  credits,
  monthlyScore,
  monthlyRank,
  weeklyScore,
  weeklyRank,
  board,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
  credits: number;
  monthlyScore: number;
  monthlyRank: number | null;
  weeklyScore: number;
  weeklyRank: number | null;
  board: BoardEntry[];
  onDone?: () => void;
}) {
  const { shown, on } = usePresence(open, 220);
  const [cycle, setCycle] = useState<CycleType>("monthly");
  const [spend, setSpend] = useState(1000);
  const [custom, setCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState<{ from: number; to: number; spent: number } | null>(null);

  const current = cycle === "monthly" ? monthlyScore : weeklyScore;
  const currentRank = cycle === "monthly" ? monthlyRank : weeklyRank;
  const after = current + Math.min(spend, Math.max(0, credits));
  const est = useMemo(() => estimateRank(board, after), [board, after]);
  const enough = credits >= spend;

  if (!shown) return null;

  const go = async () => {
    if (spend < 1) return;
    if (!enough) return;
    setLoading(true);
    try {
      const res = await spendCredits({ data: { credits: spend, cycleType: cycle } });
      await loadAccount(true);
      if (res.prevRank && res.rank && res.rank < res.prevRank) {
        setMoved({ from: res.prevRank, to: res.rank, spent: res.spent });
      } else {
        toast.success(`+${formatScore(res.spent)} SCORE`);
        onDone?.();
        onClose();
      }
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not rank up."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-layer fixed inset-0 z-[96] grid place-items-center bg-black/75 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card w-full max-w-md rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Rank up</p>
          <button type="button" onClick={onClose} className="tap grid h-10 w-10 place-items-center rounded-full text-white/45" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {moved ? (
          <div className="text-center">
            <p className="font-display text-3xl font-black text-gold-grad">YOU MOVED UP {moved.from - moved.to} POSITIONS</p>
            <p className="mt-2 text-lg font-bold text-fg">
              #{moved.from} → #{moved.to}
            </p>
            <p className="mt-1 text-sm text-white/45">Spent {formatScore(moved.spent)} credits for Score.</p>
            <button
              type="button"
              onClick={() => {
                setMoved(null);
                onDone?.();
                onClose();
              }}
              className="btn-gold tap mt-5 min-h-12 w-full rounded-xl text-sm font-extrabold"
            >
              Nice
            </button>
          </div>
        ) : !enough ? (
          <div>
            <h2 className="font-display text-2xl font-black text-fg">Not enough credits</h2>
            <p className="mt-3 text-sm text-white/50">
              Current balance: <span className="font-bold text-fg">{formatScore(credits)}</span> Credits
            </p>
            <p className="mt-1 text-sm text-white/50">
              Required: <span className="font-bold text-gold">{formatScore(spend)}</span> Credits
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={onBuyCredits} className="btn-gold tap min-h-12 rounded-xl text-xs font-extrabold">
                BUY CREDITS
              </button>
              <button
                type="button"
                onClick={() => setSpend(Math.max(1, credits))}
                className="btn-outline tap min-h-12 rounded-xl text-xs font-bold"
              >
                CHOOSE LOWER AMOUNT
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-black text-fg">Spend credits. Earn score.</h2>
            <p className="mt-3 rounded-xl border border-gold/20 bg-gold/10 px-4 py-3 text-center">
              <span className="block text-[10px] tracking-wider text-white/45 uppercase">Your balance</span>
              <span className="font-display text-3xl font-black text-gold-grad tabular-nums">{formatScore(credits)}</span>
              <span className="mt-1 block text-xs text-white/40">Credits</span>
            </p>
            <div className="mt-4">
              <Segmented
                value={cycle}
                onChange={setCycle}
                options={[
                  { id: "monthly", label: "Monthly" },
                  { id: "weekly", label: "Weekly" },
                ]}
              />
            </div>
            <p className="mt-4 text-[10px] font-semibold tracking-wider text-white/40 uppercase">Credits to spend</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSpend(p);
                    setCustom(false);
                  }}
                  className={`chip tap rounded-[12px] text-xs font-bold ${!custom && spend === p ? "is-on" : ""}`}
                >
                  +{formatScore(p)}
                </button>
              ))}
              <button type="button" onClick={() => setCustom(true)} className={`chip tap rounded-[12px] text-xs font-bold ${custom ? "is-on" : ""}`}>
                Custom
              </button>
            </div>
            {custom ? (
              <input
                type="number"
                min={1}
                value={spend}
                onChange={(e) => setSpend(Math.max(1, Math.round(Number(e.target.value) || 0)))}
                className="mt-3 h-12 w-full rounded-xl border border-white/[0.08] bg-[#12121a] px-3 text-sm text-fg outline-none"
              />
            ) : null}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <p className="text-[9px] tracking-wider text-white/40 uppercase">Current</p>
                <p className="mt-1 text-sm font-extrabold text-fg tabular-nums">{formatScore(current)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <p className="text-[9px] tracking-wider text-white/40 uppercase">After</p>
                <p className="mt-1 text-sm font-extrabold text-gold tabular-nums">{formatScore(after)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <p className="text-[9px] tracking-wider text-white/40 uppercase">Est. rank</p>
                <p className="mt-1 text-sm font-extrabold text-fg">
                  {currentRank ? `#${currentRank}` : "—"} → #{est}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading || spend < 1}
              onClick={() => void go()}
              className="btn-gold tap mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              SPEND {formatScore(spend)} CREDITS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
