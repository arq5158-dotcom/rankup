import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(amount: number) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function publicErrorMessage(err: unknown, fallback = "Something went wrong. Try again.") {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : fallback;
  if (
    /sql|postgres|relation |column |econn|enotfound|stack|\/workspace|sk_live|sk_test|whsec_|api.?key|internal|unauthorizederror/i.test(
      msg,
    )
  ) {
    return fallback;
  }
  if (msg.length > 160) return fallback;
  return msg || fallback;
}

export const MIN_CONTRIBUTION = 1;
export const MAX_CONTRIBUTION = 10_000;
export const MAX_PRIZE = 1_000_000;

export const NOTE_MAX_CHARS = 160;
export const NOTE_MAX_WORDS = 28;

export function clipNote(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const byChars = cleaned.slice(0, NOTE_MAX_CHARS);
  const words = byChars.split(" ");
  const clipped = words.length > NOTE_MAX_WORDS ? words.slice(0, NOTE_MAX_WORDS).join(" ") : byChars;
  return clipped || null;
}

export function hostFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").slice(0, 80);
  } catch {
    return "link";
  }
}

const BLOCKED_HOST_BITS = [
  "porn",
  "xxx",
  "nsfw",
  "adult",
  "sex",
  "nude",
  "fetish",
  "xvideos",
  "pornhub",
  "xhamster",
  "redtube",
  "youporn",
  "brazzers",
  "onlyfans",
  "xnxx",
  "chaturbate",
  "stripchat",
];

const BLOCKED_HOSTS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "tiny.cc",
  "rb.gy",
  "shorturl.at",
  "tiny.one",
  "b.link",
  "lnkd.in",
]);

const BLOCKED_TLDS = [".onion", ".zip", ".mov", ".tk", ".gq", ".ml", ".cf", ".ga", ".click", ".country"];

function isPrivateHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "localhost" || h === "0.0.0.0" || h === "::" || h === "::1" || h === "ip6-localhost") {
    return true;
  }
  if (
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".localhost") ||
    h.endsWith(".arpa") ||
    h.endsWith(".lan") ||
    h.endsWith(".home") ||
    h.endsWith(".corp")
  ) {
    return true;
  }
  if (h.includes(":")) {
    if (h.startsWith("fe80") || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("ff")) return true;
    if (h.includes("::ffff:")) return isPrivateHost(h.split("::ffff:")[1] || h);
    return true;
  }
  if (/^\d+$/.test(h) && Number(h) <= 0xffffffff) return true;
  if (/^0x[0-9a-f]+$/i.test(h)) return true;
  if (/^0\d+\./.test(h)) return true;
  return (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h)
  );
}

export function isUrlSafe(url: string): boolean {
  if (typeof url !== "string" || url.length < 11 || url.length > 300) return false;
  if (/[\u0000-\u001f\u007f\s<>"'`]/.test(url)) return false;
  if (/%00|%0[ad]|%0d|%0a|javascript:|data:|vbscript:|file:/i.test(url)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.port && parsed.port !== "443") return false;
    const host = parsed.hostname.toLowerCase();
    if (!host || host.length > 253) return false;
    if (host.startsWith("xn--") || host.includes(".xn--")) return false;
    if (!host.includes(".")) return false;
    if (/^\d/.test(host.split(".").pop() || "")) return false;
    if (!/^[a-z0-9.-]+$/.test(host)) return false;
    if (isPrivateHost(host)) return false;
    if (BLOCKED_HOSTS.has(host) || BLOCKED_HOSTS.has(host.replace(/^www\./, ""))) return false;
    if (BLOCKED_TLDS.some((t) => host.endsWith(t))) return false;
    if (BLOCKED_HOST_BITS.some((d) => host.includes(d))) return false;
    if (parsed.pathname.includes("\\") || parsed.href.includes("@") && parsed.href.indexOf("@") < parsed.href.indexOf(host)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https:\/\//i.test(t) ? t : t.replace(/^http:\/\//i, "https://");
  const next = /^https:\/\//i.test(withProto) ? withProto : `https://${withProto}`;
  return isUrlSafe(next) ? next : null;
}

export function isImageSafe(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  if (t.startsWith("data:")) {
    return (
      t.length <= 180_000 &&
      /^data:image\/(jpeg|jpg|webp|png);base64,[A-Za-z0-9+/=\s]+$/.test(t)
    );
  }
  if (t.length > 500) return false;
  let decoded = t;
  try {
    decoded = decodeURIComponent(t);
  } catch {
    return false;
  }
  if (/\.svg(\?|#|$)/i.test(decoded) || decoded.toLowerCase().includes("data:")) return false;
  if (decoded.startsWith("/avatars/") || decoded.startsWith("/rank/")) {
    if (decoded.includes("..") || decoded.includes("\\") || decoded.includes("//", 1) || decoded.includes("%")) return false;
    return /^\/(avatars|rank)\/[A-Za-z0-9._-]+$/.test(decoded);
  }
  if (!isUrlSafe(decoded)) return false;
  try {
    const u = new URL(decoded);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeImageSrc(url?: string | null): string | null {
  if (!url) return null;
  return isImageSafe(url) ? url : null;
}

export function isStripeCheckoutUrl(url: string) {
  return /^https:\/\/(checkout|pay)\.stripe\.com\//i.test(url);
}

export function nextMonthEnd() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59).getTime();
}

export function nextSundayEnd() {
  const n = new Date();
  const d = (7 - n.getDay()) % 7 || 7;
  const e = new Date(n);
  e.setDate(n.getDate() + d);
  e.setHours(23, 59, 59, 999);
  return e.getTime();
}

export function monthCycleStart() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).getTime();
}

export function weekCycleStart() {
  const n = new Date();
  const day = n.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const e = new Date(n);
  e.setDate(n.getDate() - diff);
  e.setHours(0, 0, 0, 0);
  return e.getTime();
}
