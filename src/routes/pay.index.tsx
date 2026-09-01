import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Crown,
  Info,
  Lock,
  Package,
  Pencil,
  ShieldCheck,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { StripeEmbed } from "@/components/rank/StripeEmbed";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { clearPayDraft, readPayDraft, savePayDraft, type PayDraft } from "@/lib/pay-draft";
import { startCheckout } from "@/lib/server/rank";
import { getCreditEconomy } from "@/lib/server/economy";
import { creditsFromUsd, DEFAULT_ECONOMY, type CreditEconomy } from "@/lib/economy";
import { formatScore, formatUsd, publicErrorMessage } from "@/lib/utils";
import { seoHead } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/pay/")({
  head: () =>
    seoHead({
      title: "Buy Credits",
      description: "Pay on Pay4Rank. Stripe confirms credits in your wallet. Spend credits later to earn Score.",
      path: "/pay",
      noindex: true,
    }),
  component: PayPage,
});

function PayPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [draft, setDraft] = useState<PayDraft | null | undefined>(undefined);
  const [eco, setEco] = useState<CreditEconomy>(DEFAULT_ECONOMY);
  const [custom, setCustom] = useState(false);
  const [customUsd, setCustomUsd] = useState("");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setDraft(readPayDraft());
    void getCreditEconomy().then(setEco).catch(() => setEco(DEFAULT_ECONOMY));
  }, []);

  const packages = useMemo(() => (eco.packages.length ? eco.packages : DEFAULT_ECONOMY.packages).slice(0, 5), [eco.packages]);
  const usd = draft?.amount ?? 10;
  const credits = creditsFromUsd(usd, eco);
  const inPackages = packages.includes(usd);

  const cancel = () => {
    clearPayDraft();
    void navigate({ to: "/" });
  };

  const restart = async (amount: number, asCustom = false) => {
    if (!draft) return;
    const nextUsd = Math.min(eco.maxUsd, Math.max(eco.minUsd, Math.round(amount)));
    if (nextUsd === draft.amount && !asCustom) {
      setCustom(false);
      return;
    }
    setSwitching(true);
    setCustom(asCustom);
    try {
      const res = await startCheckout({
        data: {
          amount: nextUsd,
          displayName: draft.displayName,
          cycleType: draft.cycleType,
        },
      });
      const next: PayDraft = {
        mode: res.mode,
        sessionId: res.sessionId,
        clientSecret: res.clientSecret,
        publishableKey: res.publishableKey,
        url: res.url,
        amount: res.amount,
        cycleType: res.cycleType,
        displayName: res.displayName,
        shortNote: res.shortNote,
      };
      savePayDraft(next);
      setDraft(next);
    } catch (e) {
      toast.error(publicErrorMessage(e, "Could not update amount."));
    } finally {
      setSwitching(false);
    }
  };

  if (isPending || draft === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Crown className="h-7 w-7 animate-pulse text-gold" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!draft) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main id="main" className="page-enter relative z-10 mx-auto w-full max-w-lg px-4 py-20 text-center">
          <div className="pay-ticket rounded-2xl p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/30">
              <Crown className="h-5 w-5 fill-gold text-gold" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-black text-fg">No checkout in progress</h1>
            <p className="mt-2 text-sm text-white/45">
              Pick an amount on Pay4Rank, then you pay here — card details go straight to Stripe.
            </p>
            <Link to="/" hash="buy" className="btn-gold mt-6 inline-flex min-h-12 items-center rounded-xl px-5 text-sm font-extrabold">
              Buy credits
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const canEmbed = draft.mode === "embedded" && draft.publishableKey && draft.clientSecret;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="page-enter relative z-10 mx-auto w-full max-w-6xl px-4 py-8 pb-24 sm:py-10 sm:pb-12">
        <button
          type="button"
          onClick={cancel}
          className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Change amount
        </button>

        <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">Secure checkout</p>
        <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-fg sm:text-5xl">Buy Credits</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Pay securely through Stripe. Credits are added to your wallet after payment confirmation and can then be
          spent to increase your Score.
        </p>

        <ol className="pay-steps mt-6" aria-label="Checkout steps">
          <li className="is-on">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#1a1408] text-[9px] font-black">1</span>
            Amount
          </li>
          <li>
            <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[9px] font-black">2</span>
            Payment
          </li>
          <li>
            <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[9px] font-black">3</span>
            Wallet
          </li>
        </ol>

        <div id="amount-packs" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {packages.map((p) => {
            const on = !custom && usd === p;
            return (
              <button
                key={p}
                type="button"
                disabled={switching}
                onClick={() => void restart(p)}
                className={`relative rounded-2xl border px-3 py-3 text-left transition ${
                  on ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(196,162,74,0.45)]" : "border-white/[0.08] bg-[#12121a] hover:border-white/16"
                }`}
              >
                {on ? (
                  <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-gold text-[#1a1408]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : null}
                <p className="font-display text-xl font-black text-fg">${p}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{formatScore(creditsFromUsd(p, eco))} Credits</p>
              </button>
            );
          })}
          {eco.customEnabled ? (
            <button
              type="button"
              disabled={switching}
              onClick={() => {
                setCustom(true);
                setCustomUsd(String(usd));
              }}
              className={`rounded-2xl border px-3 py-3 text-left ${
                custom || !inPackages ? "border-gold bg-gold/10" : "border-white/[0.08] bg-[#12121a] hover:border-white/16"
              }`}
            >
              <p className="font-display text-xl font-black text-fg">Custom</p>
              <p className="mt-0.5 text-[11px] text-white/45">Enter amount</p>
            </button>
          ) : null}
        </div>
        {custom || !inPackages ? (
          <form
            className="mt-3 flex max-w-sm items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(customUsd.replace(/[^\d.]/g, ""));
              if (!Number.isFinite(n) || n < eco.minUsd) {
                toast.error(`Minimum $${eco.minUsd}.`);
                return;
              }
              void restart(n, true);
            }}
          >
            <div className="flex h-11 flex-1 items-center rounded-xl border border-white/[0.08] bg-[#12121a] px-3">
              <span className="mr-1 text-sm text-white/35">$</span>
              <input
                value={customUsd}
                onChange={(e) => setCustomUsd(e.target.value.replace(/[^\d.]/g, "").slice(0, 8))}
                className="h-full w-full bg-transparent text-sm text-fg outline-none"
                inputMode="decimal"
                aria-label="Custom USD amount"
              />
            </div>
            <button type="submit" disabled={switching} className="btn-gold h-11 rounded-xl px-4 text-xs font-extrabold">
              Apply
            </button>
          </form>
        ) : null}

        <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
          <aside className="pay-lux overflow-hidden rounded-[24px] p-5 sm:p-6">
            <p className="flex items-center gap-2 text-[15px] font-extrabold text-fg">
              <Package className="h-4 w-4 text-gold" /> Order Summary
            </p>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white/50">Pay4Rank Credits Pack</p>
                <p className="mt-1 font-display text-5xl font-black tracking-tight text-gold-grad tabular-nums">
                  ${formatUsd(usd)}
                </p>
                <p className="mt-1 font-display text-[28px] font-black text-fg">{formatScore(credits)} Credits</p>
                <p className="mt-1 text-[12px] text-white/40">
                  $1 = {formatScore(eco.creditsPerUsd)} Credits
                </p>
              </div>
              <img
                src="/rank/coins.webp"
                alt=""
                className="pay-coin h-32 w-32 shrink-0 object-contain sm:h-40 sm:w-40"
              />
            </div>

            <dl className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm">
              <Row label="Listing as" value={draft.displayName} />
              <Row label="Package Value" value={`${formatScore(credits)} Credits`} icon={<Package className="h-3.5 w-3.5" />} />
              <Row label="Score Potential" value={`Up to ${formatScore(credits)} Score`} icon={<Zap className="h-3.5 w-3.5" />} />
              <Row label="Delivery" value="Added to wallet after Stripe confirms payment" icon={<Wallet className="h-3.5 w-3.5" />} />
              <Row label="Usage" value="Spend Credits 1:1 to gain Score" icon={<Trophy className="h-3.5 w-3.5" />} />
            </dl>

            <div className="pay-how relative mt-5 overflow-hidden rounded-2xl p-4 pr-28 sm:p-5 sm:pr-40">
              <p className="flex items-center gap-2 text-[13px] font-bold text-fg">
                <Info className="h-4 w-4 text-gold" /> How it works
              </p>
              <ol className="relative z-10 mt-3 space-y-2 text-[13px] text-white/62">
                {[
                  "Buy Credits with Stripe",
                  "Credits land in your wallet",
                  "Spend Credits to rank up",
                ].map((line, i) => (
                  <li key={line} className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-black text-[#1a1408]">
                      {i + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
              <img
                src="/rank/wallet.webp"
                alt=""
                className="pointer-events-none absolute right-0 bottom-0 h-[108px] w-[168px] object-contain sm:h-[124px] sm:w-[196px]"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <TrustCell icon={<ShieldCheck className="mx-auto h-4 w-4 text-gold" />} title="Secure payment" body="Powered by Stripe" />
              <TrustCell icon={<Lock className="mx-auto h-4 w-4 text-gold" />} title="No cash prize" body="Credits have no cash value" />
              <TrustCell icon={<Trophy className="mx-auto h-4 w-4 text-gold" />} title="Public leaderboard" body="Shows Score, not money" />
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("amount-packs")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-outline tap mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold"
            >
              <Pencil className="h-3.5 w-3.5" /> Change Package
            </button>
          </aside>

          <section className="pay-lux flex min-h-[520px] flex-col rounded-[24px] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-fg">
                <Lock className="h-4 w-4 text-gold" /> Payment
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/45">
                <Lock className="h-3 w-3" /> Encrypted · USD
              </span>
            </div>
            <p className="text-[12px] text-white/45">
              Pay4Rank Credits · {formatScore(credits)} credits
            </p>
            <p className="mt-1 font-display text-4xl font-black text-fg tabular-nums">US${formatUsd(usd)}</p>
            <p className="mt-1 text-[12px] text-white/40">
              USD {formatUsd(usd)} adds credits to your wallet. Spend credits 1:1 for Score.
            </p>

            <div className="relative mt-5 flex-1">
              {switching ? (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-black/50">
                  <p className="text-sm text-white/60">Updating checkout…</p>
                </div>
              ) : null}
              <div className="pay-stripe-frame min-h-[420px] p-2">
                {canEmbed ? (
                  <StripeEmbed
                    key={draft.clientSecret || draft.sessionId}
                    publishableKey={draft.publishableKey!}
                    clientSecret={draft.clientSecret!}
                  />
                ) : draft.url ? (
                  <div className="flex min-h-[400px] flex-col justify-end gap-4 p-4">
                    <p className="text-sm text-[#3a3a42]">
                      Continue with Stripe to add {formatScore(credits)} credits to your wallet.
                    </p>
                    <a
                      href={draft.url}
                      className="btn-gold tap flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
                    >
                      <Lock className="h-4 w-4" /> Pay ${formatUsd(usd)}
                    </a>
                  </div>
                ) : (
                  <p className="p-4 text-sm text-[#3a3a42]">Checkout is unavailable. Go back and try again.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="trust-strip mt-5 grid grid-cols-1 divide-y divide-white/[0.08] rounded-[20px] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <FootNote icon={<Check className="h-4 w-4 text-gold" />} title="Credits are added after payment confirmation" />
          <FootNote icon={<Zap className="h-4 w-4 text-gold" />} title="Wallet balance updates instantly" />
          <FootNote icon={<Trophy className="h-4 w-4 text-gold" />} title="Spend Credits to gain Score" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-2 text-[12px] text-white/40">
        {icon}
        {label}
      </span>
      <span className="max-w-[58%] text-right text-[12px] font-semibold text-fg">{value}</span>
    </div>
  );
}

function TrustCell({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/25 px-2 py-3.5">
      {icon}
      <p className="mt-1.5 text-[11px] font-bold text-fg">{title}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/42">{body}</p>
    </div>
  );
}

function FootNote({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <p className="flex items-center justify-center gap-2.5 px-4 py-4 text-center text-[12px] text-white/62">
      {icon}
      {title}
    </p>
  );
}
