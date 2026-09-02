import { createFileRoute } from "@tanstack/react-router";

const BODY = "google-site-verification: googlece89cc86aa7767dd.html";

export const Route = createFileRoute("/googlece89cc86aa7767dd.html")({
  ssr: true,
  server: {
    handlers: {
      GET: async () =>
        new Response(`${BODY}\n`, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
            "x-robots-tag": "noindex",
          },
        }),
    },
  },
  component: () => BODY,
});
