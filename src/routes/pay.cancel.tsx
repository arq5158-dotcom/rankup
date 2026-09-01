import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { SceneBackground } from "@/components/rank/Background";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/pay/cancel")({
  head: () =>
    seoHead({
      title: "Payment cancelled",
      description: "Your Pay4Rank checkout was cancelled. No charge was made.",
      path: "/pay/cancel",
      noindex: true,
    }),
  component: PayCancel,
});

function PayCancel() {
  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar />
      <main className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="glass-card w-full rounded-2xl p-8">
          <X className="mx-auto mb-4 h-12 w-12 text-white/30" />
          <h1 className="font-display text-xl font-black text-fg">Payment cancelled</h1>
          <p className="mt-2 text-sm text-white/45">
            No charge was made. You can buy ranking credits whenever you're ready.
          </p>
          <Link to="/" className="btn-gold mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-extrabold">
            Back to leaderboard
          </Link>
        </div>
      </main>
      <SiteFooter compact />
    </div>
  );
}
