import { createServerFn } from "@tanstack/react-start";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { buildSeedPlayers, DEFAULT_PRIZES, type CycleType } from "@/lib/players";
import { isImageSafe, isUrlSafe, MAX_CONTRIBUTION, MAX_PRIZE, MIN_CONTRIBUTION, monthCycleStart, weekCycleStart, clipNote, NOTE_MAX_CHARS, CREDITS_PER_USD } from "@/lib/utils";
import { handleFromDisplayName, USERNAME_MAX, validateDisplayName, validateUsername } from "@/lib/username";
import { asCycle, clientIp, clampText, parsePositiveInt, parseStripeSessionId, rateLimit } from "@/lib/server/security";

export type BoardEntry = {
  id: number;
  userId: string | null;
  displayName: string;
  username: string | null;
  shortNote: string | null;
  webLink: string | null;
  profileImage: string | null;
  amountPaid: number;
  rank: number;
  cycleType: CycleType;
  movement: number;
};

export type PrizeRow = {
  id: number;
  position: number;
  tier: string;
  label: string;
  amount: number;
  cycleType: CycleType;
};

export type PaymentRow = {
  id: number;
  amount: number;
  cycleType: CycleType;
  status: string;
  createdAt: string;
};

export type ProfileRow = {
  userId: string;
  displayName: string | null;
  username: string | null;
  shortNote: string | null;
  webLink: string | null;
  profileImage: string | null;
  email: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  twoFactorEnabled: boolean;
  credits: number;
};

type LbRow = {
  id: number;
  user_id: string | null;
  display_name: string;
  username: string | null;
  short_note: string | null;
  web_link: string | null;
  profile_image: string | null;
  amount_paid: number | string;
  rank: number;
  cycle_type: CycleType;
  movement: number;
};

type ProfileDb = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  short_note: string | null;
  web_link: string | null;
  profile_image: string | null;
  email: string | null;
  is_admin: boolean;
  is_owner: boolean;
  two_factor_enabled: boolean;
  credits?: number | string | null;
};

function num(v: number | string | null | undefined) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function publicEntry(r: LbRow): BoardEntry {
  const parsed = validateDisplayName(r.display_name);
  const note = sanitizeNote(r.short_note);
  const link = r.web_link && isUrlSafe(r.web_link) && r.web_link.length <= 300 ? r.web_link : null;
  const image = r.profile_image && isImageSafe(r.profile_image) ? r.profile_image : null;
  const handle = r.username && validateUsername(r.username).ok ? r.username : null;
  return {
    id: r.id,
    userId: null,
    displayName: parsed.ok ? parsed.name : "Competitor",
    username: handle,
    shortNote: note,
    webLink: link,
    profileImage: image,
    amountPaid: Math.min(Math.max(0, num(r.amount_paid)), 1_000_000_000),
    rank: Math.max(1, Math.trunc(num(r.rank)) || 9999),
    cycleType: asCycle(r.cycle_type),
    movement: Math.trunc(num(r.movement)) || 0,
  };
}

function mapProfile(p: ProfileDb): ProfileRow {
  return {
    userId: p.user_id,
    displayName: p.display_name,
    username: p.username,
    shortNote: p.short_note,
    webLink: p.web_link,
    profileImage: p.profile_image,
    email: p.email,
    isAdmin: p.is_admin || p.is_owner,
    isOwner: p.is_owner,
    twoFactorEnabled: p.two_factor_enabled,
    credits: Math.max(0, num(p.credits)),
  };
}

function cycleStart(type: CycleType) {
  return type === "monthly" ? monthCycleStart() : weekCycleStart();
}

function normEmail(email: string | null | undefined) {
  const v = email?.trim().toLowerCase() || null;
  return v && v.includes("@") ? v : null;
}

function isQaEmail(email: string | null) {
  return Boolean(email?.endsWith("@rankup.test"));
}

function bearerOf(context: { userId: string }) {
  return (context as { userId: string; bearerToken?: string }).bearerToken;
}

async function sessionEmail(bearerToken?: string): Promise<string | null> {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  let token = bearerToken;
  if (!token) {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const auth = getRequest()?.headers.get("authorization");
      if (auth?.toLowerCase().startsWith("bearer ")) token = auth.slice(7);
    } catch {
      /* ignore */
    }
  }
  const user = await getSessionUser(token);
  return normEmail(user?.email);
}

async function getCfg(sql: Sql, key: string) {
  const rows = await sql<{ value: string }>`select value from config where key = ${key}`;
  return rows[0]?.value ?? null;
}

async function setCfg(sql: Sql, key: string, value: string) {
  await sql`
    insert into config (key, value) values (${key}, ${value})
    on conflict (key) do update set value = ${value}
  `;
}

async function pendingAdminEmails(sql: Sql): Promise<string[]> {
  try {
    const raw = await getCfg(sql, "pendingAdminEmails");
    if (!raw || raw.length > 4000) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, 50)
      .map((e) => String(e).toLowerCase().trim())
      .filter((e) => e.includes("@") && e.length <= 254);
  } catch {
    return [];
  }
}

async function ensureUsernameSchema(sql: Sql) {
  const done = await getCfg(sql, "usernameBackfill");
  if (done === "1") return;
  const missing = await sql<{ id: number; display_name: string }>`
    select id, display_name from leaderboard where username is null
  `;
  const used = new Set<string>();
  const existing = await sql<{ username: string }>`
    select username from leaderboard where username is not null
  `;
  for (const r of existing) used.add(r.username);
  for (const row of missing) {
    let base = handleFromDisplayName(row.display_name);
    let next = base;
    let i = 2;
    let guard = 0;
    while (used.has(next) && guard++ < 500) {
      const suffix = String(i++);
      next = `${base.slice(0, USERNAME_MAX - suffix.length)}${suffix}`;
    }
    if (used.has(next)) continue;
    used.add(next);
    await sql`update leaderboard set username = ${next} where id = ${row.id}`;
  }
  await setCfg(sql, "usernameBackfill", "1");
}

function sanitizeNote(raw?: string | null) {
  return clipNote(raw);
}

function requireSafeLink(raw?: string | null) {
  const t = raw?.trim();
  if (!t) return null;
  if (t.length > 300) throw new Error("That website is too long.");
  const withProto = /^https:\/\//i.test(t)
    ? t
    : /^http:\/\//i.test(t)
      ? `https://${t.slice(7)}`
      : `https://${t}`;
  if (!isUrlSafe(withProto)) {
    throw new Error("That website did not pass safety review. Use a full https:// link — shorteners and adult sites are blocked.");
  }
  return withProto;
}

function requireSafeImage(raw?: string | null) {
  const t = raw?.trim();
  if (!t) return null;
  if (!isImageSafe(t)) throw new Error("That image URL is not allowed.");
  return t;
}

function requirePrizeAmount(n: number) {
  if (!Number.isFinite(n) || n < 0 || n > MAX_PRIZE) throw new Error("Prize amount is invalid.");
  return Math.round(n * 100) / 100;
}

async function usernameTaken(sql: Sql, username: string, exceptUserId?: string) {
  const profiles = await sql<{ user_id: string }>`
    select user_id from profiles where username = ${username}
  `;
  if (profiles.some((p) => p.user_id !== exceptUserId)) return true;
  const board = await sql<{ user_id: string | null }>`
    select user_id from leaderboard where username = ${username}
  `;
  for (const r of board) {
    if (!r.user_id) return true;
    if (r.user_id !== exceptUserId) return true;
  }
  return false;
}

async function ensureHardening(sql: Sql) {
  const done = await getCfg(sql, "hardening0007");
  if (done === "1") return;
  try {
    await sql.query("alter table payments alter column status set default 'pending'");
    await sql.query(
      "create unique index if not exists leaderboard_user_cycle_uniq on leaderboard (user_id, cycle_type, cycle_start) where user_id is not null",
    );
    await sql.query("alter table payments add column if not exists cycle_start bigint");
    await sql.query("update payments set cycle_start = 0 where cycle_start is null");
    await sql.query(
      "create unique index if not exists profiles_email_lower_uniq on profiles (lower(email)) where email is not null",
    );
    await setCfg(sql, "hardening0007", "1");
    await setCfg(sql, "hardening0006", "1");
  } catch (err) {
    console.error("[rank] hardening skipped", err instanceof Error ? err.message : err);
  }
}

