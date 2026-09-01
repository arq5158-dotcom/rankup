import { Trophy } from "lucide-react";
import { CountDown } from "./CountDown";
import { formatUsd } from "@/lib/utils";
import { nextMonthEnd, nextSundayEnd } from "@/lib/utils";
import type { PrizeRow } from "@/lib/server/rank";

function TrophyMark({ tone }: { tone: "gold" | "silver" | "bronze" | "weekly" }) {
  const cup =
    tone === "gold"
      ? { fill: "url(#cup-gold)", stroke: "#E8D08A" }
      : tone === "silver"
        ? { fill: "url(#cup-silver)", stroke: "#D0D0D8" }
        : tone === "bronze"
          ? { fill: "url(#cup-bronze)", stroke: "#E09B5C" }
          : { fill: "url(#cup-weekly)", stroke: "#C4B5FD" };
  const gid =
    tone === "gold" ? "cup-gold" : tone === "silver" ? "cup-silver" : tone === "bronze" ? "cup-bronze" : "cup-weekly";
  const stops =
    tone === "gold"
      ? ["#fff1c2", "#e8d08a", "#c9a84c", "#8b6914"]
      : tone === "silver"
        ? ["#f4f4f8", "#d0d0d8", "#a0a0a8", "#6a6a72"]
        : tone === "bronze"
          ? ["#f6d2a4", "#e09b5c", "#cd7f32", "#8a4e16"]
          : ["#ede9fe", "#c4b5fd", "#a78bfa", "#6d28d9"];
  return (
    <svg viewBox="0 0 48 48" className="mx-auto h-9 w-9 sm:h-10 sm:w-10" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="38%" stopColor={stops[1]} />
          <stop offset="72%" stopColor={stops[2]} />
          <stop offset="100%" stopColor={stops[3]} />
        </linearGradient>
      </defs>
      <path d="M15 9h18v9.5c0 6.2-4.2 10.5-9 10.5s-9-4.3-9-10.5V9Z" fill={cup.fill} />
      <path d="M15 11H8.5c.4 6.4 3.4 10.2 8.2 11.4" stroke={cup.stroke} strokeWidth="2.2" fill="none" />
      <path d="M33 11h6.5c-.4 6.4-3.4 10.2-8.2 11.4" stroke={cup.stroke} strokeWidth="2.2" fill="none" />
      <rect x="21.4" y="28.5" width="5.2" height="6" rx="1" fill={cup.fill} />
      <rect x="15.5" y="34.2" width="17" height="4.2" rx="1.6" fill={cup.fill} />
      <path d="M20 15.5h8" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PrizePools({ prizes }: { prizes: PrizeRow[] }) {
  const monthly = prizes.filter((p) => p.cycleType === "monthly");
  const weekly = prizes.find((p) => p.cycleType === "weekly" && p.tier === "gold");
  const gold = monthly.find((p) => p.tier === "gold")?.amount ?? 1000;
  const silver = monthly.find((p) => p.tier === "silver")?.amount ?? 500;
  const bronze = monthly.find((p) => p.tier === "bronze")?.amount ?? 250;
  const weekAmt = weekly?.amount ?? 100;

  return (
    <section id="prizes" className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      <div className="glass-card rounded-[22px] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[13px]">
              Monthly prize pool
            </h3>
            <p className="mt-0.5 text-[11px] text-white/40">Top 3 Win Big Prizes</p>
          </div>
          <CountDown target={nextMonthEnd()} />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {[
            { place: "1st Place", amt: gold, tone: "gold" as const, glow: true },
            { place: "2nd Place", amt: silver, tone: "silver" as const, glow: false },
            { place: "3rd Place", amt: bronze, tone: "bronze" as const, glow: false },
          ].map((p) => (
            <div
              key={p.place}
              className={`prize-cell rounded-[14px] px-2 py-3.5 text-center sm:p-3.5 ${
                p.glow ? "prize-gold" : "border border-white/[0.06] bg-[#101018]"
              }`}
            >
              <TrophyMark tone={p.tone} />
              <p className="mt-1.5 text-[10px] tracking-wider text-white/40 uppercase">{p.place}</p>
              <p className="mt-0.5 text-[17px] font-extrabold text-fg tabular-nums sm:text-[20px]">
                ${formatUsd(p.amt).replace(".00", "")}
              </p>
              <p className="text-[10px] text-white/32">+ Exclusive Badge</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/30">
          Rankings reset every month. New season, new champions.
        </p>
      </div>

      <div id="weekly" className="glass-card rounded-[22px] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[13px]">
              Weekly challenge
            </h3>
            <p className="mt-0.5 text-[11px] text-white/40">Only #1 Wins</p>
          </div>
          <CountDown target={nextSundayEnd()} />
        </div>
        <div className="weekly-card flex items-center gap-3.5 rounded-[14px] px-3.5 py-4 sm:gap-5 sm:px-5 sm:py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-weekly/20 ring-1 ring-weekly/40 sm:h-14 sm:w-14">
            <Trophy className="h-6 w-6 text-weekly sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.16em] text-white/45 uppercase">1st Place Only</p>
            <p className="font-display text-[34px] leading-none font-semibold tracking-tight text-fg sm:text-[40px]">
              ${weekAmt}
            </p>
            <p className="mt-1 text-[11px] text-white/40">Quick grind. Weekly glory.</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/30">
          Rankings reset every week. One week, one champion.
        </p>
      </div>
    </section>
  );
}
