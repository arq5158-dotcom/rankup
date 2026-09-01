import { useEffect, useMemo, useState } from "react";
import { Loader2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { spendCredits } from "@/lib/server/rank";
import { getCreditEconomy } from "@/lib/server/economy";
import { DEFAULT_ECONOMY } from "@/lib/economy";
import { loadAccount } from "@/lib/account-cache";
import { formatScore, formatUsd, publicErrorMessage } from "@/lib/utils";
import type { CycleType } from "@/lib/players";
import type { BoardEntry } from "@/lib/server/rank";
import { usePresence, Segmented } from "./motion";

const PRESETS = [1000, 5000, 10_000, 25_000];

function estimateRank(board: BoardEntry[], after: number) {
  const better = board.filter((e) => e.amountPaid > after).length;
  return better + 1;
}

function clampSpend(n: number, cap: number) {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(cap, Math.round(n));
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
  weeklyBoard,
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
  weeklyBoard?: BoardEntry[];
  onDone?: () => void;
}) {
  const { shown, on } = usePresence(open, 220);
  const [rate, setRate] = useState(DEFAULT_ECONOMY.creditsPerUsd);
  const [cycle, setCycle] = useState<CycleType>("monthly");
  const [spend, setSpend] = useState(1000);
  const [usdText, setUsdText] = useState("1");
  const [custom, setCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState<{
    spent: number;
    from: number | null;
    to: number | null;
    cycle: CycleType;
  } | null>(null);

  const cap = Math.max(1, Math.min(1_000_000, Math.floor(credits) || 1));
  const add = Math.min(spend, Math.max(0, credits));
  const usdValue = rate > 0 ? add / rate : 0;
  const current = cycle === "monthly" ? monthlyScore : weeklyScore;
  const currentRank = cycle === "monthly" ? monthlyRank : weeklyRank;
  const after = current + add;
  const estBoard = cycle === "weekly" && weeklyBoard?.length ? weeklyBoard : board;
  const est = useMemo(() => estimateRank(estBoard, after), [estBoard, after]);
  const enough = credits >= spend;

  useEffect(() => {
    if (!open) return;
    void getCreditEconomy()
      .then((eco) => setRate(eco.creditsPerUsd || DEFAULT_ECONOMY.creditsPerUsd))
      .catch(() => setRate(DEFAULT_ECONOMY.creditsPerUsd));
  }, [open]);

  const applyCredits = (n: number) => {
    const next = clampSpend(n, cap);
    setSpend(next);
    setUsdText(rate > 0 ? (next / rate).toFixed(2).replace(/\.00$/, "") : "0");
  };

  const applyUsd = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const safe = parts.length > 1 ? `${parts[0].slice(0, 7)}.${parts.slice(1).join("").slice(0, 2)}` : parts[0].slice(0, 7);
    setUsdText(safe);
    const usd = Number(safe);
    if (!Number.isFinite(usd) || usd <= 0) {
      setSpend(1);
      return;
    }
    setSpend(clampSpend(usd * rate, cap));
  };

  if (!shown) return null;

  const go = async () => {
    if (loading || spend < 1 || !enough) return;
    setLoading(true);
    try {
      const res = await spendCredits({ data: { credits: spend, cycleType: cycle } });
      try {
        await loadAccount(true);
      } catch {
        /* spend already succeeded */
      }
      if (res.prevRank && res.rank && res.rank < res.prevRank) {
        setMoved({ spent: res.spent, from: res.prevRank, to: res.rank, cycle: res.cycleType });
        onDone?.();
      } else {
        toast.success(`+${formatScore(res.spent)} SCORE on the ${res.cycleType} board`);
        onDone?.();
        onClose();
      }
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not rank up."));
    } finally {
      setLoading(false);
    }
  };

  const gain = moved?.from && moved.to && moved.to < moved.from ? moved.from - moved.to : 0;

  return (
    <div className={`modal-layer fixed inset-0 z-[96] grid place-items-center bg-black/70 p-3 sm:p-4 ${on ? "is-open" : ""}`}>
      <div className="rank-modal modal-card glass-card max-h-[min(90dvh,640px)] w-full max-w-[360px] overflow-y-auto rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Rank up</p>
          <button type="button" onClick={() => { if (moved) onDone?.(); onClose(); }} className="tap grid h-8 w-8 place-items-center rounded-full text-white/45" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {moved ? (
          <div className="text-center">
            <p className="font-display text-xl font-black text-gold-grad">
              YOU MOVED UP {gain} POSITIONS
            </p>
            <p className="mt-2 text-sm font-bold text-fg capitalize">
              {moved.cycle} {moved.from ? `#${moved.from}` : "—"} → {moved.to ? `#${moved.to}` : "—"}
            </p>
            <p className="mt-1.5 text-xs text-white/45">+{formatScore(moved.spent)} Score on the {moved.cycle} board.</p>
            <button
              type="button"
              onClick={() => {
                setMoved(null);
                onDone?.();
                onClose();
              }}
              className="btn-gold tap mt-4 min-h-10 w-full rounded-lg text-xs font-extrabold"
            >
              Nice
            </button>
          </div>
        ) : !enough ? (
          <div>
            <h2 className="font-display text-xl font-black text-fg">Not enough credits</h2>
            <p className="mt-2 text-sm text-white/50">
              Current balance: <span className="font-bold text-fg">{formatScore(credits)}</span> Credits
            </p>
            <p className="mt-1 text-sm text-white/50">
              Required: <span className="font-bold text-gold">{formatScore(spend)}</span> Credits
              {rate > 0 ? ` · $${formatUsd(spend / rate)}` : ""}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={onBuyCredits} className="btn-gold tap min-h-10 rounded-lg text-[11px] font-extrabold">
                BUY CREDITS
              </button>
              <button
                type="button"
                onClick={() => applyCredits(Math.max(1, credits))}
                className="btn-outline tap min-h-10 rounded-lg text-[11px] font-bold"
              >
                LOWER AMOUNT
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-black tracking-tight text-fg">Spend credits. Earn score.</h2>
            <p className="mt-1 text-[11px] text-white/40">
              $1 = {formatScore(rate)} Credits = {formatScore(rate)} Score · Pick one board
            </p>
            <div className="mt-2.5">
              <Segmented
                value={cycle}
                onChange={setCycle}
                options={[
                  { id: "monthly", label: "Monthly" },
                  { id: "weekly", label: "Weekly" },
                ]}
              />
            </div>
            <p className="mt-2.5 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-center">
              <span className="block text-[9px] tracking-wider text-white/45 uppercase">Your balance</span>
              <span className="font-display text-2xl font-black text-gold-grad tabular-nums">{formatScore(credits)}</span>
              <span className="mt-0.5 block text-[11px] text-white/40">
                Credits · ${formatUsd(credits / rate)}
              </span>
            </p>
            <p className="mt-3 text-[9px] font-semibold tracking-wider text-white/40 uppercase">Credits to spend</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    applyCredits(p);
                    setCustom(false);
                  }}
                  className={`chip tap flex flex-col items-center rounded-[10px] py-1.5 ${!custom && spend === p ? "is-on" : ""}`}
                >
                  <span className="text-[11px] font-bold">+{formatScore(p)}</span>
                  <span className="text-[9px] opacity-70">${formatUsd(p / rate)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustom(true);
                  setUsdText(rate > 0 ? (spend / rate).toFixed(2).replace(/\.00$/, "") : "0");
                }}
                className={`chip tap rounded-[10px] text-[11px] font-bold ${custom ? "is-on" : ""}`}
              >
                Custom
              </button>
            </div>
            {custom ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-semibold tracking-wider text-white/40 uppercase">USD</span>
                  <div className="flex h-9 items-center rounded-lg border border-white/[0.08] bg-[#12121a] px-2.5">
                    <span className="mr-1 text-xs text-white/35">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={usdText}
                      onChange={(e) => applyUsd(e.target.value)}
                      className="h-full w-full bg-transparent text-sm text-fg outline-none"
                      aria-label="USD equivalent"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-semibold tracking-wider text-white/40 uppercase">Credits</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={String(spend)}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, String(cap).length);
                      applyCredits(Number(digits) || 1);
                    }}
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#12121a] px-2.5 text-sm text-fg outline-none"
                    aria-label="Custom credits to spend"
                  />
                </label>
              </div>
            ) : null}
            <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-center">
              <p className="text-[9px] font-semibold tracking-wider text-white/40 uppercase">Live conversion</p>
              <p className="mt-1 text-[12px] font-bold text-fg">
                ${formatUsd(usdValue)} → {formatScore(add)} Credits → +{formatScore(add)} {cycle} Score
              </p>
              <p className="mt-0.5 text-[10px] text-white/40">Only the {cycle} leaderboard changes.</p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-white/[0.03] px-1.5 py-2">
                <p className="text-[8px] tracking-wider text-white/40 uppercase">Current</p>
                <p className="mt-0.5 text-[12px] font-extrabold text-fg tabular-nums">{formatScore(current)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] px-1.5 py-2">
                <p className="text-[8px] tracking-wider text-white/40 uppercase">After</p>
                <p className="mt-0.5 text-[12px] font-extrabold text-gold tabular-nums">{formatScore(after)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] px-1.5 py-2">
                <p className="text-[8px] tracking-wider text-white/40 uppercase">Est. rank</p>
                <p className="mt-0.5 text-[12px] font-extrabold text-fg">
                  {currentRank ? `#${currentRank}` : "—"} → #{est}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading || spend < 1}
              onClick={() => void go()}
              className="btn-gold tap mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-extrabold"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              SPEND {formatScore(spend)} · ${formatUsd(usdValue)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