async function ensureRicherNotes(sql: Sql) {
  const done = await getCfg(sql, "noteLen160");
  if (done === "1") return;
  try {
    const players = buildSeedPlayers();
    for (const p of players) {
      if (!p.shortNote) continue;
      await sql`
        update leaderboard
        set short_note = ${p.shortNote}
        where is_seed = true
          and display_name = ${p.displayName}
          and (short_note is null or char_length(short_note) <= 40)
      `;
    }
    await setCfg(sql, "noteLen160", "1");
  } catch (err) {
    console.error("[rank] note expand skipped", err instanceof Error ? err.message : err);
  }
}

async function ensureUniqueBoard(sql: Sql) {
  const done = await getCfg(sql, "dedupeBoard0009");
  if (done === "1") return;
  try {
    await sql.query(`
      delete from leaderboard a
      using leaderboard b
      where a.id > b.id
        and a.cycle_type = b.cycle_type
        and a.cycle_start = b.cycle_start
        and (
          (a.user_id is not null and a.user_id = b.user_id)
          or (a.is_seed = true and b.is_seed = true and a.display_name = b.display_name)
        )
    `);
    await sql.query(
      "create unique index if not exists leaderboard_seed_cycle_uniq on leaderboard (display_name, cycle_type, cycle_start) where is_seed = true",
    );
    await setCfg(sql, "dedupeBoard0009", "1");
  } catch (err) {
    console.error("[rank] dedupe skipped", err instanceof Error ? err.message : err);
  }
}

async function ensureLinkFixes(sql: Sql) {
  const done = await getCfg(sql, "linkFix0010");
  if (done === "1") return;
  try {
    await sql`update leaderboard set web_link = ${"https://apexpredator.dev"} where web_link = ${"https://apexpedator.dev"}`;
    await setCfg(sql, "linkFix0010", "1");
  } catch (err) {
    console.error("[rank] link fix skipped", err instanceof Error ? err.message : err);
  }
}

async function ensureCreditsSchema(sql: Sql) {
  const done = await getCfg(sql, "creditsScore0009");
  if (done === "1") return;
  try {
    await sql.query("alter table profiles add column if not exists credits double precision not null default 0");
    await sql.query(`
      create table if not exists credit_ledger (
        id serial primary key,
        user_id text not null,
        kind text not null,
        credits_delta double precision not null default 0,
        score_delta double precision not null default 0,
        cycle_type text,
        stripe_session_id text,
        spin_id text,
        created_at timestamptz not null default now()
      )
    `);
    await sql.query(
      "create unique index if not exists credit_ledger_stripe_uidx on credit_ledger (stripe_session_id) where stripe_session_id is not null",
    );
    await sql.query(
      "create unique index if not exists credit_ledger_spin_uidx on credit_ledger (spin_id) where spin_id is not null",
    );
    await sql.query("create index if not exists credit_ledger_user_idx on credit_ledger (user_id, created_at desc)");
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
    await sql.query("alter table payments add column if not exists credits_purchased double precision");
    await sql.query("alter table payments add column if not exists exchange_rate double precision");
    await sql.query("alter table payments add column if not exists resulting_credits double precision");
    await sql.query("alter table payments add column if not exists stripe_customer_id text");
    await sql.query("alter table credit_ledger add column if not exists resulting_credits double precision");
    await sql.query("alter table credit_ledger add column if not exists usd_amount double precision");
    await sql.query("alter table credit_ledger add column if not exists note text");
    await setCfg(sql, "creditsScore0009", "1");
  } catch (err) {
    console.error("[rank] credits schema skipped", err instanceof Error ? err.message : err);
  }
}

async function ensureSeed(sql: Sql) {
  await ensureUsernameSchema(sql);
  await ensureHardening(sql);
  const { ensureTwoFactorSchema } = await import("./two-factor");
  await ensureTwoFactorSchema(sql);
  await ensureRicherNotes(sql);
  await ensureUniqueBoard(sql);
  await ensureLinkFixes(sql);
  await ensureCreditsSchema(sql);
  const prizes = await sql<{ c: number }>`select count(*)::int as c from prizes`;
  if ((prizes[0]?.c ?? 0) === 0) {
    for (const p of DEFAULT_PRIZES) {
      await sql`
        insert into prizes (position, tier, label, amount, cycle_type)
        values (${p.position}, ${p.tier}, ${p.label}, ${p.amount}, ${p.cycleType})
      `;
    }
  }

  const cfg = await sql<{ c: number }>`select count(*)::int as c from config`;
  if ((cfg[0]?.c ?? 0) === 0) {
    await sql`insert into config (key, value) values ('monthlyCycleStart', ${String(monthCycleStart())})`;
    await sql`insert into config (key, value) values ('weeklyCycleStart', ${String(weekCycleStart())})`;
  }

  const existing = await sql<{ c: number }>`select count(*)::int as c from leaderboard`;
  if ((existing[0]?.c ?? 0) > 0) return;

  const players = buildSeedPlayers();
  const mStart = monthCycleStart();
  const wStart = weekCycleStart();
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    await sql`
      insert into leaderboard (
        display_name, username, short_note, web_link, profile_image, amount_paid,
        rank, cycle_type, cycle_start, is_seed, movement
      ) values (
        ${p.displayName}, ${p.username || handleFromDisplayName(p.displayName)}, ${p.shortNote}, ${p.webLink}, ${p.profileImage}, ${p.amountPaid},
        ${i + 1}, 'monthly', ${mStart}, true, ${p.movement}
      )
    `;
  }
  const weekly = players.slice(0, 20).map((p, i) => ({
    ...p,
    amountPaid: Math.round(p.amountPaid * 0.35 * 100) / 100,
    movement: p.movement,
    rank: i + 1,
  }));
  for (const p of weekly) {
    await sql`
      insert into leaderboard (
        display_name, username, short_note, web_link, profile_image, amount_paid,
        rank, cycle_type, cycle_start, is_seed, movement
      ) values (
        ${p.displayName}, ${p.username || handleFromDisplayName(p.displayName)}, ${p.shortNote}, ${p.webLink}, ${p.profileImage}, ${p.amountPaid},
        ${p.rank}, 'weekly', ${wStart}, true, ${p.movement}
      )
    `;
  }
}

async function getCycleStart(sql: Sql, type: CycleType) {
  const key = type === "monthly" ? "monthlyCycleStart" : "weeklyCycleStart";
  const calendar = cycleStart(type);
  const rows = await sql<{ value: string }>`select value from config where key = ${key}`;
  const stored = Number(rows[0]?.value);
  if (!Number.isFinite(stored) || stored <= 0) {
    await sql`insert into config (key, value) values (${key}, ${String(calendar)}) on conflict (key) do nothing`;
    return calendar;
  }
  if (stored < calendar) {
    await archiveCycle(sql, type, stored, calendar);
    return calendar;
  }
  return stored;
}

async function archiveCycle(sql: Sql, type: CycleType, oldStart: number, newStart: number) {
  const already = await sql<{ id: number }>`
    select id from archive where cycle_type = ${type} and cycle_start = ${oldStart} limit 1
  `;
  const entries = await sql<LbRow>`
    select id, user_id, display_name, username, short_note, web_link, profile_image,
           amount_paid, rank, cycle_type, movement
    from leaderboard where cycle_type = ${type} and cycle_start = ${oldStart}
    order by rank
  `;
  if (!already[0]) {
    const revenue = entries.reduce((s, e) => s + num(e.amount_paid), 0);
    await sql`
      insert into archive (cycle_type, cycle_start, cycle_end, entries_json, total_participants, total_revenue)
      values (
        ${type}, ${oldStart}, ${newStart},
        ${JSON.stringify(entries.map(publicEntry))}, ${entries.length}, ${revenue}
      )
    `;
  }
  await sql`delete from leaderboard where cycle_type = ${type} and cycle_start = ${oldStart}`;
  const key = type === "monthly" ? "monthlyCycleStart" : "weeklyCycleStart";
  await setCfg(sql, key, String(newStart));
}

