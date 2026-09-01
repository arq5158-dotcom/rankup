import { MAX_CONTRIBUTION, MIN_CONTRIBUTION, NOTE_MAX_CHARS, isStripeCheckoutUrl } from "@/lib/utils";
import type { CycleType } from "@/lib/players";

export const PAY_DRAFT_KEY = "rankup.checkout";

export type PayDraft = {
  mode: "embedded" | "hosted";
  sessionId: string;
  clientSecret: string | null;
  publishableKey: string | null;
  url: string | null;
  amount: number;
  cycleType: CycleType;
  displayName: string;
  shortNote: string | null;
};

function asCycle(v: unknown): CycleType {
  return v === "weekly" ? "weekly" : "monthly";
}

export function savePayDraft(draft: PayDraft) {
  try {
    sessionStorage.setItem(PAY_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* private mode */
  }
}

export function clearPayDraft() {
  try {
    sessionStorage.removeItem(PAY_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function readPayDraft(): PayDraft | null {
  try {
    const raw = sessionStorage.getItem(PAY_DRAFT_KEY);
    if (!raw || raw.length > 4000) return null;
    const v = JSON.parse(raw) as Partial<PayDraft>;
    const amount = Number(v.amount);
    if (!Number.isFinite(amount) || amount < MIN_CONTRIBUTION || amount > MAX_CONTRIBUTION) return null;
    if (typeof v.sessionId !== "string" || !v.sessionId.startsWith("cs_") || v.sessionId.length > 200) return null;
    const displayName = typeof v.displayName === "string" ? v.displayName.slice(0, 24) : "";
    if (displayName.length < 2) return null;
    const publishableKey =
      typeof v.publishableKey === "string" && /^pk_(test|live)_[A-Za-z0-9]+$/.test(v.publishableKey)
        ? v.publishableKey
        : null;
    const clientSecret =
      typeof v.clientSecret === "string" && v.clientSecret.startsWith("cs_") && v.clientSecret.length < 500
        ? v.clientSecret
        : null;
    const url = typeof v.url === "string" && isStripeCheckoutUrl(v.url) ? v.url : null;
    const mode = v.mode === "embedded" && clientSecret && publishableKey ? "embedded" : "hosted";
    if (mode === "hosted" && !url) return null;
    return {
      mode,
      sessionId: v.sessionId,
      clientSecret,
      publishableKey,
      url,
      amount,
      cycleType: asCycle(v.cycleType),
      displayName,
      shortNote: typeof v.shortNote === "string" ? v.shortNote.slice(0, NOTE_MAX_CHARS) : null,
    };
  } catch {
    return null;
  }
}