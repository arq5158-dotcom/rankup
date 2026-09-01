import { ArrowDown, ArrowUp, ChevronRight, ExternalLink } from "lucide-react";
import { AvatarImg, Verified } from "./Avatar";
import { NoteTrigger } from "./NoteIsland";
import { formatUsd, hostFromUrl, isUrlSafe } from "@/lib/utils";
import type { BoardEntry } from "@/lib/server/rank";

function Move({ n }: { n: number }) {
  if (n > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-success">
        <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.6} /> {n}
      </span>
    );
  }
  if (n < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-danger">
        <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.6} /> {Math.abs(n)}
      </span>
    );
  }
  return <span className="text-[10px] text-white/15">—</span>;
}

function RankMark({ rank, move }: { rank: number; move: number }) {
  return (
    <span className="inline-flex items-center justify-center gap-1 text-[13px] font-bold tabular-nums text-white/75">
      {rank}
      {move > 0 ? (
        <span className="inline-flex items-center text-success">
          <ArrowUp className="h-3 w-3" strokeWidth={2.6} />
          <span className="text-[10px] font-extrabold">{move}</span>
        </span>
      ) : null}
      {move < 0 ? (
        <span className="inline-flex items-center text-danger">
          <ArrowDown className="h-3 w-3" strokeWidth={2.6} />
          <span className="text-[10px] font-extrabold">{Math.abs(move)}</span>
        </span>
      ) : null}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  showAll,
  onToggle,
}: {
  entries: BoardEntry[];
  showAll: boolean;
  onToggle: () => void;
}) {
  const rows = showAll ? entries : entries.filter((e) => e.rank >= 4).slice(0, 10);
  return (
    <div id="leaderboard" className="glass-card overflow-hidden rounded-[22px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <h3 className="text-[12px] font-extrabold tracking-[0.18em] text-fg uppercase sm:text-[13px]">
            Live leaderboard
          </h3>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Top {Math.min(70, entries.length)} Players
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="btn-outline tap hidden h-8 shrink-0 items-center gap-1 rounded-full px-3.5 text-[11px] font-semibold text-white/70 sm:inline-flex"
        >
          {showAll ? "Show Top 10" : "View Full Leaderboard"}
          <ChevronRight className={`h-3 w-3 chevron-rot ${showAll ? "is-turn" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="tap shrink-0 text-[12px] font-semibold text-gold sm:hidden"
        >
          {showAll ? "Top 10" : "See all"}
        </button>
      </div>

      <div className="sm:hidden">
        {rows.map((e) => (
          <div key={e.id} className="lb-row flex items-center gap-3 px-4 py-2.5">
            <span className="w-7 shrink-0 text-center">
              <RankMark rank={e.rank} move={e.movement} />
            </span>
            <AvatarImg src={e.profileImage} name={e.displayName} size={32} />
            <div className="min-w-0 flex-1">
              <p className="flex min-w-0 items-center text-[13px] font-semibold text-fg">
                <span className="truncate">{e.displayName}</span>
                <Verified />
              </p>
              {e.shortNote ? (
                <NoteTrigger
                  note={e.shortNote}
                  name={e.displayName}
                  username={e.username}
                  image={e.profileImage}
                  amount={e.amountPaid}
                  rank={e.rank}
                  lines={1}
                  className="mt-0.5 min-w-0 text-[11px] text-white/35"
                />
              ) : null}
            </div>
            <span className="shrink-0 text-[13px] font-bold text-success tabular-nums">
              ${formatUsd(e.amountPaid)}
            </span>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.14em] text-white/28 uppercase">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2 text-right">Contribution</div>
          <div className="col-span-1 text-center">Movement</div>
          <div className="col-span-3">Message</div>
          <div className="col-span-2 text-right">Website</div>
        </div>
        <div className="max-h-[440px] overflow-y-auto">
          {rows.map((e) => (
            <div key={e.id} className="lb-row grid grid-cols-12 items-center gap-2 px-5 py-3">
              <div className="col-span-1 text-center">
                <RankMark rank={e.rank} move={e.movement} />
              </div>
              <div className="col-span-3 flex min-w-0 items-center gap-2.5">
                <AvatarImg src={e.profileImage} name={e.displayName} size={34} />
                <div className="min-w-0">
                  <span className="flex min-w-0 items-center truncate text-[13px] font-semibold text-fg">
                    <span className="truncate">{e.displayName}</span>
                    <Verified />
                  </span>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[14px] font-bold text-success tabular-nums">${formatUsd(e.amountPaid)}</span>
              </div>
              <div className="col-span-1 flex justify-center">
                <Move n={e.movement} />
              </div>
              <div className="col-span-3 min-w-0 pr-2">
                <NoteTrigger
                  note={e.shortNote}
                  name={e.displayName}
                  username={e.username}
                  image={e.profileImage}
                  amount={e.amountPaid}
                  rank={e.rank}
                  className="w-full text-[11px] leading-snug text-white/45"
                />
              </div>
              <div className="col-span-2 text-right">
                {e.webLink && isUrlSafe(e.webLink) ? (
                  <a
                    href={e.webLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-gold"
                  >
                    {hostFromUrl(e.webLink)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[9px] text-white/10">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