async function rerank(sql: Sql, type: CycleType, start: number) {
  await sql`
    with ranked as (
      select id, rank as prev,
        (row_number() over (order by amount_paid desc, id asc))::int as next
      from leaderboard
      where cycle_type = ${type} and cycle_start = ${start}
    )
    update leaderboard l
    set rank = ranked.next, movement = ranked.prev - ranked.next
    from ranked
    where l.id = ranked.id
  `;
}

function envOwnerEmail() {
  const v = (process.env.RANKUP_OWNER_EMAIL || process.env.OWNER_EMAIL || "").trim().toLowerCase();
  return v.includes("@") ? v : null;
}

async function lockedOwnerEmail(sql: Sql) {
  return envOwnerEmail() || normEmail(await getCfg(sql, "ownerEmail"));
}

async function ownerCount(sql: Sql) {
  const rows = await sql<{ c: number }>`select count(*)::int as c from profiles where is_owner = true`;
  return rows[0]?.c ?? 0;
}

async function loadProfile(sql: Sql, userId: string) {
  const rows = await sql<ProfileDb>`
    select user_id, display_name, username, short_note, web_link, profile_image, email, is_admin, is_owner, two_factor_enabled, credits
    from profiles where user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function stampOwner(sql: Sql, userId: string, email: string | null) {
  await sql`update profiles set is_owner = false where is_owner = true and user_id <> ${userId}`;
  await sql`update profiles set is_owner = true, is_admin = true where user_id = ${userId}`;
  await setCfg(sql, "ownerUserId", userId);
  if (email) await setCfg(sql, "ownerEmail", email);
}

/**
 * Roles:
 * - owner: first real account (or RANKUP_OWNER_EMAIL). Permanent. Cannot be demoted.
 * - admin: only if the owner grants their email. Cannot grant others or touch Stripe.
 * - user: everyone else. Never sees admin UI. Server functions reject them.
 */
async function ensureProfile(sql: Sql, userId: string, email: string | null): Promise<ProfileDb> {
  let profile = await loadProfile(sql, userId);
  const locked = await lockedOwnerEmail(sql);
  const pending = await pendingAdminEmails(sql);
  const emailIsOwner = Boolean(email && locked && email === locked);
  const emailIsPendingAdmin = Boolean(email && pending.includes(email));

  if (!profile) {
    const noOwnerYet = (await ownerCount(sql)) === 0;
    const claimOwner = emailIsOwner || (noOwnerYet && !locked);
    const isAdmin = claimOwner || emailIsPendingAdmin;
    try {
      await sql`
        insert into profiles (user_id, display_name, email, is_admin, is_owner, two_factor_enabled)
        values (${userId}, ${null}, ${email}, ${isAdmin}, ${false}, false)
      `;
    } catch {
      const existing = await loadProfile(sql, userId);
      if (existing) return transferOwnerFromQa(sql, existing, email);
      throw new Error("Could not create profile");
    }
    if (claimOwner) {
      try {
        await stampOwner(sql, userId, email);
      } catch {
        await sql`update profiles set is_admin = ${emailIsPendingAdmin}, is_owner = false where user_id = ${userId}`;
      }
    }
    if (emailIsPendingAdmin && email) {
      await setCfg(sql, "pendingAdminEmails", JSON.stringify(pending.filter((e) => e !== email)));
    }
    profile = await loadProfile(sql, userId);
    if (!profile) throw new Error("Could not create profile");
    return transferOwnerFromQa(sql, profile, email);
  }

  if (email && profile.email !== email) {
    try {
      await sql`update profiles set email = ${email} where user_id = ${userId}`;
      profile = { ...profile, email };
    } catch {
      /* unique email already held — do not adopt a stolen inbox */
    }
  }

  if (emailIsOwner && !profile.is_owner && normEmail(profile.email) === email) {
    const owners = await sql<{ user_id: string; email: string | null }>`
      select user_id, email from profiles where is_owner = true
    `;
    const others = owners.filter((o) => o.user_id !== userId);
    const envOwner = envOwnerEmail();
    const canTake =
      others.length === 0 ||
      (dbSource !== "neon" && others.every((o) => isQaEmail(o.email))) ||
      Boolean(envOwner && email === envOwner);
    if (canTake) {
      try {
        await stampOwner(sql, userId, email);
        profile = { ...profile, is_owner: true, is_admin: true };
      } catch {
        /* unique owner already held by someone else */
      }
    }
  }

  if (profile.is_owner) {
    profile = { ...profile, is_admin: true, is_owner: true };
    if (email && !locked) await setCfg(sql, "ownerEmail", email);
  }

  return transferOwnerFromQa(sql, profile, email);
}

/** Preview-only: a @rankup.test owner yields to the first real inbox. Production never moves owner. */
async function transferOwnerFromQa(sql: Sql, profile: ProfileDb, email: string | null): Promise<ProfileDb> {
  if (dbSource === "neon") return profile;
  if (!email || isQaEmail(email) || profile.is_owner) return profile;
  const owners = await sql<{ user_id: string; email: string | null }>`
    select user_id, email from profiles where is_owner = true
  `;
  if (owners.length === 0) return profile;
  if (!owners.every((o) => isQaEmail(o.email))) return profile;

  for (const o of owners) {
    await sql`update profiles set is_owner = false, is_admin = true where user_id = ${o.user_id}`;
  }
  await stampOwner(sql, profile.user_id, email);
  return { ...profile, is_owner: true, is_admin: true };
}

async function requireAdmin(sql: Sql, userId: string, bearerToken?: string) {
  const email = await sessionEmail(bearerToken);
  const profile = await ensureProfile(sql, userId, email);
  if (!profile.is_admin && !profile.is_owner) throw new Error("Admin access required");
  return profile;
}

async function requireOwner(sql: Sql, userId: string, bearerToken?: string) {
  const profile = await requireAdmin(sql, userId, bearerToken);
  if (!profile.is_owner) throw new Error("Only the owner can do that");
  const { assertTwoFactorUnlocked } = await import("./two-factor");
  await assertTwoFactorUnlocked(sql, userId, profile.two_factor_enabled, bearerToken);
  return profile;
}

async function showExamplePlayers(sql: Sql) {
  const v = (await getCfg(sql, "showExamplePlayers"))?.trim();
  return v !== "0";
}

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((data: { cycleType?: CycleType; offset?: number; limit?: number } | null | undefined) => ({
    cycleType: data?.cycleType === "weekly" ? ("weekly" as const) : ("monthly" as const),
    offset: Math.max(0, Math.min(10_000, Math.trunc(Number(data?.offset) || 0))),
    limit: Math.max(1, Math.min(300, Math.trunc(Number(data?.limit) || 300))),
  }))
  .handler(async ({ data }) => {
    try {
      const sql = await getSql();
      await ensureSeed(sql);
      const start = await getCycleStart(sql, data.cycleType);
      const examples = await showExamplePlayers(sql);
      const rows = await sql<LbRow>`
        select id, user_id, display_name, username, short_note, web_link, profile_image,
               amount_paid, rank, cycle_type, movement
        from leaderboard
        where cycle_type = ${data.cycleType} and cycle_start = ${start}
          and (${examples} or is_seed = false)
        order by amount_paid desc, id asc
        offset ${data.offset}
        limit ${data.limit}
      `;
      const seen = new Set<number>();
      return rows
        .map((r, i) => publicEntry({ ...r, rank: data.offset + i + 1 }))
        .filter((e) => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
    } catch (err) {
      console.error("[leaderboard]", err instanceof Error ? err.message : err);
      return [];
    }
  });

export const getPrizes = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql<{
      id: number;
      position: number;
      tier: string;
      label: string;
      amount: number | string;
      cycle_type: CycleType;
    }>`select id, position, tier, label, amount, cycle_type from prizes order by cycle_type, position`;
    return rows.map((r) => ({
      id: r.id,
      position: r.position,
      tier: r.tier,
      label: r.label,
      amount: Math.min(MAX_PRIZE, Math.max(0, num(r.amount))),
      cycleType: asCycle(r.cycle_type),
    })) satisfies PrizeRow[];
  } catch (err) {
    console.error("[prizes]", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    await ensureSeed(sql);
    const links = await sql<{ c: number }>`
      select count(*)::int as c from leaderboard where web_link is not null and web_link <> ''
    `;
    return { pendingLinks: Math.min(12, links[0]?.c ?? 0) };
  } catch {
    return { pendingLinks: 0 };
  }
});

export const getStripeStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    const { stripeIsConfigured } = await import("./stripe");
    const configured = await stripeIsConfigured(sql);
    return { configured };
  } catch {
    return { configured: false };
  }
});

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const userId = context.userId;
    const email = await sessionEmail(bearerOf(context));
    const profile = await ensureProfile(sql, userId, email);

    const mStart = await getCycleStart(sql, "monthly");
    const wStart = await getCycleStart(sql, "weekly");
    const monthly = await sql<{ rank: number; amount_paid: number | string }>`
      select rank, amount_paid from leaderboard
      where user_id = ${userId} and cycle_type = 'monthly' and cycle_start = ${mStart}
      limit 1
    `;
    const weekly = await sql<{ rank: number; amount_paid: number | string }>`
      select rank, amount_paid from leaderboard
      where user_id = ${userId} and cycle_type = 'weekly' and cycle_start = ${wStart}
      limit 1
    `;
    const payments = await sql<{
      id: number;
      amount: number | string;
      cycle_type: CycleType;
      status: string;
      created_at: string;
    }>`
      select id, amount, cycle_type, status, created_at::text as created_at
      from payments where user_id = ${userId}
      order by created_at desc
      limit 50
    `;

    const filled = [
      profile.display_name,
      profile.username,
      profile.short_note,
      profile.web_link,
      profile.profile_image,
    ].filter(Boolean).length;
    const completeness = Math.min(100, Math.max(0, Math.round((filled / 5) * 100)));
    const { listSignInMethods, twoFactorUnlocked, ensureTwoFactorSchema } = await import("./two-factor");
    await ensureTwoFactorSchema(sql);
    const signInMethods = await listSignInMethods(sql, userId);
    const unlocked = profile.two_factor_enabled
      ? await twoFactorUnlocked(sql, userId, bearerOf(context))
      : true;

    return {
      profile: mapProfile(profile),
      credits: Math.max(0, num(profile.credits)),
      monthlyRank: monthly[0]?.rank ?? null,
      weeklyRank: weekly[0]?.rank ?? null,
      monthlyPaid: monthly[0] ? num(monthly[0].amount_paid) : 0,
      weeklyPaid: weekly[0] ? num(weekly[0].amount_paid) : 0,
      completeness,
      signInMethods,
      twoFactorUnlocked: unlocked,
      payments: payments.map((p) => ({
        id: p.id,
        amount: num(p.amount),
        cycleType: p.cycle_type,
        status: p.status,
        createdAt: p.created_at,
      })) satisfies PaymentRow[],
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    displayName?: string;
    username?: string;
    shortNote?: string;
    webLink?: string;
    profileImage?: string;
    twoFactorEnabled?: boolean;
  } | null | undefined) => ({
    displayName: typeof data?.displayName === "string" ? data.displayName.slice(0, 80) : data?.displayName,
    username: typeof data?.username === "string" ? data.username.slice(0, 64) : data?.username,
    shortNote: typeof data?.shortNote === "string" ? data.shortNote.slice(0, NOTE_MAX_CHARS + 16) : data?.shortNote,
    webLink: typeof data?.webLink === "string" ? data.webLink.slice(0, 320) : data?.webLink,
    profileImage: typeof data?.profileImage === "string" ? data.profileImage.slice(0, 180_000) : data?.profileImage,
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`profile:${context.userId}`, 30, 60_000);
    const sql = await getSql();
    await ensureUsernameSchema(sql);
    const link = data.webLink !== undefined ? requireSafeLink(data.webLink) : undefined;
    const image = data.profileImage !== undefined ? requireSafeImage(data.profileImage) : undefined;
    const note = data.shortNote !== undefined ? sanitizeNote(data.shortNote) : undefined;
    if (data.displayName !== undefined) {
      const parsed = validateDisplayName(data.displayName);
      if (!parsed.ok) throw new Error(parsed.error);
      data.displayName = parsed.name;
    }
    let nextUsername: string | undefined;
    if (data.username !== undefined) {
      const parsed = validateUsername(data.username);
      if (!parsed.ok) throw new Error(parsed.error);
      if (await usernameTaken(sql, parsed.username, context.userId)) {
        throw new Error("That username is taken.");
      }
      nextUsername = parsed.username;
    }
    const email = await sessionEmail(bearerOf(context));
    await ensureProfile(sql, context.userId, email);
    await sql`
      update profiles set
        display_name = coalesce(${data.displayName ?? null}, display_name),
        username = coalesce(${nextUsername ?? null}, username),
        short_note = case when ${data.shortNote !== undefined ? 1 : 0} = 1 then ${note ?? null} else short_note end,
        web_link = case when ${data.webLink !== undefined ? 1 : 0} = 1 then ${link ?? null} else web_link end,
        profile_image = case when ${data.profileImage !== undefined ? 1 : 0} = 1 then ${image ?? null} else profile_image end
      where user_id = ${context.userId}
    `;
    if (nextUsername) {
      await sql`update leaderboard set username = ${nextUsername} where user_id = ${context.userId}`;
    }
    if (data.displayName) {
      await sql`update leaderboard set display_name = ${data.displayName} where user_id = ${context.userId}`;
    }
    if (image !== undefined) {
      await sql`update leaderboard set profile_image = ${image} where user_id = ${context.userId}`;
    }
    if (link !== undefined) {
      await sql`update leaderboard set web_link = ${link} where user_id = ${context.userId}`;
    }
    if (note !== undefined) {
      await sql`update leaderboard set short_note = ${note} where user_id = ${context.userId}`;
    }
    return { ok: true };
  });

export const checkUsername = createServerFn({ method: "GET" })
  .validator((data: { username?: string } | null | undefined) => ({
    username: clampText(data?.username, 64),
  }))
  .handler(async ({ data }) => {
    rateLimit(`usercheck:${clientIp()}`, 30, 60_000);
    const parsed = validateUsername(data.username);
    if (!parsed.ok) return { available: false as const, error: parsed.error, username: null };
    const sql = await getSql();
    await ensureUsernameSchema(sql);
    const taken = await usernameTaken(sql, parsed.username);
    return {
      available: !taken,
      error: taken ? "That username is taken." : null,
      username: parsed.username,
    };
  });

export const setUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { username?: string } | null | undefined) => ({
    username: clampText(data?.username, 64),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`setuser:${context.userId}`, 10, 60_000);
    const parsed = validateUsername(data.username);
    if (!parsed.ok) throw new Error(parsed.error);
    const sql = await getSql();
    await ensureUsernameSchema(sql);
    if (await usernameTaken(sql, parsed.username, context.userId)) {
      throw new Error("That username is taken.");
    }
    const email = await sessionEmail(bearerOf(context));
    await ensureProfile(sql, context.userId, email);
    try {
      await sql`update profiles set username = ${parsed.username} where user_id = ${context.userId}`;
    } catch {
      throw new Error("That username is taken.");
    }
    await sql`update leaderboard set username = ${parsed.username} where user_id = ${context.userId}`;
    return { ok: true, username: parsed.username };
  });

async function upsertLeaderboard(
  sql: Sql,
  opts: {
    userId: string;
    amount: number;
    displayName: string;
    shortNote: string | null;
    webLink: string | null;
    cycleType: CycleType;
    profileImage: string | null;
    username: string | null;
  },
) {
  const start = await getCycleStart(sql, opts.cycleType);
  const amount = Math.min(Math.max(0, opts.amount), 1_000_000_000);
  const existing = await sql<{ id: number; amount_paid: number | string }>`
    select id, amount_paid from leaderboard
    where user_id = ${opts.userId} and cycle_type = ${opts.cycleType} and cycle_start = ${start}
    limit 1
  `;

  if (existing[0]) {
    const next = Math.max(num(existing[0].amount_paid), amount);
    await sql`
      update leaderboard set
        amount_paid = ${next},
        display_name = ${opts.displayName},
        username = coalesce(${opts.username}, username),
        short_note = coalesce(${opts.shortNote}, short_note),
        web_link = coalesce(${opts.webLink}, web_link),
        profile_image = coalesce(${opts.profileImage}, profile_image)
      where id = ${existing[0].id}
    `;
  } else {
    try {
      await sql`
        insert into leaderboard (
          user_id, display_name, username, short_note, web_link, profile_image,
          amount_paid, rank, cycle_type, cycle_start, is_seed, movement
        ) values (
          ${opts.userId}, ${opts.displayName}, ${opts.username}, ${opts.shortNote}, ${opts.webLink},
          ${opts.profileImage || "/avatars/alex.jpg"},
          ${amount}, 9999, ${opts.cycleType}, ${start}, false, 0
        )
      `;
    } catch {
      await sql`
        update leaderboard set
          amount_paid = greatest(amount_paid, ${amount}),
          display_name = ${opts.displayName},
          username = coalesce(${opts.username}, username),
          short_note = coalesce(${opts.shortNote}, short_note),
          web_link = coalesce(${opts.webLink}, web_link),
          profile_image = coalesce(${opts.profileImage}, profile_image)
        where user_id = ${opts.userId} and cycle_type = ${opts.cycleType} and cycle_start = ${start}
      `;
    }
  }

  await rerank(sql, opts.cycleType, start);
  const mine = await sql<{ rank: number }>`
    select rank from leaderboard
    where user_id = ${opts.userId} and cycle_type = ${opts.cycleType} and cycle_start = ${start}
    limit 1
  `;
  return mine[0]?.rank ?? null;
}

export async function addScore(
  sql: Sql,
  opts: {
    userId: string;
    scoreDelta: number;
    cycleType: CycleType;
    displayName: string;
    shortNote: string | null;
    webLink: string | null;
    profileImage: string | null;
    username: string | null;
  },
) {
  const start = await getCycleStart(sql, opts.cycleType);
  const delta = Math.min(Math.max(0, opts.scoreDelta), 1_000_000_000);
  const existing = await sql<{ id: number; amount_paid: number | string; rank: number }>`
    select id, amount_paid, rank from leaderboard
    where user_id = ${opts.userId} and cycle_type = ${opts.cycleType} and cycle_start = ${start}
    limit 1
  `;
  const prevRank = existing[0]?.rank ?? null;
  if (existing[0]) {
    await sql`
      update leaderboard set
        amount_paid = amount_paid + ${delta},
        display_name = ${opts.displayName},
        username = coalesce(${opts.username}, username),
        short_note = coalesce(${opts.shortNote}, short_note),
        web_link = coalesce(${opts.webLink}, web_link),
        profile_image = coalesce(${opts.profileImage}, profile_image)
      where id = ${existing[0].id}
    `;
  } else {
    await upsertLeaderboard(sql, { ...opts, amount: delta });
  }
  if (existing[0]) await rerank(sql, opts.cycleType, start);
  const mine = await sql<{ rank: number; amount_paid: number | string }>`
    select rank, amount_paid from leaderboard
    where user_id = ${opts.userId} and cycle_type = ${opts.cycleType} and cycle_start = ${start}
    limit 1
  `;
  return {
    prevRank,
    rank: mine[0]?.rank ?? null,
    score: mine[0] ? num(mine[0].amount_paid) : delta,
  };
}

export async function fulfillPaidSession(session: {
  id: string;
  payment_status?: string | null;
  status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
  customer?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
}) {
  if (session.payment_status !== "paid") {
    return { ok: false as const, reason: "not_paid" };
  }
  if (!session.amount_total || session.amount_total < 100) {
    return { ok: false as const, reason: "not_paid" };
  }
  if (session.currency && session.currency.toLowerCase() !== "usd") {
    return { ok: false as const, reason: "not_paid" };
  }
  if (!parseStripeSessionId(session.id)) {
    return { ok: false as const, reason: "unknown_session" };
  }
  const sql = await getSql();
  await ensureHardening(sql);
  await ensureCreditsSchema(sql);
  type PayRow = {
    id: number;
    user_id: string;
    amount: number | string;
    cycle_type: CycleType;
    status: string;
    display_name: string | null;
    short_note: string | null;
    web_link: string | null;
    stripe_session_id: string | null;
    cycle_start: number | string | null;
    credits_purchased: number | string | null;
    exchange_rate: number | string | null;
  };
  const existing = await sql<PayRow>`
    select id, user_id, amount, cycle_type, status, display_name, short_note, web_link,
           stripe_session_id, cycle_start, credits_purchased, exchange_rate
    from payments where stripe_session_id = ${session.id}
    limit 1
  `;

  let row = existing[0];
  const meta = session.metadata ?? {};
  if (!row) {
    const pid = parsePositiveInt(meta.paymentId);
    if (pid) {
      const byId = await sql<PayRow>`
        select id, user_id, amount, cycle_type, status, display_name, short_note, web_link,
               stripe_session_id, cycle_start, credits_purchased, exchange_rate
        from payments where id = ${pid}
        limit 1
      `;
      if (
        byId[0] &&
        (!byId[0].stripe_session_id || byId[0].stripe_session_id === session.id)
      ) {
        row = byId[0];
      }
    }
  }
  if (!row) return { ok: false as const, reason: "unknown_session" };
  if (meta.userId && meta.userId !== row.user_id) {
    return { ok: false as const, reason: "mismatch" };
  }
  const cycleType = asCycle(row.cycle_type);
  if (meta.cycleType && asCycle(meta.cycleType) !== cycleType) {
    return { ok: false as const, reason: "mismatch" };
  }

  const cents = session.amount_total;
  if (cents > MAX_CONTRIBUTION * 100) {
    return { ok: false as const, reason: "not_paid" };
  }
  const amount = cents / 100;
  const intent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const start = num(row.cycle_start) > 0 ? num(row.cycle_start) : await getCycleStart(sql, cycleType);

  const claimed = await sql<{ id: number; credits_purchased: number | string | null; exchange_rate: number | string | null }>`
    update payments set
      status = 'completed',
      amount = ${amount},
      stripe_session_id = ${session.id},
      stripe_payment_intent = ${intent},
      cycle_start = coalesce(cycle_start, ${start})
    where id = ${row.id} and status <> 'completed'
    returning id, credits_purchased, exchange_rate
  `;

  const { loadEconomy, creditsFromUsd } = await import("./economy");
  const eco = await loadEconomy(sql);
  const rateAtBuy = num(claimed[0]?.exchange_rate ?? row.exchange_rate) || Number(meta.rate) || eco.creditsPerUsd;
  const storedCredits = num(claimed[0]?.credits_purchased ?? row.credits_purchased);
  const creditsDelta =
    storedCredits > 0 ? Math.round(storedCredits) : creditsFromUsd(amount, { ...eco, creditsPerUsd: rateAtBuy });

  if (!claimed[0]) {
    const led = await sql<{ id: number }>`
      select id from credit_ledger where stripe_session_id = ${session.id} limit 1
    `;
    if (!led[0] && creditsDelta > 0) {
      const updated = await sql<{ credits: number | string }>`
        update profiles
        set credits = coalesce(credits, 0) + ${creditsDelta}
        where user_id = ${row.user_id}
        returning credits
      `;
      const newBal = num(updated[0]?.credits);
      try {
        await sql`
          insert into credit_ledger (user_id, kind, credits_delta, score_delta, stripe_session_id, resulting_credits, usd_amount, note)
          values (${row.user_id}, ${"purchase"}, ${creditsDelta}, ${0}, ${session.id}, ${newBal}, ${amount}, ${`$${amount.toFixed(2)} @ ${rateAtBuy}/USD`})
        `;
      } catch {
        /* unique session */
      }
      return { ok: true as const, rank: null, already: true, credits: newBal, creditsAdded: creditsDelta };
    }
    const bal = await sql<{ credits: number | string }>`select credits from profiles where user_id = ${row.user_id} limit 1`;
    return {
      ok: true as const,
      rank: null,
      already: true,
      credits: num(bal[0]?.credits),
      creditsAdded: creditsDelta,
    };
  }

  const customer =
    typeof session.customer === "string"
      ? session.customer
      : session.customer && typeof session.customer === "object" && "id" in session.customer
        ? String((session.customer as { id: string }).id)
        : null;

  const updated = await sql<{ credits: number | string }>`
    update profiles
    set credits = coalesce(credits, 0) + ${creditsDelta}
    where user_id = ${row.user_id}
    returning credits
  `;
  const newBal = num(updated[0]?.credits);
  await sql`
    update payments set
      credits_purchased = ${creditsDelta},
      exchange_rate = ${rateAtBuy},
      resulting_credits = ${newBal},
      stripe_customer_id = coalesce(${customer}, stripe_customer_id)
    where id = ${row.id}
  `;
  try {
    await sql`
      insert into credit_ledger (user_id, kind, credits_delta, score_delta, stripe_session_id, resulting_credits, usd_amount, note)
      values (${row.user_id}, ${"purchase"}, ${creditsDelta}, ${0}, ${session.id}, ${newBal}, ${amount}, ${`$${amount.toFixed(2)} @ ${rateAtBuy}/USD`})
    `;
  } catch {
    /* unique stripe session — already ledgered */
  }

  return { ok: true as const, rank: null, already: false, credits: newBal, creditsAdded: creditsDelta };
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    amount?: number;
    displayName?: string;
    shortNote?: string;
    webLink?: string;
    cycleType?: CycleType;
  } | null | undefined) => ({
    amount: data?.amount,
    displayName: clampText(data?.displayName, 80),
    shortNote: clampText(data?.shortNote, NOTE_MAX_CHARS + 16),
    webLink: clampText(data?.webLink, 320),
    cycleType: asCycle(data?.cycleType),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`pay:${context.userId}`, 8, 60_000);
    rateLimit(`payip:${clientIp()}`, 20, 60_000);
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount < 1) {
      throw new Error("Minimum purchase is $1.");
    }
    const parsedName = validateDisplayName(data.displayName);
    if (!parsedName.ok) throw new Error(parsedName.error);
    const name = parsedName.name;
    const link = requireSafeLink(data.webLink);
    const note = sanitizeNote(data.shortNote);

    const sql = await getSql();
    await ensureSeed(sql);
    const userId = context.userId;
    const email = await sessionEmail(bearerOf(context));
    const profile = await ensureProfile(sql, userId, email);
    if (!profile.username) {
      throw new Error("Choose a unique username before buying credits.");
    }
    const { assertTwoFactorUnlocked } = await import("./two-factor");
    await assertTwoFactorUnlocked(sql, userId, profile.two_factor_enabled, bearerOf(context));
    const open = await sql<{ c: number }>`
      select count(*)::int as c from payments
      where user_id = ${userId} and status in ('pending', 'processing')
    `;
    if ((open[0]?.c ?? 0) >= 8) {
      throw new Error("You have too many open checkouts. Finish one or wait a minute.");
    }
    const { loadEconomy, creditsFromUsd } = await import("./economy");
    const eco = await loadEconomy(sql);
    if (!eco.purchaseEnabled) throw new Error("Credit purchases are paused.");
    if (!Number.isFinite(amount) || amount < eco.minUsd || amount > eco.maxUsd) {
      throw new Error(`Enter an amount between $${eco.minUsd} and $${eco.maxUsd.toLocaleString()}.`);
    }
    const cents = Math.round(amount * 100);
    if (cents < 100) throw new Error("Minimum purchase is $1.");
    const creditsBuy = creditsFromUsd(amount, eco);
    const start = await getCycleStart(sql, data.cycleType);

    await sql`
      update profiles set
        display_name = ${name},
        short_note = coalesce(${note}, short_note),
        web_link = coalesce(${link}, web_link)
      where user_id = ${userId}
    `;

    const inserted = await sql<{ id: number }>`
      insert into payments (user_id, amount, cycle_type, status, display_name, short_note, web_link, cycle_start, credits_purchased, exchange_rate)
      values (${userId}, ${amount}, ${data.cycleType}, 'pending', ${name}, ${note}, ${link}, ${start}, ${creditsBuy}, ${eco.creditsPerUsd})
      returning id
    `;
    const paymentId = inserted[0]?.id;
    if (!paymentId) throw new Error("Could not create payment.");

    const { createRankCheckoutSession, getStripePublishable } = await import("./stripe");
    const publishable = await getStripePublishable(sql);
    const canEmbed = Boolean(publishable && /^pk_(test|live)_[A-Za-z0-9]+$/.test(publishable));
    try {
      let session;
      try {
        session = await createRankCheckoutSession(sql, {
          amountCents: cents,
          customerEmail: email || profile.email,
          embedded: canEmbed,
          meta: {
            userId,
            cycleType: data.cycleType,
            displayName: name,
            shortNote: note || "",
            webLink: link || "",
            amount: String(amount),
            paymentId: String(paymentId),
            credits: String(creditsBuy),
            rate: String(eco.creditsPerUsd),
          },
        });
      } catch (embedErr) {
        if (!canEmbed) throw embedErr;
        session = await createRankCheckoutSession(sql, {
          amountCents: cents,
          customerEmail: email || profile.email,
          embedded: false,
          meta: {
            userId,
            cycleType: data.cycleType,
            displayName: name,
            shortNote: note || "",
            webLink: link || "",
            amount: String(amount),
            paymentId: String(paymentId),
            credits: String(creditsBuy),
            rate: String(eco.creditsPerUsd),
          },
        });
      }
      await sql`update payments set stripe_session_id = ${session.id} where id = ${paymentId}`;
      return {
        mode: session.embedded ? ("embedded" as const) : ("hosted" as const),
        sessionId: session.id,
        clientSecret: session.clientSecret,
        publishableKey: session.embedded ? publishable : null,
        url: session.url,
        amount,
        cycleType: data.cycleType,
        displayName: name,
        shortNote: note,
      };
    } catch (err) {
      await sql`update payments set status = 'failed' where id = ${paymentId}`;
      const { redactStripeError } = await import("./stripe");
      const msg = redactStripeError(err);
      if (/not configured/i.test(err instanceof Error ? err.message : "")) {
        throw new Error(
          profile.is_owner
            ? "Add your Stripe test secret key in Admin → Stripe, then try again."
            : "Secure checkout isn't open yet. Please try again shortly.",
        );
      }
      throw new Error(msg);
    }
  });

export const completeCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { sessionId?: string } | null | undefined) => ({
    sessionId: clampText(data?.sessionId, 200),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`confirm:${context.userId}`, 20, 60_000);
    const sessionId = parseStripeSessionId(data.sessionId);
    if (!sessionId) throw new Error("Invalid checkout session.");
    const sql = await getSql();
    const { retrieveCheckoutSession, redactStripeError } = await import("./stripe");
    let session;
    try {
      session = await retrieveCheckoutSession(sql, sessionId);
    } catch (err) {
      throw new Error(redactStripeError(err, "Could not confirm payment."));
    }
    if (session.client_reference_id !== context.userId) {
      throw new Error("This payment does not belong to you.");
    }
    const result = await fulfillPaidSession(session);
    if (!result.ok) {
      throw new Error(
        result.reason === "not_paid"
          ? "Payment is not complete yet."
          : result.reason === "busy"
            ? "Payment is still confirming. Refresh in a moment."
            : "Payment not found.",
      );
    }
    return { ok: true, rank: result.rank, already: result.already, credits: result.credits, creditsAdded: result.creditsAdded ?? 0 };
  });

export const spendCredits = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { credits?: number; cycleType?: CycleType } | null | undefined) => ({
    credits: Number(data?.credits),
    cycleType: asCycle(data?.cycleType),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`spend:${context.userId}`, 20, 60_000);
    const spend = Math.round(Number(data.credits));
    if (!Number.isFinite(spend) || spend < 1 || spend > 1_000_000) {
      throw new Error("Choose between 1 and 1,000,000 credits.");
    }
    const sql = await getSql();
    await ensureSeed(sql);
    const email = await sessionEmail(bearerOf(context));
    const profile = await ensureProfile(sql, context.userId, email);
    if (!profile.username) throw new Error("Choose a username before ranking up.");
    const { assertTwoFactorUnlocked } = await import("./two-factor");
    await assertTwoFactorUnlocked(sql, context.userId, profile.two_factor_enabled, bearerOf(context));

    const deducted = await sql<{ credits: number | string }>`
      update profiles
      set credits = credits - ${spend}
      where user_id = ${context.userId} and credits >= ${spend}
      returning credits
    `;
    if (!deducted[0]) throw new Error("Not enough credits. Buy credits first.");

    await sql`
      insert into credit_ledger (user_id, kind, credits_delta, score_delta, cycle_type, resulting_credits, note)
      values (${context.userId}, ${"spend"}, ${-spend}, ${spend}, ${data.cycleType}, ${num(deducted[0].credits)}, ${`Rank up ${data.cycleType}`})
    `;

    const parsedName = validateDisplayName(profile.display_name || "Competitor");
    const moved = await addScore(sql, {
      userId: context.userId,
      scoreDelta: spend,
      cycleType: data.cycleType,
      displayName: parsedName.ok ? parsedName.name : "Competitor",
      shortNote: profile.short_note,
      webLink: profile.web_link,
      profileImage: profile.profile_image,
      username: profile.username,
    });

    return {
      credits: num(deducted[0].credits),
      spent: spend,
      cycleType: data.cycleType,
      score: moved.score,
      rank: moved.rank,
      prevRank: moved.prevRank,
    };
  });

export const adminUpdatePrizes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    monthlyGold?: number;
    monthlySilver?: number;
    monthlyBronze?: number;
    weeklyGold?: number;
  } | null | undefined) => ({
    monthlyGold: Number(data?.monthlyGold),
    monthlySilver: Number(data?.monthlySilver),
    monthlyBronze: Number(data?.monthlyBronze),
    weeklyGold: Number(data?.weeklyGold),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin:${context.userId}`, 40, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const updates: Array<{ pos: number; tier: string; label: string; amount: number; cycle: CycleType }> = [
      { pos: 1, tier: "gold", label: "1st Place", amount: requirePrizeAmount(data.monthlyGold), cycle: "monthly" },
      { pos: 2, tier: "silver", label: "2nd Place", amount: requirePrizeAmount(data.monthlySilver), cycle: "monthly" },
      { pos: 3, tier: "bronze", label: "3rd Place", amount: requirePrizeAmount(data.monthlyBronze), cycle: "monthly" },
      { pos: 1, tier: "gold", label: "1st Place Only", amount: requirePrizeAmount(data.weeklyGold), cycle: "weekly" },
    ];
    for (const u of updates) {
      const found = await sql<{ id: number }>`
        select id from prizes where cycle_type = ${u.cycle} and tier = ${u.tier} and position = ${u.pos}
      `;
      if (found[0]) {
        await sql`update prizes set amount = ${u.amount}, label = ${u.label} where id = ${found[0].id}`;
      } else {
        await sql`
          insert into prizes (position, tier, label, amount, cycle_type)
          values (${u.pos}, ${u.tier}, ${u.label}, ${u.amount}, ${u.cycle})
        `;
      }
    }
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    return sql<{
      user_id: string;
      display_name: string | null;
      username: string | null;
      email: string | null;
      web_link: string | null;
      profile_image: string | null;
      is_admin: boolean;
      is_owner: boolean;
    }>`
      select user_id, display_name, username, email, web_link, profile_image, is_admin, is_owner
      from profiles order by is_owner desc, is_admin desc, created_at desc
      limit 500
    `;
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const rows = await sql<{
      id: number;
      user_id: string;
      amount: number | string;
      cycle_type: CycleType;
      status: string;
      stripe_session_id: string | null;
      created_at: string;
      display_name: string | null;
    }>`
      select id, user_id, amount, cycle_type, status, stripe_session_id,
             created_at::text as created_at, display_name
      from payments order by created_at desc limit 40
    `;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      amount: num(r.amount),
      cycleType: r.cycle_type,
      status: r.status,
      createdAt: r.created_at,
      displayName: r.display_name,
    }));
  });

