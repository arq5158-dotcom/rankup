import { createServerFn } from "@tanstack/react-start";
import type { Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { clientIp, clampText, rateLimit } from "@/lib/server/security";

export type SignInMethod = "google" | "x" | "email";

function parseCode(raw: unknown) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s/g, "").slice(0, 8);
}

function bearerOf(context: { userId: string }) {
  return (context as { userId: string; bearerToken?: string }).bearerToken;
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function totpLib() {
  return import("@/lib/server/totp");
}

async function sessionUnlockKey(bearer?: string | null) {
  const { shaSessionKey } = await totpLib();
  let raw = (bearer || "").trim();
  if (!raw) {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const cookie = getRequest()?.headers.get("cookie") || "";
      const m = cookie.match(/(?:^|;\s*)(?:__Host-)?grok-auth\.session_token=([^;]+)/);
      raw = m ? decodeURIComponent(m[1]) : "";
    } catch {
      raw = "";
    }
  }
  return shaSessionKey(raw || "no-session");
}

export async function ensureTwoFactorSchema(sql: Sql) {
  const done = await sql<{ value: string }>`select value from config where key = ${"twoFactor0008"}`;
  if (done[0]?.value === "1") return;
  try {
    await sql.query("alter table profiles add column if not exists two_factor_secret text");
    await sql.query("alter table profiles add column if not exists two_factor_pending text");
    await sql.query("alter table profiles alter column two_factor_enabled set default false");
    await sql.query(
      "update profiles set two_factor_enabled = false where two_factor_secret is null or two_factor_secret = ''",
    );
    await sql.query(`
      create table if not exists two_factor_unlock (
        user_id text not null,
        session_key text not null,
        expires_at timestamptz not null,
        primary key (user_id, session_key)
      )
    `);
    await sql.query("create index if not exists two_factor_unlock_exp_idx on two_factor_unlock (expires_at)");
    await sql`insert into config (key, value) values (${"twoFactor0008"}, ${"1"}) on conflict (key) do update set value = ${"1"}`;
  } catch (err) {
    console.error("[2fa] schema skipped", err instanceof Error ? err.message : err);
  }
}

export async function listSignInMethods(sql: Sql, userId: string): Promise<SignInMethod[]> {
  try {
    const rows = await sql<{ providerId: string }>`
      select "providerId" as "providerId" from account where "userId" = ${userId}
    `;
    const out = new Set<SignInMethod>();
    for (const r of rows) {
      const id = (r.providerId || "").toLowerCase();
      if (id.includes("google")) out.add("google");
      else if (id.includes("twitter") || id === "x" || id.includes("grok-x")) out.add("x");
      else if (id === "credential" || id === "email" || id.includes("password")) out.add("email");
    }
    return [...out];
  } catch {
    return [];
  }
}

export async function twoFactorUnlocked(sql: Sql, userId: string, bearer?: string | null) {
  await ensureTwoFactorSchema(sql);
  const key = await sessionUnlockKey(bearer);
  const rows = await sql<{ c: number }>`
    select count(*)::int as c from two_factor_unlock
    where user_id = ${userId} and session_key = ${key} and expires_at > now()
  `;
  return (rows[0]?.c ?? 0) > 0;
}

export async function assertTwoFactorUnlocked(sql: Sql, userId: string, enabled: boolean, bearer?: string | null) {
  if (!enabled) return;
  if (await twoFactorUnlocked(sql, userId, bearer)) return;
  throw new Error("Enter your authenticator code before continuing.");
}

async function markUnlocked(sql: Sql, userId: string, bearer?: string | null) {
  const key = await sessionUnlockKey(bearer);
  await sql`delete from two_factor_unlock where user_id = ${userId} and expires_at < now()`;
  await sql`
    insert into two_factor_unlock (user_id, session_key, expires_at)
    values (${userId}, ${key}, now() + interval '12 hours')
    on conflict (user_id, session_key) do update set expires_at = now() + interval '12 hours'
  `;
}

export const beginTwoFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    rateLimit(`2fa-begin:${context.userId}`, 6, 60 * 60 * 1000);
    const sql = await sqlClient();
    await ensureTwoFactorSchema(sql);
    const profile = await sql<{ two_factor_enabled: boolean }>`
      select two_factor_enabled from profiles where user_id = ${context.userId}
    `;
    if (profile[0]?.two_factor_enabled) throw new Error("Authenticator is already on.");
    const emailRow = await sql<{ email: string | null }>`select email from profiles where user_id = ${context.userId}`;
    const { randomTotpSecret, otpauthUrl } = await totpLib();
    const secret = randomTotpSecret();
    await sql`update profiles set two_factor_pending = ${secret} where user_id = ${context.userId}`;
    const account = emailRow[0]?.email || "competitor";
    const url = otpauthUrl(secret, account);
    const QRCode = (await import("qrcode")).default;
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      width: 220,
      color: { dark: "#1a1408", light: "#f0ede5" },
    });
    return { secret, otpauth: url, qrDataUrl };
  });

