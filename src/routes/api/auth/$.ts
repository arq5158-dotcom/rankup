import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { clientIp, rateLimit } from "@/lib/server/security";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: async ({ request }) => {
        const path = new URL(request.url).pathname;
        if (/sign-in|sign-up|forget-password|reset-password|change-password/i.test(path)) {
          try {
            rateLimit(`auth:${clientIp(request)}`, 25, 60_000);
          } catch {
            return new Response(JSON.stringify({ message: "Too many attempts. Try again shortly." }), {
              status: 429,
              headers: { "content-type": "application/json" },
            });
          }
        }
        return auth.handler(request);
      },
    },
  },
});