export const adminRemoveEntry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id?: number; cycleType?: CycleType } | null | undefined) => ({
    id: data?.id,
    cycleType: asCycle(data?.cycleType),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin:${context.userId}`, 40, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const id = parsePositiveInt(data.id);
    if (!id) throw new Error("Invalid entry.");
    const cycleType = asCycle(data.cycleType);
    const start = await getCycleStart(sql, cycleType);
    await sql`delete from leaderboard where id = ${id} and cycle_type = ${cycleType}`;
    await rerank(sql, cycleType, start);
    return { ok: true };
  });

export const adminAdjustScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id?: number; cycleType?: CycleType; delta?: number } | null | undefined) => ({
    id: data?.id,
    cycleType: asCycle(data?.cycleType),
    delta: Math.trunc(Number(data?.delta) || 0),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin-score:${context.userId}`, 40, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const id = parsePositiveInt(data.id);
    if (!id) throw new Error("Invalid entry.");
    const delta = data.delta;
    if (!delta || Math.abs(delta) > 1_000_000) throw new Error("Enter a Score amount between 1 and 1,000,000.");
    const cycleType = asCycle(data.cycleType);
    const start = await getCycleStart(sql, cycleType);
    const row = await sql<{
      id: number;
      user_id: string | null;
      display_name: string | null;
      amount_paid: number | string;
    }>`
      select id, user_id, display_name, amount_paid from leaderboard
      where id = ${id} and cycle_type = ${cycleType} and cycle_start = ${start}
      limit 1
    `;
    const entry = row[0];
    if (!entry) throw new Error("Player not found on this board.");
    const current = Math.max(0, num(entry.amount_paid));
    const next = Math.max(0, Math.min(1_000_000_000, current + delta));
    if (next === current) {
      throw new Error(delta < 0 ? "Score is already 0." : "Score did not change.");
    }
    await sql`update leaderboard set amount_paid = ${next} where id = ${entry.id}`;
    await rerank(sql, cycleType, start);
    const actor = entry.user_id || context.userId;
    const note = `Admin ${delta > 0 ? "granted" : "removed"} ${Math.abs(delta)} ${cycleType} score for ${entry.display_name || "player"} (${current} → ${next})`;
    await sql`
      insert into credit_ledger (user_id, kind, credits_delta, score_delta, cycle_type, resulting_credits, note)
      values (${actor}, ${"admin_adjust"}, ${0}, ${next - current}, ${cycleType}, ${null}, ${note})
    `;
    return { ok: true as const, score: next, delta: next - current };
  });

