import { CountDown } from "./CountDown";
import { formatUsd, nextMonthEnd, nextSundayEnd } from "@/lib/utils";
import type { PrizeRow } from "@/lib/server/rank";

function Cup({
  tone,
  className = "",
}: {
  tone: "gold" | "silver" | "bronze" | "weekly";
  className?: string;
}) {
  return (
    <img
      src={`/rank/cup-${tone}.webp?v=3d5`}
      alt=""
      draggable={false}
      className={`trophy-3d object-contain object-bottom ${className}`}
    />
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
      <div className="glass-card card-3d rounded-[22px] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[14px]">
              Monthly prize pool
            </h3>
            <p className="mt-1 text-[12px] text-white/45">Top 3 Win Big Prizes</p>
          </div>
          <CountDown target={nextMonthEnd()} />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { place: "1st Place", amt: gold, tone: "gold" as const },
            { place: "2nd Place", amt: silver, tone: "silver" as const },
            { place: "3rd Place", amt: bronze, tone: "bronze" as const },
          ].map((p) => (
            <div
              key={p.place}
              className={`prize-cell rounded-[16px] px-1.5 py-3.5 text-center sm:px-2 sm:py-4 ${
                p.tone === "gold" ? "prize-gold" : p.tone === "silver" ? "prize-silver" : "prize-bronze"
              }`}
            >
              <Cup tone={p.tone} className="mx-auto h-[84px] w-[84px] sm:h-[104px] sm:w-[104px]" />
              <p className="mt-1.5 text-[9px] tracking-wider text-white/45 uppercase sm:text-[10px]">{p.place}</p>
              <p className="mt-0.5 text-[17px] font-extrabold text-fg tabular-nums sm:text-[22px]">
                ${formatUsd(p.amt).replace(".00", "")}
              </p>
              <p className="mt-0.5 text-[9px] text-white/38 sm:text-[10px]">+ Exclusive Badge</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/32 sm:mt-4">
          Rankings reset every month. New season, new champions.
        </p>
      </div>

      <div id="weekly" className="glass-card card-3d rounded-[22px] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[14px]">
              Weekly challenge
            </h3>
            <p className="mt-1 text-[12px] text-white/45">Only #1 Wins</p>
          </div>
          <CountDown target={nextSundayEnd()} />
        </div>
        <div className="weekly-card flex items-center gap-3 rounded-[16px] py-3.5 pr-5 pl-2 sm:gap-4 sm:py-5 sm:pr-7 sm:pl-3">
          <Cup tone="weekly" className="weekly-cup h-[118px] w-[80px] shrink-0 sm:h-[138px] sm:w-[92px]" />
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center text-right">
            <p className="text-[10px] tracking-[0.16em] text-white/48 uppercase">1st Place Only</p>
            <p className="font-display text-[32px] leading-none font-semibold tracking-tight text-fg sm:text-[42px]">
              ${weekAmt}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-white/42 sm:text-[12px]">
              Quick grind.
              <span className="hidden sm:inline"> </span>
              <br className="sm:hidden" />
              Weekly glory.
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/32 sm:mt-4">
          Rankings reset every week. One week, one champion.
        </p>
      </div>
    </section>
  );
}
