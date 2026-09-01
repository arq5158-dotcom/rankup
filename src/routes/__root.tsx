import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { CookieBanner } from "@/components/rank/CookieBanner";
import { UsernameGate } from "@/components/rank/UsernameGate";
import { TwoFactorGate } from "@/components/rank/TwoFactorGate";
import { NoteIslandRoot } from "@/components/rank/NoteIsland";
import { SiteJsonLd } from "@/components/rank/JsonLd";
import { MobileDock } from "@/components/rank/MobileDock";
import { SceneBackground } from "@/components/rank/Background";
import { NavProgress } from "@/components/rank/motion";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: `${SITE_NAME} — ${SITE_TAGLINE}` },
      { name: "theme-color", content: "#08080C" },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "color-scheme", content: "dark" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preload", href: "/rank/mountains.webp", as: "image", type: "image/webp" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&family=Oswald:wght@600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased has-dock">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PreviewHostBridge />
        <SceneBackground />
        <AuthProvider>
          <NoteIslandRoot>
          <NavProgress />
          <SiteJsonLd />
          <Outlet />
          <UsernameGate />
          <TwoFactorGate />
          <CookieBanner />
          <MobileDock />
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#0f0f14",
                border: "1px solid rgba(212,180,69,0.25)",
                color: "#F0EDE5",
              },
            }}
          />
          </NoteIslandRoot>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