export const adminResetCycle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { cycleType?: CycleType } | null | undefined) => ({
    cycleType: asCycle(data?.cycleType),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin-reset:${context.userId}`, 6, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const cycleType = asCycle(data.cycleType);
    const start = await getCycleStart(sql, cycleType);
    const entries = await sql<LbRow>`
      select id, user_id, display_name, username, short_note, web_link, profile_image,
             amount_paid, rank, cycle_type, movement
      from leaderboard where cycle_type = ${cycleType} and cycle_start = ${start}
      order by rank
    `;
    const revenue = entries.reduce((s, e) => s + num(e.amount_paid), 0);
    await sql`
      insert into archive (cycle_type, cycle_start, cycle_end, entries_json, total_participants, total_revenue)
      values (
        ${cycleType}, ${start}, ${Date.now()},
        ${JSON.stringify(entries.map(publicEntry))}, ${entries.length}, ${revenue}
      )
    `;
    await sql`delete from leaderboard where cycle_type = ${cycleType} and cycle_start = ${start}`;
    const next = Date.now();
    const key = cycleType === "monthly" ? "monthlyCycleStart" : "weeklyCycleStart";
    await sql`update config set value = ${String(next)} where key = ${key}`;
    return { ok: true, archived: entries.length };
  });

export const getArchives = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    return (await sql<{
      id: number;
      cycle_type: CycleType;
      cycle_start: number | string;
      cycle_end: number | string;
      total_participants: number;
      total_revenue: number | string;
      created_at: string;
    }>`
      select id, cycle_type, cycle_start, cycle_end, total_participants, total_revenue, created_at::text as created_at
      from archive order by created_at desc limit 24
    `).map((a) => ({
      ...a,
      cycle_type: asCycle(a.cycle_type),
      total_participants: Math.max(0, Math.trunc(num(a.total_participants))),
      total_revenue: Math.min(1_000_000_000, Math.max(0, num(a.total_revenue))),
    }));
  } catch {
    return [];
  }
});

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId?: string; isAdmin?: boolean } | null | undefined) => ({
    userId: clampText(data?.userId, 128),
    isAdmin: data?.isAdmin === true,
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin:${context.userId}`, 40, 60_000);
    if (!data.userId) throw new Error("User not found.");
    const sql = await getSql();
    const actor = await requireOwner(sql, context.userId, bearerOf(context));
    if (data.userId === actor.user_id) throw new Error("You cannot change your own owner role.");
    const target = await loadProfile(sql, data.userId);
    if (!target) throw new Error("User not found.");
    if (target.is_owner) throw new Error("The owner cannot be removed or demoted.");
    const ownerEmail = await lockedOwnerEmail(sql);
    if (ownerEmail && normEmail(target.email) === ownerEmail) {
      throw new Error("The owner cannot be removed or demoted.");
    }
    await sql`update profiles set is_admin = ${data.isAdmin} where user_id = ${data.userId} and is_owner = false`;
    return { ok: true };
  });

