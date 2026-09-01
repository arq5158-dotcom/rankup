import Stripe from "stripe";
import { getRequest } from "@tanstack/react-start/server";
import type { Sql } from "@/lib/db";
import { isAllowedHost } from "./security";

if (typeof document !== "undefined") {
  throw new Error("Stripe secrets are server-only.");
}

const SECRET_KEYS = ["STRIPE_SECRET_KEY", "STRIPE_API_KEY"] as const;
const PUBLISHABLE_KEYS = ["STRIPE_PUBLISHABLE_KEY", "STRIPE_PUBLIC_KEY"] as const;
const WEBHOOK_KEYS = ["STRIPE_WEBHOOK_SECRET"] as const;

function envFirst(names: readonly string[]) {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return null;
}

export function stripeSecretFromEnv() {
  return envFirst(SECRET_KEYS);
}

export function stripePublishableFromEnv() {
  return envFirst(PUBLISHABLE_KEYS);
}

export function stripeWebhookFromEnv() {
  return envFirst(WEBHOOK_KEYS);
}

export async function getConfigValue(sql: Sql, key: string) {
  const rows = await sql<{ value: string }>`select value from config where key = ${key}`;
  return rows[0]?.value?.trim() || null;
}

export async function setConfigValue(sql: Sql, key: string, value: string) {
  await sql`
    insert into config (key, value) values (${key}, ${value})
    on conflict (key) do update set value = ${value}
  `;
}

export async function getStripeSecret(sql: Sql) {
  return stripeSecretFromEnv() || (await getConfigValue(sql, "stripeSecretKey"));
}

export async function getStripePublishable(sql: Sql) {
  return stripePublishableFromEnv() || (await getConfigValue(sql, "stripePublishableKey"));
}

export async function getStripeWebhookSecret(sql: Sql) {
  return stripeWebhookFromEnv() || (await getConfigValue(sql, "stripeWebhookSecret"));
}

export async function stripeIsConfigured(sql: Sql) {
  return Boolean(await getStripeSecret(sql));
}

export function maskStripeKey(v: string | null) {
  if (!v) return "";
  if (v.startsWith("sk_live")) return "sk_live_••••";
  if (v.startsWith("sk_test")) return "sk_test_••••";
  if (v.startsWith("rk_live")) return "rk_live_••••";
  if (v.startsWith("rk_test")) return "rk_test_••••";
  if (v.startsWith("pk_live")) return "pk_live_••••";
  if (v.startsWith("pk_test")) return "pk_test_••••";
  if (v.startsWith("whsec")) return "whsec_••••";
  return "••••";
}

export function redactStripeError(err: unknown, fallback = "Payment failed") {
  const msg = err instanceof Error ? err.message : fallback;
  if (/invalid api key|sk_live|sk_test|rk_live|rk_test|whsec_|pk_test|pk_live|api.?key/i.test(msg)) {
    return "Payment processor is misconfigured. Try again shortly.";
  }
  if (/not configured/i.test(msg)) return msg;
  if (msg.length > 160) return fallback;
  return msg || fallback;
}

export async function getStripe(sql: Sql) {
  const secret = await getStripeSecret(sql);
  if (!secret) {
    throw new Error("Stripe is not configured. The owner must add a secret key in Admin → Stripe.");
  }
  return new Stripe(secret);
}

export function getAppOrigin() {
  const envUrl = process.env.BETTER_AUTH_URL?.trim();
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      /* fall through */
    }
  }
  const request = getRequest();
  if (!request) return "http://127.0.0.1:8080";
  const forwarded = (request.headers.get("x-forwarded-host") || "").split(",")[0].trim();
  const hostHeader = (request.headers.get("host") || "").split(",")[0].trim();
  const host = isAllowedHost(forwarded) ? forwarded : isAllowedHost(hostHeader) ? hostHeader : "127.0.0.1:8080";
  const rawProto = (request.headers.get("x-forwarded-proto") || "").split(",")[0].trim().toLowerCase();
  const proto =
    rawProto === "https" || rawProto === "http"
      ? rawProto
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";
  return `${proto}://${host}`;
}

export type CheckoutMeta = {
  userId: string;
  cycleType: "monthly" | "weekly";
  displayName: string;
  shortNote: string;
  webLink: string;
  amount: string;
  paymentId: string;
};

export async function createRankCheckoutSession(
  sql: Sql,
  opts: {
    amountCents: number;
    customerEmail?: string | null;
    meta: CheckoutMeta;
    embedded: boolean;
  },
) {
  const stripe = await getStripe(sql);
  const origin = getAppOrigin();
  const dollars = (opts.amountCents / 100).toFixed(2);
  const base = {
    mode: "payment" as const,
    locale: "en" as const,
    currency: "usd",
    customer_email: opts.customerEmail || undefined,
    client_reference_id: opts.meta.userId,
    metadata: opts.meta,
    adaptive_pricing: { enabled: false as const },
    branding_settings: {
      background_color: "#08080c",
      button_color: "#d4b445",
      border_style: "rounded" as const,
      display_name: "Pay4Rank",
      font_family: "inter" as const,
    },
    custom_text: {
      submit: { message: "Credits are added to your wallet after Stripe confirms payment. Spend credits to earn Score and climb." },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Pay4Rank credits · ${Math.round(opts.amountCents)} credits`,
            description: `USD ${dollars} adds ${Math.round(opts.amountCents).toLocaleString()} credits to your wallet`,
          },
          unit_amount: opts.amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      description: `Pay4Rank ${opts.meta.cycleType} ranking credits · $${dollars}`,
      metadata: opts.meta,
    },
  };

  const idem = `rankup-pay-${opts.embedded ? "emb" : "host"}-${opts.meta.paymentId}`;

  if (opts.embedded) {
    const session = await stripe.checkout.sessions.create(
      {
        ...base,
        ui_mode: "embedded_page",
        redirect_on_completion: "always",
        return_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      },
      { idempotencyKey: idem },
    );
    if (!session.client_secret) throw new Error("Checkout is unavailable.");
    return {
      id: session.id,
      clientSecret: session.client_secret,
      url: null as string | null,
      embedded: true as const,
    };
  }

  const session = await stripe.checkout.sessions.create(
    {
      ...base,
      ui_mode: "hosted_page",
      submit_type: "pay",
      success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay/cancel`,
    },
    { idempotencyKey: idem },
  );
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  if (!/^https:\/\/(checkout|pay)\.stripe\.com\//i.test(session.url)) {
    throw new Error("Checkout is unavailable.");
  }
  return {
    id: session.id,
    clientSecret: null as string | null,
    url: session.url,
    embedded: false as const,
  };
}

export async function retrieveCheckoutSession(sql: Sql, sessionId: string) {
  if (sessionId.length > 200 || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Invalid checkout session.");
  }
  const stripe = await getStripe(sql);
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function parseStripeWebhook(sql: Sql, rawBody: string, signature: string | null) {
  const secret = await getStripeWebhookSecret(sql);
  if (!secret) throw new Error("Stripe webhook secret is not configured.");
  if (!signature) throw new Error("Missing Stripe-Signature header.");
  if (signature.length > 500) throw new Error("Missing Stripe-Signature header.");
  const stripe = await getStripe(sql);
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
