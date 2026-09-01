import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Check, Loader2, X } from "lucide-react";
import { completeCheckout } from "@/lib/server/rank";
import { SceneBackground } from "@/components/rank/Background";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { seoHead } from "@/lib/seo";
import { publicErrorMessage } from "@/lib/utils";
import { clearPayDraft } from "@/lib/pay-draft";

export const Route = createFileRoute("/pay/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id.slice(0, 200) : "",
  }),
  head: () =>
    seoHead({
      title: "Payment confirmed",
      description: "Stripe confirmed your Pay4Rank ranking credits.",
      path: "/pay/success",
      noindex: true,
    }),
  component: PaySuccess,
});

function PaySuccess() {
  const { session_id: sessionId } = useSearch({ from: "/pay/success" });
  const { user, isPending } = useCurrentUserState();
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearPayDraft();
    if (isPending || !user || !sessionId) return;
    void (async () => {
      try {
        const res = await completeCheckout({ data: { sessionId } });
        setRank(res.rank);
        setState("ok");
      } catch (e) {
        setError(publicErrorMessage(e, "Could not confirm payment."));
        setState("err");
      }
    })();
  }, [user, isPending, sessionId]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar />
      <main className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="glass-card w-full rounded-2xl p-8">
          {state === "loading" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-gold" />
              <h1 className="font-display text-xl font-black text-fg">Confirming payment…</h1>
              <p className="mt-2 text-sm text-white/40">Stripe is verifying your ranking credits.</p>
            </>
          )}
          {state === "ok" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-display text-2xl font-black text-fg">You're on the board</h1>
              <p className="mt-3 font-display text-5xl font-black tabular-nums text-gold-grad">
                #{rank ?? "—"}
              </p>
              <p className="mt-2 text-sm text-white/45">Payment received. This is your live rank.</p>
            </>
          )}
          {state === "err" && (
            <>
              <X className="mx-auto mb-4 h-12 w-12 text-danger" />
              <h1 className="font-display text-xl font-black text-fg">Payment not confirmed</h1>
              <p className="mt-2 text-sm text-white/45">{error}</p>
            </>
          )}
          <Link to="/" className="btn-gold mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-extrabold">
            Back to leaderboard
          </Link>
        </div>
      </main>
      <SiteFooter compact />
    </div>
  );
}
