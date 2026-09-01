import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { addScore } from "@/lib/server/rank";
import { isImageSafe } from "@/lib/utils";
import type { CycleType } from "@/lib/players";
import { clientIp, clampText, rateLimit } from "@/lib/server/security";

export type SpinSegment = {
  slot: number;
  label: string;
  scoreReward: number;
  image: string | null;
  enabled: boolean;
};

function num(v: number | string | null | undefined) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function boot(sql: Sql) {
  await sql.query("alter table profiles add column if not exists credits double precision not null default 0");
  await sql.query(`
    create table if not exists spin_segments (
      slot int primary key check (slot between 1 and 6),
      label text not null,
      score_reward double precision not null,
      image text,
      enabled boolean not null default true
    )
  `);
  await sql.query(`
    insert into spin_segments (slot, label, score_reward, enabled) values
      (1, 'Boost', 100, true),
      (2, 'Climb', 250, true),
      (3, 'Charge', 500, true),
      (4, 'Mega', 1000, true),
      (5, 'Super', 2500, true),
      (6, 'Jackpot', 5000, true)
    on conflict (slot) do nothing
  `);
  await sql.query(`
    create table if not exists spins (
      id text primary key,
      user_id text not null,
      segment_slot int not null,
      score_reward double precision not null,
      config_json text not null,
      claimed boolean not null default false,
      claimed_at timestamptz,
      monthly_score double precision,
      monthly_rank int,
      weekly_score double precision,
      weekly_rank int,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query("create index if not exists spins_user_idx on spins (user_id, created_at desc)");
}

async function segments(sql: Sql): Promise<SpinSegment[]> {
  const rows = await sql<{
    slot: number;
    label: string;
    score_reward: number | string;
    image: string | null;
    enabled: boolean;
  }>`select slot, label, score_reward, image, enabled from spin_segments order by slot asc`;
  return rows.map((r) => ({
    slot: r.slot,
    label: r.label,
    scoreReward: Math.max(0, Math.round(num(r.score_reward))),
    image: r.image && isImageSafe(r.image) ? r.image : null,
    enabled: Boolean(r.enabled),
  }));
}

export const getSpinConfig = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await boot(sql);
  return { segments: await segments(sql) };
});

export const getMySpinState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await boot(sql);
    const segs = await segments(sql);
    const last = await sql<{ created_at: string }>`
      select created_at::text as created_at from spins
      where user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    const lastAt = last[0]?.created_at ? Date.parse(last[0].created_at) : 0;
    const waitMs = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - lastAt));
    const open = await sql<{ id: string; segment_slot: number; score_reward: number | string }>`
      select id, segment_slot, score_reward from spins
      where user_id = ${context.userId} and claimed = false
      order by created_at desc
      limit 1
    `;
    return {
      segments: segs,
      canSpin: waitMs <= 0 && !open[0],
      nextSpinAt: waitMs > 0 ? Date.now() + waitMs : null,
      pending: open[0]
        ? { id: open[0].id, slot: open[0].segment_slot, score: Math.round(num(open[0].score_reward)) }
        : null,
    };
  });

