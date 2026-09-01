import { Check, Crown, Info } from "lucide-react";
import { CountDown } from "./CountDown";
import { AvatarImg, Verified } from "./Avatar";
import { SafeWebLink } from "./SafeWebLink";
import { nextMonthEnd, nextSundayEnd, formatScore } from "@/lib/utils";
import type { BoardEntry, PrizeRow } from "@/lib/server/rank";

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
      decoding="async"
      className={`trophy-3d object-contain object-bottom ${className}`}
    />
  );
}

const MONTHLY = [
  {
    place: "Gold · #1",
    title: "Homepage Spotlight",
    perks: ["Champion Badge", "30-Day Feature", "Hall of Fame"],
    tone: "gold" as const,
  },
  {
    place: "Silver · #2",
    title: "Featured Profile",
    perks: ["Silver Badge", "Leaderboard Highlight", "Website Spotlight"],
    tone: "silver" as const,
  },
  {
    place: "Bronze · #3",
    title: "Enhanced Exposure",
    perks: ["Bronze Badge", "Highlighted Row", "Profile Boost"],
    tone: "bronze" as const,
  },
];

const WEEKLY_PERKS = ["Homepage Spotlight", "Champion Badge", "Featured Website", "Winner History"];

export function PrizePools({
  prizes: _prizes,
  weeklyChampion,
}: {
  prizes: PrizeRow[];
  weeklyChampion?: BoardEntry | null;
}) {
  void _prizes;
  const champ = weeklyChampion && weeklyChampion.rank === 1 ? weeklyChampion : null;

  return (
    <section id="prizes" className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      <div className="glass-card card-3d rounded-[22px] p-4 sm:p-6">
        <div className="mb-4 min-w-0">
          <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[14px]">
            Monthly Top 3 Benefits
          </h3>
          <p className="mt-1 text-[12px] text-white/45">Finish in the Top 3 to unlock premium visibility perks.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {MONTHLY.map((p) => (
            <div
              key={p.place}
              className={`prize-cell rounded-[16px] px-2 py-3.5 sm:px-3 sm:py-4 ${
                p.tone === "gold" ? "prize-gold" : p.tone === "silver" ? "prize-silver" : "prize-bronze"
              }`}
            >
              <Cup tone={p.tone} className="mx-auto h-[72px] w-[72px] sm:h-[92px] sm:w-[92px]" />
              <p className="mt-1.5 text-center text-[9px] tracking-wider text-white/45 uppercase sm:text-[10px]">{p.place}</p>
              <p className="mt-0.5 text-center text-[12px] font-extrabold text-fg sm:text-[14px]">{p.title}</p>
              <ul className="mt-2 space-y-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-[10px] leading-snug text-white/55 sm:text-[11px]">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" strokeWidth={3} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-white/32 sm:mt-4">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Ranks reset monthly. Benefits remain in profile history.
        </p>
      </div>

      <div id="weekly" className="glass-card card-3d rounded-[22px] p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2 sm:mb-5">
          <div className="min-w-0">
            <h3 className="text-[12px] font-extrabold tracking-[0.2em] text-fg uppercase sm:text-[14px]">
              Weekly Spotlight
            </h3>
            <p className="mt-1 text-[12px] text-white/45">The #1 player this week takes the crown.</p>
          </div>
          <CountDown target={nextSundayEnd()} prefix="Featured for" compact />
        </div>
        <div className="weekly-card overflow-hidden rounded-[16px] p-3 sm:p-4">
          {champ ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarImg src={champ.profileImage} name={champ.displayName} size={80} ring="gold" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] text-weekly uppercase">
                    <Crown className="h-3 w-3 fill-weekly" /> Weekly Champion
                  </p>
                  <p className="mt-0.5 flex min-w-0 items-center text-[20px] font-extrabold text-fg sm:text-[24px]">
                    <span className="truncate">{champ.displayName}</span>
                    <Verified />
                  </p>
                  <p className="font-display text-[18px] font-black tabular-nums text-gold-grad sm:text-[22px]">
                    {formatScore(champ.amountPaid)} SCORE
                  </p>
                  <SafeWebLink href={champ.webLink} className="mt-0.5" />
                  {champ.shortNote ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/45">{champ.shortNote}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cup tone="weekly" className="weekly-cup hidden h-[110px] w-[76px] shrink-0 sm:block" />
                <div className="min-w-[148px]">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-weekly uppercase">Weekly Champion Benefits</p>
                  <ul className="mt-2 space-y-1.5">
                    {WEEKLY_PERKS.map((perk) => (
                      <li key={perk} className="flex items-center gap-1.5 text-[11px] text-white/70">
                        <Check className="h-3.5 w-3.5 shrink-0 text-weekly" strokeWidth={3} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2 pr-2 pl-1 sm:gap-4">
              <Cup tone="weekly" className="weekly-cup h-[100px] w-[72px] shrink-0 sm:h-[120px] sm:w-[84px]" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] tracking-[0.16em] text-white/48 uppercase">Weekly Rank Champion</p>
                <p className="font-display text-[24px] leading-none font-semibold tracking-tight text-fg sm:text-[30px]">
                  Open slot
                </p>
                <p className="mt-1.5 text-[12px] text-white/45">Be #1 this week to take the spotlight.</p>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
                  {WEEKLY_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-1.5 text-[11px] text-white/55">
                      <Check className="h-3 w-3 shrink-0 text-weekly" strokeWidth={3} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] text-white/32 sm:mt-4">
          Rankings reset every week. Another shot at the spotlight.
        </p>
      </div>
    </section>
  );
}
