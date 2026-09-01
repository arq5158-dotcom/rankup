import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

if (typeof document !== "undefined") {
  throw new Error("TOTP helpers are server-only.");
}

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function toBase32(bytes: Buffer) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPH[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

function fromBase32(secret: string) {
  const clean = secret.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPH.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function randomTotpSecret() {
  return toBase32(randomBytes(20));
}

function hotp(secret: string, counter: number) {
  const key = fromBase32(secret);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(bin % 1_000_000).padStart(6, "0");
}

export function totpCode(secret: string, at = Date.now()) {
  return hotp(secret, Math.floor(at / 30_000));
}

export function verifyTotp(secret: string, code: string) {
  const c = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  const now = Date.now();
  const expected = Buffer.from(c);
  for (const w of [-1, 0, 1]) {
    const got = Buffer.from(totpCode(secret, now + w * 30_000));
    if (got.length === expected.length && timingSafeEqual(got, expected)) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, account: string) {
  const label = encodeURIComponent(`Rank Up:${account || "competitor"}`);
  const params = new URLSearchParams({
    secret,
    issuer: "Rank Up",
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function shaSessionKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex").slice(0, 40);
}

export function parseTotpCode(raw: unknown) {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s/g, "").slice(0, 8);
}