export const adminGrantByEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { email?: string } | null | undefined) => ({
    email: clampText(data?.email, 254),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin:${context.userId}`, 40, 60_000);
    const sql = await getSql();
    await requireOwner(sql, context.userId, bearerOf(context));
    const email = normEmail(data.email);
    if (!email || email.length > 254) throw new Error("Enter a valid email.");
    const ownerEmail = normEmail(await getCfg(sql, "ownerEmail"));
    if (ownerEmail && email === ownerEmail) throw new Error("That email already belongs to the owner.");

    const found = await sql<{ user_id: string; is_owner: boolean }>`
      select user_id, is_owner from profiles where lower(email) = ${email} limit 1
    `;
    if (found[0]?.is_owner) throw new Error("The owner cannot be changed.");
    if (found[0]) {
      await sql`update profiles set is_admin = true where user_id = ${found[0].user_id} and is_owner = false`;
      return { ok: true, pending: false };
    }
    const pending = await pendingAdminEmails(sql);
    if (!pending.includes(email)) {
      if (pending.length >= 50) throw new Error("Too many pending admin invites.");
      pending.push(email);
    }
    await setCfg(sql, "pendingAdminEmails", JSON.stringify(pending));
    return { ok: true, pending: true };
  });

export const adminStripeSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireOwner(sql, context.userId, bearerOf(context));
    const {
      getStripeSecret,
      getStripePublishable,
      getStripeWebhookSecret,
      stripeSecretFromEnv,
      stripePublishableFromEnv,
      stripeWebhookFromEnv,
      maskStripeKey,
    } = await import("./stripe");
    const secret = await getStripeSecret(sql);
    const publishable = await getStripePublishable(sql);
    const webhook = await getStripeWebhookSecret(sql);
    const fromEnv = Boolean(stripeSecretFromEnv());
    return {
      configured: Boolean(secret),
      livemode: Boolean(secret?.startsWith("sk_live") || secret?.startsWith("rk_live")),
      fromEnv,
      secretMasked: fromEnv ? "" : maskStripeKey(secret),
      publishableMasked: stripePublishableFromEnv() ? "" : maskStripeKey(publishable),
      webhookMasked: stripeWebhookFromEnv() ? "" : maskStripeKey(webhook),
    };
  });

export const adminSaveStripeKeys = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    secretKey?: string;
    publishableKey?: string;
    webhookSecret?: string;
  } | null | undefined) => ({
    secretKey: clampText(data?.secretKey, 256),
    publishableKey: clampText(data?.publishableKey, 256),
    webhookSecret: clampText(data?.webhookSecret, 256),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin-stripe:${context.userId}`, 8, 60_000);
    const sql = await getSql();
    await requireOwner(sql, context.userId, bearerOf(context));
    const { stripeSecretFromEnv, setConfigValue } = await import("./stripe");
    if (stripeSecretFromEnv() && data.secretKey?.trim()) {
      throw new Error("Secret key is loaded from the server environment and cannot be overwritten here.");
    }
    const secret = data.secretKey?.trim();
    const pub = data.publishableKey?.trim();
    const hook = data.webhookSecret?.trim();
    if (secret && secret.length > 256) throw new Error("Secret key is invalid.");
    if (pub && pub.length > 256) throw new Error("Publishable key is invalid.");
    if (hook && hook.length > 256) throw new Error("Webhook secret is invalid.");
    if (secret) {
      if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(secret) || secret.length < 20) {
        throw new Error("Secret key should start with sk_test_ or sk_live_.");
      }
      await setConfigValue(sql, "stripeSecretKey", secret);
    }
    if (pub) {
      if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(pub) || pub.length < 20) {
        throw new Error("Publishable key should start with pk_test_ or pk_live_.");
      }
      await setConfigValue(sql, "stripePublishableKey", pub);
    }
    if (hook) {
      if (!/^whsec_[A-Za-z0-9]+$/.test(hook) || hook.length < 16) {
        throw new Error("Webhook secret should start with whsec_.");
      }
      await setConfigValue(sql, "stripeWebhookSecret", hook);
    }
    return { ok: true };
  });

