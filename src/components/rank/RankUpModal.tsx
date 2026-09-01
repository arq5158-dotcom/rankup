import { useEffect, useMemo, useState } from "react";
import { Loader2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { spendCredits } from "@/lib/server/rank";
import { getCreditEconomy } from "@/lib/server/economy";
import { DEFAULT_ECONOMY } from "@/lib/economy";
import { loadAccount } from "@/lib/account-cache";
import { formatScore, formatUsd, publicErrorMessage } from "@/lib/utils";
import type { BoardEntry } from "@/lib/server/rank";
import { usePresence } from "./motion";

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
  const [spend, setSpend] = useState(1000);
  const [usdText, setUsdText] = useState("1");
  const [custom, setCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState<{
    spent: number;
    monthlyFrom: number | null;
    monthlyTo: number | null;
    weeklyFrom: number | null;
    weeklyTo: number | null;
  } | null>(null);

  const cap = Math.max(1, Math.min(1_000_000, Math.floor(credits) || 1));
  const add = Math.min(spend, Math.max(0, credits));
  const usdValue = rate > 0 ? add / rate : 0;
  const monthlyAfter = monthlyScore + add;
  const weeklyAfter = weeklyScore + add;
  const estMonthly = useMemo(() => estimateRank(board, monthlyAfter), [board, monthlyAfter]);
  const estWeekly = useMemo(
    () => estimateRank(weeklyBoard && weeklyBoard.length ? weeklyBoard : board, weeklyAfter),
    [weeklyBoard, board, weeklyAfter],
  );
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
    if (spend < 1) return;
    if (!enough) return;
    setLoading(true);
    try {
      const res = await spendCredits({ data: { credits: spend } });
      await loadAccount(true);
      const climbed =
        (res.monthlyPrev && res.monthlyRank && res.monthlyRank < res.monthlyPrev) ||
        (res.weeklyPrev && res.weeklyRank && res.weeklyRank < res.weeklyPrev);
      if (climbed) {
        setMoved({
          spent: res.spent,
          monthlyFrom: res.monthlyPrev,
          monthlyTo: res.monthlyRank,
          weeklyFrom: res.weeklyPrev,
          weeklyTo: res.weeklyRank,
        });
      } else {
        toast.success(`+${formatScore(res.spent)} SCORE on weekly and monthly`);
        onDone?.();
        onClose();
      }
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not rank up."));
    } finally {
      setLoading(false);
    }
  };

  const monthlyGain =
    moved?.monthlyFrom && moved.monthlyTo && moved.monthlyTo < moved.monthlyFrom
      ? moved.monthlyFrom - moved.monthlyTo
      : 0;
  const weeklyGain =
    moved?.weeklyFrom && moved.weeklyTo && moved.weeklyTo < moved.weeklyFrom ? moved.weeklyFrom - moved.weeklyTo : 0;

  return (
    <div className={`modal-layer fixed inset-0 z-[96] grid place-items-center bg-black/75 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card max-h-[min(92dvh,720px)] w-full max-w-md overflow-y-auto rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Rank up</p>
          <button type="button" onClick={onClose} className="tap grid h-10 w-10 place-items-center rounded-full text-white/45" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {moved ? (
          <div className="text-center">
            <p className="font-display text-2xl font-black text-gold-grad">
              YOU MOVED UP {Math.max(monthlyGain, weeklyGain)} POSITIONS
            </p>
            <p className="mt-3 text-sm font-bold text-fg">
              Monthly {moved.monthlyFrom ? `#${moved.monthlyFrom}` : "—"} → {moved.monthlyTo ? `#${moved.monthlyTo}` : "—"}
            </p>
            <p className="mt-1 text-sm font-bold text-fg">
              Weekly {moved.weeklyFrom ? `#${moved.weeklyFrom}` : "—"} → {moved.weeklyTo ? `#${moved.weeklyTo}` : "—"}
            </p>
            <p className="mt-2 text-sm text-white/45">+{formatScore(moved.spent)} Score on both boards.</p>
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
              {rate > 0 ? ` · $${formatUsd(spend / rate)}` : ""}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={onBuyCredits} className="btn-gold tap min-h-12 rounded-xl text-xs font-extrabold">
                BUY CREDITS
              </button>
              <button
                type="button"
                onClick={() => applyCredits(Math.max(1, credits))}
                className="btn-outline tap min-h-12 rounded-xl text-xs font-bold"
              >
                CHOOSE LOWER AMOUNT
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-black text-fg">Spend credits. Earn score.</h2>
            <p className="mt-1 text-xs text-white/40">
              $1 = {formatScore(rate)} Credits = {formatScore(rate)} Score
            </p>
            <p className="mt-3 rounded-xl border border-gold/20 bg-gold/10 px-4 py-3 text-center">
              <span className="block text-[10px] tracking-wider text-white/45 uppercase">Your balance</span>
              <span className="font-display text-3xl font-black text-gold-grad tabular-nums">{formatScore(credits)}</span>
              <span className="mt-1 block text-xs text-white/40">
                Credits · ${formatUsd(credits / rate)} purchase value
              </span>
            </p>
            <p className="mt-4 text-[10px] font-semibold tracking-wider text-white/40 uppercase">Credits to spend</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    applyCredits(p);
                    setCustom(false);
                  }}
                  className={`chip tap flex flex-col items-center rounded-[12px] py-2 ${!custom && spend === p ? "is-on" : ""}`}
                >
                  <span className="text-xs font-bold">+{formatScore(p)}</span>
                  <span className="text-[10px] opacity-70">${formatUsd(p / rate)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustom(true);
                  setUsdText(rate > 0 ? (spend / rate).toFixed(2).replace(/\.00$/, "") : "0");
                }}
                className={`chip tap rounded-[12px] text-xs font-bold ${custom ? "is-on" : ""}`}
              >
                Custom
              </button>
            </div>
            {custom ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">USD</span>
                  <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-[#12121a] px-3">
                    <span className="mr-1 text-sm text-white/35">$</span>
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
                  <span className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">Credits</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={String(spend)}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, String(cap).length);
                      applyCredits(Number(digits) || 1);
                    }}
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#12121a] px-3 text-sm text-fg outline-none"
                    aria-label="Custom credits to spend"
                  />
                </label>
              </div>
            ) : null}
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center">
              <p className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Live conversion</p>
              <p className="mt-1.5 text-sm font-bold text-fg">
                ${formatUsd(usdValue)} → {formatScore(add)} Credits → +{formatScore(add)} Score
              </p>
              <p className="mt-1 text-[11px] text-white/40">Same Score added to weekly and monthly.</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <p className="text-[9px] tracking-wider text-white/40 uppercase">Monthly</p>
                <p className="mt-1 text-sm font-extrabold text-fg tabular-nums">
                  {formatScore(monthlyScore)} → {formatScore(monthlyAfter)}
                </p>
                <p className="mt-1 text-[11px] text-white/45">
                  {monthlyRank ? `#${monthlyRank}` : "—"} → #{estMonthly}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-3">
                <p className="text-[9px] tracking-wider text-white/40 uppercase">Weekly</p>
                <p className="mt-1 text-sm font-extrabold text-fg tabular-nums">
                  {formatScore(weeklyScore)} → {formatScore(weeklyAfter)}
                </p>
                <p className="mt-1 text-[11px] text-white/45">
                  {weeklyRank ? `#${weeklyRank}` : "—"} → #{estWeekly}
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
              SPEND {formatScore(spend)} CREDITS · ${formatUsd(usdValue)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
