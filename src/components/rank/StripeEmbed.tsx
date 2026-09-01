import { useEffect, useRef, useState } from "react";
import type { StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { publicErrorMessage } from "@/lib/utils";

export function StripeEmbed({
  publishableKey,
  clientSecret,
}: {
  publishableKey: string;
  clientSecret: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;
    let checkout: StripeEmbeddedCheckout | null = null;
    void (async () => {
      try {
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(publishableKey);
        if (!stripe) throw new Error("Checkout is unavailable.");
        if (destroyed) return;
        checkout = await stripe.initEmbeddedCheckout({ clientSecret });
        if (destroyed) {
          checkout.destroy();
          return;
        }
        if (mountRef.current) checkout.mount(mountRef.current);
        setReady(true);
      } catch (err) {
        if (!destroyed) setError(publicErrorMessage(err, "Could not load secure checkout."));
      }
    })();
    return () => {
      destroyed = true;
      try {
        checkout?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [publishableKey, clientSecret]);

  return (
    <div className="pay-stripe relative min-h-[420px]">
      {!ready && !error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-white/40">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
          <p className="text-sm">Loading secure checkout…</p>
        </div>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}
      <div ref={mountRef} id="stripe-checkout" className={error ? "hidden" : ""} />
    </div>
  );
}
