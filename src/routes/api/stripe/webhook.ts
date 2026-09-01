import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { parseStripeWebhook } from "@/lib/server/stripe";
import { fulfillPaidSession } from "@/lib/server/rank";
import { clientIp, rateLimitHit } from "@/lib/server/security";

const MAX_BODY = 64_000;

function reject(status: number) {
  return new Response(JSON.stringify({ error: "invalid" }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const declared = Number(request.headers.get("content-length") || 0);
        if (Number.isFinite(declared) && declared > MAX_BODY) return reject(413);
        const raw = await request.text();
        if (raw.length > MAX_BODY) return reject(413);
        if (rateLimitHit(`stripewh:${clientIp(request)}`, 60, 60_000)) return reject(429);
        try {
          const sql = await getSql();
          const event = await parseStripeWebhook(sql, raw, request.headers.get("stripe-signature"));
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            const session = event.data.object as {
              id: string;
              payment_status?: string | null;
              status?: string | null;
              amount_total?: number | null;
              currency?: string | null;
              payment_intent?: string | { id: string } | null;
              metadata?: Record<string, string> | null;
            };
            await fulfillPaidSession(session);
          }
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch {
          return reject(400);
        }
      },
    },
  },
});
