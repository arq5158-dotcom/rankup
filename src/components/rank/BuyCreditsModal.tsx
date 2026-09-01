import { useEffect, useState } from "react";
import { Loader2, Lock, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { startCheckout } from "@/lib/server/rank";
import { getCreditEconomy } from "@/lib/server/economy";
import { savePayDraft } from "@/lib/pay-draft";
import { creditsFromUsd, DEFAULT_ECONOMY, type CreditEconomy } from "@/lib/economy";
import { formatScore, publicErrorMessage } from "@/lib/utils";
import { usePresence } from "./motion";

export function BuyCreditsModal({
  open,
  onClose,
  signedIn,
  displayName,
  stripeReady = true,
  isOwner = false,
}: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  displayName: string;
  stripeReady?: boolean;
  isOwner?: boolean;
}) {
  const navigate = useNavigate();
  const { shown, on } = usePresence(open, 220);
  const [eco, setEco] = useState<CreditEconomy>(DEFAULT_ECONOMY);
  const [usd, setUsd] = useState(10);
  const [custom, setCustom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void getCreditEconomy().then(setEco).catch(() => setEco(DEFAULT_ECONOMY));
  }, [open]);

  if (!shown) return null;

  const credits = creditsFromUsd(usd, eco);

  const buy = async () => {
    if (!signedIn) {
      navigate({ to: "/login", search: { mode: "in" } });
      return;
    }
    if (!eco.purchaseEnabled) {
      toast.error("Credit purchases are paused.");
      return;
    }
    if (usd < eco.minUsd || usd > eco.maxUsd) {
      toast.error(`Minimum $${eco.minUsd}.`);
      return;
    }
    if (!agreed) {
      toast.error("Confirm you are 18 or older and agree to the rules.");
      return;
    }
    setLoading(true);
    try {
      const res = await startCheckout({
        data: {
          amount: usd,
          displayName: displayName.slice(0, 24) || "Competitor",
          cycleType: "monthly",
        },
      });
      savePayDraft({
        mode: res.mode,
        sessionId: res.sessionId,
        clientSecret: res.clientSecret,
        publishableKey: res.publishableKey,
        url: res.url,
        amount: res.amount,
        cycleType: res.cycleType,
        displayName: res.displayName,
        shortNote: res.shortNote,
      });
      void navigate({ to: "/pay" });
    } catch (e) {
      toast.error(publicErrorMessage(e, "Checkout failed"));
      setLoading(false);
    }
  };

  return (
    <div className={`modal-layer fixed inset-0 z-[97] grid place-items-center bg-black/75 p-4 ${on ? "is-open" : ""}`}>
      <div className="modal-card glass-card w-full max-w-md rounded-2xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase">Buy credits</p>
          <button type="button" onClick={onClose} className="tap grid h-10 w-10 place-items-center rounded-full text-white/45" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="font-display text-2xl font-black text-fg">Credits wallet</h2>
        <p className="mt-1 text-sm text-white/45">
          1 USD = {formatScore(eco.creditsPerUsd)} Credits
          {eco.promoBonusPct > 0 ? ` · +${eco.promoBonusPct}% bonus` : ""}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {eco.packages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setUsd(p);
                setCustom(false);
              }}
              className={`chip tap flex flex-col items-center rounded-[12px] py-2.5 ${!custom && usd === p ? "is-on" : ""}`}
            >
              <span className="text-xs font-extrabold">${p}</span>
              <span className="text-[10px] text-white/45">{formatScore(creditsFromUsd(p, eco))}</span>
            </button>
          ))}
          {eco.customEnabled ? (
            <button type="button" onClick={() => setCustom(true)} className={`chip tap rounded-[12px] text-xs font-bold ${custom ? "is-on" : ""}`}>
              Custom
            </button>
          ) : null}
        </div>
        {custom && eco.customEnabled ? (
          <input
            type="number"
            min={eco.minUsd}
            step={1}
            value={usd}
            onChange={(e) => setUsd(Math.max(eco.minUsd, Number(e.target.value) || eco.minUsd))}
            className="mt-3 h-12 w-full rounded-xl border border-white/[0.08] bg-[#12121a] px-3 text-sm text-fg outline-none"
          />
        ) : null}
        <p className="mt-4 rounded-xl border border-gold/20 bg-gold/10 px-4 py-3 text-center">
          <span className="block text-[10px] tracking-wider text-white/45 uppercase">You receive</span>
          <span className="font-display text-3xl font-black text-gold-grad tabular-nums">{formatScore(credits)}</span>
          <span className="mt-1 block text-xs text-white/40">Credits</span>
        </p>
        {isOwner && !stripeReady ? (
          <p className="mt-3 rounded-lg border border-gold/20 bg-gold/10 px-3 py-2 text-[11px] text-gold/90">
            Add your Stripe test secret key in Admin → Stripe to enable checkout.
          </p>
        ) : null}
        <label className="mt-4 flex items-start gap-2.5 text-[11px] leading-relaxed text-white/40">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="check mt-0.5 shrink-0" />
          <span>
            I confirm I am 18 or older and agree to the{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms</Link>,{" "}
            <Link to="/rules" className="text-gold hover:underline">Platform Rules</Link>, and{" "}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        <button
          type="button"
          disabled={loading || usd < eco.minUsd || !agreed}
          onClick={() => void buy()}
          className="btn-gold tap mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          BUY {formatScore(credits)} CREDITS — ${usd}
        </button>
      </div>
    </div>
  );
}
