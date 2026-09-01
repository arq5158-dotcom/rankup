import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { rateLimit } from "@/lib/server/security";
import {
  DEFAULT_ECONOMY,
  parseEconomy,
  type CreditEconomy,
} from "@/lib/economy";

export type { CreditEconomy } from "@/lib/economy";
export { DEFAULT_ECONOMY, creditsFromUsd, parseEconomy } from "@/lib/economy";

const KEY = "creditEconomy";
const LOG_KEY = "creditEconomyLog";

function num(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function loadEconomy(sql: Sql): Promise<CreditEconomy> {
  const rows = await sql<{ value: string }>`select value from config where key = ${KEY}`;
  return parseEconomy(rows[0]?.value);
}

export const getCreditEconomy = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return loadEconomy(sql);
});

export const adminGetEconomy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await sql<{ is_admin: boolean; is_owner: boolean }>`
      select is_admin, is_owner from profiles where user_id = ${context.userId}
    `;
    if (!me[0]?.is_admin && !me[0]?.is_owner) throw new Error("Admin only.");
    const eco = await loadEconomy(sql);
    const logRows = await sql<{ value: string }>`select value from config where key = ${LOG_KEY}`;
    let log: { at: string; who: string; note: string }[] = [];
    try {
      log = logRows[0]?.value ? JSON.parse(logRows[0].value) : [];
    } catch {
      log = [];
    }
    return { economy: eco, log: log.slice(0, 40) };
  });

export const adminSaveEconomy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: Partial<CreditEconomy> | null | undefined) => ({
    creditsPerUsd: Number(data?.creditsPerUsd),
    minUsd: Number(data?.minUsd),
    maxUsd: Number(data?.maxUsd),
    packages: Array.isArray(data?.packages) ? data!.packages.map(Number) : DEFAULT_ECONOMY.packages,
    customEnabled: data?.customEnabled !== false,
    purchaseEnabled: data?.purchaseEnabled !== false,
    promoBonusPct: Number(data?.promoBonusPct ?? 0),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`eco:${context.userId}`, 20, 60_000);
    const sql = await getSql();
    const me = await sql<{ is_admin: boolean; is_owner: boolean }>`
      select is_admin, is_owner from profiles where user_id = ${context.userId}
    `;
    if (!me[0]?.is_admin && !me[0]?.is_owner) throw new Error("Admin only.");
    const next: CreditEconomy = {
      creditsPerUsd: Math.max(1, Math.min(1_000_000, Math.round(data.creditsPerUsd || 1000))),
      minUsd: Math.max(1, data.minUsd || 1),
      maxUsd: Math.max(data.minUsd || 1, data.maxUsd || 10_000),
      packages: (data.packages.length ? data.packages : DEFAULT_ECONOMY.packages)
        .map((n) => Math.round(n))
        .filter((n) => n >= 1)
        .slice(0, 12),
      customEnabled: data.customEnabled,
      purchaseEnabled: data.purchaseEnabled,
      promoBonusPct: Math.max(0, Math.min(100, Math.round(data.promoBonusPct || 0))),
    };
    await sql`
      insert into config (key, value) values (${KEY}, ${JSON.stringify(next)})
      on conflict (key) do update set value = ${JSON.stringify(next)}
    `;
    const entry = {
      at: new Date().toISOString(),
      who: context.userId.slice(0, 12),
      note: `$1 = ${next.creditsPerUsd} credits · min $${next.minUsd} · max $${next.maxUsd} · promo ${next.promoBonusPct}%`,
    };
    const prev = await sql<{ value: string }>`select value from config where key = ${LOG_KEY}`;
    let log: typeof entry[] = [];
    try {
      log = prev[0]?.value ? JSON.parse(prev[0].value) : [];
    } catch {
      log = [];
    }
    log = [entry, ...log].slice(0, 80);
    await sql`
      insert into config (key, value) values (${LOG_KEY}, ${JSON.stringify(log)})
      on conflict (key) do update set value = ${JSON.stringify(log)}
    `;
    return { economy: next, log };
  });

export type LedgerRow = {
  id: number;
  kind: string;
  creditsDelta: number;
  scoreDelta: number;
  usdAmount: number | null;
  stripeSessionId: string | null;
  resultingCredits: number | null;
  createdAt: string;
};

export const getMyLedger = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      kind: string;
      credits_delta: number | string;
      score_delta: number | string;
      usd_amount: number | string | null;
      stripe_session_id: string | null;
      resulting_credits: number | string | null;
      created_at: string;
    }>`
      select id, kind, credits_delta, score_delta, usd_amount, stripe_session_id,
             resulting_credits, created_at::text as created_at
      from credit_ledger
      where user_id = ${context.userId}
      order by created_at desc
      limit 80
    `;
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      creditsDelta: num(r.credits_delta),
      scoreDelta: num(r.score_delta),
      usdAmount: r.usd_amount == null ? null : num(r.usd_amount),
      stripeSessionId: r.stripe_session_id,
      resultingCredits: r.resulting_credits == null ? null : num(r.resulting_credits),
      createdAt: r.created_at,
    })) satisfies LedgerRow[];
  });