export const startFreeSpin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    rateLimit(`spin:${context.userId}`, 8, 60_000);
    rateLimit(`spinip:${clientIp()}`, 20, 60_000);
    const sql = await getSql();
    await boot(sql);
    const open = await sql<{ id: string }>`
      select id from spins where user_id = ${context.userId} and claimed = false limit 1
    `;
    if (open[0]) throw new Error("Claim your current spin first.");
    const last = await sql<{ created_at: string }>`
      select created_at::text as created_at from spins
      where user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    if (last[0] && Date.now() - Date.parse(last[0].created_at) < 24 * 60 * 60 * 1000) {
      throw new Error("Next free spin unlocks in 24 hours.");
    }
    const all = await segments(sql);
    const live = all.filter((s) => s.enabled && s.scoreReward > 0);
    if (live.length === 0) throw new Error("Free Spin is paused.");
    const pick = live[Math.floor(Math.random() * live.length)]!;
    const id = randomBytes(16).toString("hex");
    await sql`
      insert into spins (id, user_id, segment_slot, score_reward, config_json, claimed)
      values (${id}, ${context.userId}, ${pick.slot}, ${pick.scoreReward}, ${JSON.stringify(all)}, false)
    `;
    return { id, slot: pick.slot, score: pick.scoreReward, label: pick.label };
  });

export const claimSpin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { spinId?: string; cycleType?: CycleType } | null | undefined) => ({
    spinId: clampText(data?.spinId, 80),
    cycleType: data?.cycleType === "weekly" ? ("weekly" as const) : ("monthly" as const),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`spinclaim:${context.userId}`, 12, 60_000);
    if (!/^[a-f0-9]{32}$/.test(data.spinId)) throw new Error("Invalid spin.");
    const sql = await getSql();
    await boot(sql);
    const rows = await sql<{
      id: string;
      user_id: string;
      score_reward: number | string;
      claimed: boolean;
    }>`
      select id, user_id, score_reward, claimed from spins where id = ${data.spinId} limit 1
    `;
    const spin = rows[0];
    if (!spin || spin.user_id !== context.userId) throw new Error("Spin not found.");
    if (spin.claimed) throw new Error("Already claimed.");
    const score = Math.round(num(spin.score_reward));
    const p = (
      await sql<{
        display_name: string | null;
        username: string | null;
        short_note: string | null;
        web_link: string | null;
        profile_image: string | null;
      }>`
        select display_name, username, short_note, web_link, profile_image
        from profiles where user_id = ${context.userId}
      `
    )[0];
    if (!p?.username) throw new Error("Choose a username first.");
    const base = {
      userId: context.userId,
      scoreDelta: score,
      displayName: p.display_name || "Competitor",
      shortNote: p.short_note,
      webLink: p.web_link,
      profileImage: p.profile_image,
      username: p.username,
    };
    const cycleType = data.cycleType;
    const moved = await addScore(sql, { ...base, cycleType });
    const marked = await sql<{ id: string }>`
      update spins set
        claimed = true,
        claimed_at = now(),
        monthly_score = ${cycleType === "monthly" ? moved.score : null},
        monthly_rank = ${cycleType === "monthly" ? moved.rank : null},
        weekly_score = ${cycleType === "weekly" ? moved.score : null},
        weekly_rank = ${cycleType === "weekly" ? moved.rank : null}
      where id = ${spin.id} and claimed = false
      returning id
    `;
    if (!marked[0]) throw new Error("Already claimed.");
    await sql`
      insert into credit_ledger (user_id, kind, credits_delta, score_delta, spin_id, resulting_credits, note)
      values (${context.userId}, ${"spin"}, ${0}, ${score}, ${spin.id}, ${null}, ${`Free spin +${score} ${cycleType} score`})
    `;
    return {
      score,
      cycleType,
      boardScore: moved.score,
      rank: moved.rank,
      prevRank: moved.prevRank,
    };
  });

export const adminGetSpin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await boot(sql);
    const me = await sql<{ is_admin: boolean; is_owner: boolean }>`
      select is_admin, is_owner from profiles where user_id = ${context.userId}
    `;
    if (!me[0]?.is_admin && !me[0]?.is_owner) throw new Error("Admin only.");
    return { segments: await segments(sql) };
  });

export const adminSaveSpin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    segments?: { slot: number; label: string; scoreReward: number; image?: string | null; enabled: boolean }[];
  } | null | undefined) => ({
    segments: Array.isArray(data?.segments) ? data!.segments.slice(0, 6) : [],
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await boot(sql);
    const me = await sql<{ is_admin: boolean; is_owner: boolean }>`
      select is_admin, is_owner from profiles where user_id = ${context.userId}
    `;
    if (!me[0]?.is_admin && !me[0]?.is_owner) throw new Error("Admin only.");
    if (data.segments.length !== 6) throw new Error("Need all 6 portions.");
    for (const s of data.segments) {
      const slot = Math.trunc(s.slot);
      if (slot < 1 || slot > 6) throw new Error("Invalid portion.");
      const label = clampText(s.label, 24) || `Slot ${slot}`;
      const reward = Math.max(0, Math.min(1_000_000, Math.round(Number(s.scoreReward) || 0)));
      let image: string | null = null;
      if (s.image) {
        if (!isImageSafe(s.image)) {
          throw new Error(`Portion ${slot} image is too large or not a JPEG/PNG/WebP. Use a smaller file.`);
        }
        image = s.image;
      }
      await sql`
        insert into spin_segments (slot, label, score_reward, image, enabled)
        values (${slot}, ${label}, ${reward}, ${image}, ${Boolean(s.enabled)})
        on conflict (slot) do update set
          label = excluded.label,
          score_reward = excluded.score_reward,
          image = excluded.image,
          enabled = excluded.enabled
      `;
    }
    return { ok: true, segments: await segments(sql) };
  });