function parseSupportEmail(raw: string | null | undefined) {
  const v = clampText(raw, 254).trim().toLowerCase();
  if (!v) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.length > 254) {
    throw new Error("Enter a valid support email, or leave it blank.");
  }
  return v;
}

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    await ensureSeed(sql);
    const raw = (await getCfg(sql, "supportEmail"))?.trim() || "";
    const examples = (await getCfg(sql, "showExamplePlayers"))?.trim() !== "0";
    return {
      supportEmail: raw && raw.includes("@") ? raw : null,
      showExamplePlayers: examples,
    };
  } catch {
    return { supportEmail: null as string | null, showExamplePlayers: true };
  }
});

export const adminSaveSupportEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { email?: string } | null | undefined) => ({
    email: clampText(data?.email, 254),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin-support:${context.userId}`, 20, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    const email = parseSupportEmail(data.email);
    await setCfg(sql, "supportEmail", email);
    return { ok: true as const, supportEmail: email || null };
  });

export const adminSaveExamplePlayers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { show?: boolean } | null | undefined) => ({
    show: Boolean(data?.show),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`admin-examples:${context.userId}`, 20, 60_000);
    const sql = await getSql();
    await requireAdmin(sql, context.userId, bearerOf(context));
    await setCfg(sql, "showExamplePlayers", data.show ? "1" : "0");
    return { ok: true as const, showExamplePlayers: data.show };
  });
