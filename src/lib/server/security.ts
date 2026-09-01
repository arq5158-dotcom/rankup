import { getRequest } from "@tanstack/react-start/server";

type Bucket = { n: number; t: number };
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 4000) return;
  for (const [k, b] of buckets) {
    if (now - b.t > 120_000) buckets.delete(k);
  }
  if (buckets.size > 6000) buckets.clear();
}

export function clientIp(request?: Request | null) {
  const r = request ?? (typeof getRequest === "function" ? getRequest() : null);
  const xf = r?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  if (xf && /^[0-9a-f:.]+$/i.test(xf) && xf.length < 80) return xf;
  const real = r?.headers.get("x-real-ip")?.trim() || "";
  if (real && /^[0-9a-f:.]+$/i.test(real) && real.length < 80) return real;
  return "unknown";
}

function hit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  prune(now);
  const b = buckets.get(key);
  if (!b || now - b.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    return false;
  }
  if (b.n >= max) return true;
  b.n += 1;
  return false;
}

export function rateLimit(key: string, max: number, windowMs: number) {
  if (hit(key, max, windowMs)) {
    throw new Error("Too many attempts. Please wait a moment and try again.");
  }
}

export function rateLimitHit(key: string, max: number, windowMs: number) {
  return hit(key, max, windowMs);
}

export function parsePositiveInt(raw: unknown, max = 2_147_483_647) {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0 && raw <= max) return raw;
  if (typeof raw === "string" && /^\d{1,10}$/.test(raw)) {
    const n = Number(raw);
    if (Number.isInteger(n) && n > 0 && n <= max) return n;
  }
  return null;
}

export function parseStripeSessionId(raw: unknown) {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (id.length < 10 || id.length > 200) return null;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return null;
  return id;
}

function hostnameFromEnv(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  try {
    return new URL(v.includes("://") ? v : `https://${v}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isAllowedHost(hostHeader: string) {
  const host = hostHeader.split(",")[0]?.trim().toLowerCase() || "";
  const hostname = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  if (!hostname || hostname.length > 253) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  if (!/^[a-z0-9.-]+$/.test(hostname)) return false;
  if (
    hostname.endsWith(".grok-sandbox.com") ||
    hostname.endsWith(".grok.me") ||
    hostname.endsWith(".vercel.app") ||
    hostname === "pay4rank.com" ||
    hostname === "www.pay4rank.com"
  ) {
    return true;
  }
  const allowed = [
    process.env.BETTER_AUTH_URL,
    process.env.VITE_PUBLIC_HOSTNAME,
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];
  for (const raw of allowed) {
    if (!raw) continue;
    const envHost = hostnameFromEnv(raw);
    if (envHost && envHost === hostname) return true;
  }
  return false;
}

export function safePublicMessage(err: unknown, fallback = "Something went wrong. Try again.") {
  const msg = err instanceof Error ? err.message : fallback;
  if (/sql|postgres|relation |column |econn|enotfound|stack|\/workspace|sk_live|sk_test|whsec_|api.key|internal/i.test(msg)) {
    return fallback;
  }
  if (msg.length > 160) return fallback;
  return msg || fallback;
}

export function asCycle(v: unknown): "monthly" | "weekly" {
  return v === "weekly" ? "weekly" : "monthly";
}

export function asBool(v: unknown) {
  return v === true;
}

export function clampText(v: unknown, max: number) {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
}
