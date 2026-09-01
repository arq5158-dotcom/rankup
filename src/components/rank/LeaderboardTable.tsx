import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Search } from "lucide-react";
import { AvatarImg, Verified } from "./Avatar";
import { NoteTrigger } from "./NoteIsland";
import { SafeWebLink } from "./SafeWebLink";
import { Segmented } from "./motion";
import { formatScore } from "@/lib/utils";
import type { CycleType } from "@/lib/players";
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
    <span className="inline-flex items-center justify-center gap-1 text-[13px] font-bold tabular-nums text-white/80">
      {rank}
      {move > 0 ? (
        <span className="inline-flex items-center text-success sm:hidden">
          <ArrowUp className="h-3 w-3" strokeWidth={2.6} />
          <span className="text-[10px] font-extrabold">{move}</span>
        </span>
      ) : null}
      {move < 0 ? (
        <span className="inline-flex items-center text-danger sm:hidden">
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
  cycle = "monthly",
  onCycleChange,
}: {
  entries: BoardEntry[];
  showAll: boolean;
  onToggle: () => void;
  cycle?: CycleType;
  onCycleChange?: (v: CycleType) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase().replace(/^@/, "");
  const filtered = useMemo(() => {
    if (!needle) return entries;
    return entries.filter((e) => {
      const name = e.displayName.toLowerCase();
      const user = (e.username || "").toLowerCase();
      return name.includes(needle) || user.includes(needle);
    });
  }, [entries, needle]);
  const rows = needle ? filtered : showAll ? filtered : filtered.filter((e) => e.rank >= 4).slice(0, 10);
  const title = cycle === "weekly" ? "Weekly leaderboard" : "Monthly leaderboard";

  return (
    <div id="leaderboard" className="glass-card overflow-hidden rounded-[20px]">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h3 className="text-[13px] font-extrabold tracking-[0.18em] text-fg uppercase sm:text-[14px]">
              {title}
            </h3>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              {needle ? `${filtered.length} found` : `Top ${Math.min(70, entries.length)} Players`}
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
          <button type="button" onClick={onToggle} className="tap shrink-0 text-[12px] font-semibold text-gold sm:hidden">
            {showAll ? "Top 10" : "See all"}
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {onCycleChange ? (
            <Segmented
              value={cycle}
              onChange={onCycleChange}
              className="w-full sm:w-[220px]"
              options={[
                { id: "monthly", label: "Monthly" },
                { id: "weekly", label: "Weekly" },
              ]}
            />
          ) : null}
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 48))}
              placeholder="Search name or @username"
              className="h-10 w-full rounded-full border border-white/[0.08] bg-[#12121a] pr-3 pl-9 text-sm text-fg outline-none placeholder:text-white/30"
              aria-label="Search leaderboard"
            />
          </label>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-white/40">
          {needle ? `No players match “${query.trim()}”.` : "No players on this board yet."}
        </p>
      ) : null}
      <div className="sm:hidden">
        {rows.map((e) => (
          <div key={e.id} className="lb-row flex items-start gap-3 px-4 py-3">
            <span className="mt-1 w-7 shrink-0 text-center">
              <RankMark rank={e.rank} move={e.movement} />
            </span>
            <AvatarImg src={e.profileImage} name={e.displayName} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex min-w-0 items-center text-[13px] font-semibold text-fg">
                    <span className="truncate">{e.displayName}</span>
                    <Verified />
                  </p>
                  {e.username ? <p className="truncate text-[11px] text-white/35">@{e.username}</p> : null}
                </div>
                <span className="shrink-0 pt-0.5 text-[13px] font-bold text-success tabular-nums">
                  {formatScore(e.amountPaid)} SCORE
                </span>
              </div>
              {e.shortNote ? (
                <NoteTrigger
                  note={e.shortNote}
                  name={e.displayName}
                  username={e.username}
                  image={e.profileImage}
                  amount={e.amountPaid}
                  rank={e.rank}
                  webLink={e.webLink}
                  lines={1}
                  className="mt-0.5 min-w-0 text-[11px] text-white/35"
                />
              ) : null}
              <SafeWebLink href={e.webLink} className="mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[11px] font-bold tracking-[0.14em] text-white/42 uppercase">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-1 text-center">Movement</div>
          <div className="col-span-3">Message</div>
          <div className="col-span-2 text-right">Website</div>
        </div>
        <div className="max-h-[520px] overflow-y-auto">
          {rows.map((e) => (
            <div key={e.id} className="lb-row grid grid-cols-12 items-center gap-2 px-6 py-3.5">
              <div className="col-span-1 text-center">
                <RankMark rank={e.rank} move={e.movement} />
              </div>
              <div className="col-span-3 flex min-w-0 items-center gap-3">
                <AvatarImg src={e.profileImage} name={e.displayName} size={32} />
                <div className="min-w-0">
                  <span className="flex min-w-0 items-center truncate text-[14px] font-semibold text-fg">
                    <span className="truncate">{e.displayName}</span>
                    <Verified />
                  </span>
                  {e.username ? <p className="truncate text-[11px] text-white/35">@{e.username}</p> : null}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[14px] font-bold text-success tabular-nums">{formatScore(e.amountPaid)}</span>
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
                  webLink={e.webLink}
                  className="w-full text-[12px] leading-snug text-white/50"
                />
              </div>
              <div className="col-span-2 text-right">
                {e.webLink ? (
                  <SafeWebLink href={e.webLink} compact className="justify-end text-[11px] text-white/55 hover:text-gold" />
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
