export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

const RESERVED = new Set([
  "admin",
  "administrator",
  "owner",
  "mod",
  "moderator",
  "staff",
  "support",
  "help",
  "official",
  "rankup",
  "rank_up",
  "rankupapp",
  "system",
  "root",
  "null",
  "undefined",
  "api",
  "www",
  "mail",
  "security",
  "contact",
  "info",
  "billing",
  "payment",
  "stripe",
  "paypal",
  "user",
  "username",
  "guest",
  "anonymous",
  "everyone",
  "login",
  "signup",
  "register",
  "account",
  "dashboard",
  "profile",
  "settings",
  "founder",
  "ceo",
  "team",
  "news",
  "about",
  "terms",
  "privacy",
  "rules",
  "cookies",
  "helpdesk",
  "superadmin",
  "rankupadmin",
  "rankupofficial",
]);

const BLOCKED = [
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "nigger",
  "nigga",
  "faggot",
  "rape",
  "porn",
  "xxx",
  "nazi",
  "hitler",
  "kill",
  "suicide",
  "terror",
  "scam",
  "fraud",
  "phish",
  "slave",
];

const STAFFISH = /admin|official|support|rankup|moderator|staff|security/;

export function normalizeUsername(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase().replace(/^@+/, "");
}

export function handleFromDisplayName(name: string): string {
  const s = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, USERNAME_MAX);
  if (!s) return "player";
  return /^[a-z]/.test(s) ? s : `p${s}`.slice(0, USERNAME_MAX);
}

export function validateUsername(
  raw: string,
): { ok: true; username: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || raw.length > 64) {
    return { ok: false, error: "Username must be 20 characters or fewer." };
  }
  if (/[^\x00-\x7F]/.test(raw.normalize("NFKC"))) {
    return { ok: false, error: "Usernames can only use English letters, numbers, and underscores." };
  }
  const username = normalizeUsername(raw);
  if (username.length < USERNAME_MIN) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (username.length > USERNAME_MAX) {
    return { ok: false, error: "Username must be 20 characters or fewer." };
  }
  if (!/^[a-z][a-z0-9_]*$/.test(username)) {
    return {
      ok: false,
      error: "Start with a letter. Use only lowercase letters, numbers, and underscores.",
    };
  }
  if (username.includes("__")) {
    return { ok: false, error: "No consecutive underscores." };
  }
  if (username.endsWith("_")) {
    return { ok: false, error: "Username can't end with an underscore." };
  }
  if (RESERVED.has(username) || STAFFISH.test(username)) {
    return { ok: false, error: "That username is reserved or looks like an official account." };
  }
  for (const w of BLOCKED) {
    if (username.includes(w)) return { ok: false, error: "That username isn't allowed." };
  }
  return { ok: true, username };
}

export function validateDisplayName(
  raw: string,
): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || raw.length > 80) {
    return { ok: false, error: "Display name must be 24 characters or fewer." };
  }
  const name = raw.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "Display name must be at least 2 characters." };
  if (name.length > 24) return { ok: false, error: "Display name must be 24 characters or fewer." };
  if (/[^\x20-\x7E]/.test(name)) {
    return { ok: false, error: "Display name can only use English letters, numbers, and punctuation." };
  }
  if (/https?:\/\//i.test(name) || /www\./i.test(name)) {
    return { ok: false, error: "Display name can't be a website." };
  }
  if (/[<>"'`]/.test(name)) return { ok: false, error: "Display name contains invalid characters." };
  const lower = name.toLowerCase();
  for (const w of BLOCKED) {
    if (lower.includes(w)) return { ok: false, error: "That display name isn't allowed." };
  }
  if (/\b(admin|official|rank\s*up staff|moderator)\b/i.test(name)) {
    return { ok: false, error: "Display name can't impersonate staff." };
  }
  return { ok: true, name };
}

export function matchesQuery(q: string, ...fields: Array<string | null | undefined>) {
  const n = q.trim().toLowerCase().replace(/^@+/, "");
  if (!n) return true;
  return fields.some((f) => (f || "").toLowerCase().includes(n));
}
