import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/googlece89cc86aa7767dd.html")({
  server: {
    handlers: {
      GET: async () =>
        new Response("google-site-verification: googlece89cc86aa7767dd.html\n", {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        }),
    },
  },
});