export const confirmTwoFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code?: string } | null | undefined) => ({
    code: parseCode(data?.code),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`2fa-ok:${context.userId}`, 10, 10 * 60 * 1000);
    if (!/^\d{6}$/.test(data.code)) throw new Error("Enter the 6-digit code from your app.");
    const sql = await sqlClient();
    await ensureTwoFactorSchema(sql);
    const { verifyTotp } = await totpLib();
    const row = await sql<{ two_factor_pending: string | null }>`
      select two_factor_pending from profiles where user_id = ${context.userId}
    `;
    const pending = row[0]?.two_factor_pending;
    if (!pending) throw new Error("Start authenticator setup first.");
    if (!verifyTotp(pending, data.code)) throw new Error("That code is wrong or expired. Try the next one.");
    await sql`
      update profiles set
        two_factor_secret = ${pending},
        two_factor_pending = null,
        two_factor_enabled = true
      where user_id = ${context.userId}
    `;
    await markUnlocked(sql, context.userId, bearerOf(context));
    return { ok: true as const };
  });

export const disableTwoFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code?: string } | null | undefined) => ({
    code: parseCode(data?.code),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`2fa-off:${context.userId}`, 8, 10 * 60 * 1000);
    if (!/^\d{6}$/.test(data.code)) throw new Error("Enter the 6-digit code to turn this off.");
    const sql = await sqlClient();
    await ensureTwoFactorSchema(sql);
    const { verifyTotp } = await totpLib();
    const row = await sql<{ two_factor_secret: string | null }>`
      select two_factor_secret from profiles where user_id = ${context.userId}
    `;
    const secret = row[0]?.two_factor_secret;
    if (!secret) throw new Error("Authenticator is not on.");
    if (!verifyTotp(secret, data.code)) throw new Error("That code is wrong or expired.");
    await sql`
      update profiles set two_factor_enabled = false, two_factor_secret = null, two_factor_pending = null
      where user_id = ${context.userId}
    `;
    await sql`delete from two_factor_unlock where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const unlockTwoFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code?: string } | null | undefined) => ({
    code: parseCode(data?.code),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`2fa-unlock:${context.userId}`, 12, 10 * 60 * 1000);
    rateLimit(`2fa-unlock-ip:${clientIp()}`, 20, 10 * 60 * 1000);
    if (!/^\d{6}$/.test(data.code)) throw new Error("Enter the 6-digit code from your app.");
    const sql = await sqlClient();
    await ensureTwoFactorSchema(sql);
    const { verifyTotp } = await totpLib();
    const row = await sql<{ two_factor_secret: string | null; two_factor_enabled: boolean }>`
      select two_factor_secret, two_factor_enabled from profiles where user_id = ${context.userId}
    `;
    if (!row[0]?.two_factor_enabled || !row[0].two_factor_secret) {
      return { ok: true as const };
    }
    if (!verifyTotp(row[0].two_factor_secret, data.code)) {
      throw new Error("That code is wrong or expired. Try the next one.");
    }
    await markUnlocked(sql, context.userId, bearerOf(context));
    return { ok: true as const };
  });

export const cancelTwoFactorSetup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await ensureTwoFactorSchema(sql);
    await sql`
      update profiles set two_factor_pending = null
      where user_id = ${context.userId} and two_factor_enabled = false
    `;
    return { ok: true as const };
  });

export const changeEmailPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { currentPassword?: string; newPassword?: string } | null | undefined) => ({
    currentPassword: clampText(data?.currentPassword, 128),
    newPassword: clampText(data?.newPassword, 128),
  }))
  .handler(async ({ context, data }) => {
    rateLimit(`pw:${context.userId}`, 6, 15 * 60 * 1000);
    if (data.currentPassword.length < 8 || data.newPassword.length < 8) {
      throw new Error("Passwords must be at least 8 characters.");
    }
    if (data.currentPassword === data.newPassword) {
      throw new Error("Pick a new password that is different from the current one.");
    }
    const sql = await sqlClient();
    const methods = await listSignInMethods(sql, context.userId);
    if (!methods.includes("email")) {
      throw new Error("This account signs in with Google or X. There is no Pay4Rank password to change.");
    }
    const { auth } = await import("@/lib/auth/server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (!request) throw new Error("Could not update password. Try again.");
    const headers = new Headers(request.headers);
    const bearer = bearerOf(context);
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    try {
      await auth.api.changePassword({
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: true,
        },
        headers,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update password.";
      if (/invalid|incorrect|credential|password/i.test(msg)) {
        throw new Error("Current password is incorrect.");
      }
      throw new Error("Could not update password. Try again.");
    }
    return { ok: true as const };
  });
