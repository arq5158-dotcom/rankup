/**
 * Browser hardening headers. Do not set X-Frame-Options / a strict CSP —
 * the live preview and grok.com chrome must be allowed to embed the app.
 */
interface Event {
  req: { method: string; headers: Headers; url?: string };
}

export default async function securityHeadersMiddleware(
  _event: Event,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response)) return result;
  const headers = new Headers(result.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  const proto = (_event.req.headers.get("x-forwarded-proto") || "").split(",")[0].trim().toLowerCase();
  if (proto === "https") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
