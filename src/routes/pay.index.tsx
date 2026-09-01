import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Lock, ShieldCheck, Trophy } from "lucide-react";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { StripeEmbed } from "@/components/rank/StripeEmbed";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { clearPayDraft, readPayDraft, type PayDraft } from "@/lib/pay-draft";
import { formatUsd } from "@/lib/utils";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/pay/")({
  head: () =>
    seoHead({
      title: "Secure checkout",
      description: "Pay on Pay4Rank. Stripe confirms your ranking credits, then your live rank updates.",
      path: "/pay",
      noindex: true,
    }),
  component: PayPage,
});

function PayPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [draft, setDraft] = useState<PayDraft | null | undefined>(undefined);

  useEffect(() => {
    setDraft(readPayDraft());
  }, []);

  const cancel = () => {
    clearPayDraft();
    void navigate({ to: "/" });
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
            <Link to="/" className="btn-gold mt-6 inline-flex min-h-12 items-center rounded-xl px-5 text-sm font-extrabold">
              Back to leaderboard
            </Link>
          </div>
        </main>
        <SiteFooter compact />
      </div>
    );
  }

  const cycleLabel = draft.cycleType === "weekly" ? "Weekly spotlight" : "Monthly board";
  const canEmbed = draft.mode === "embedded" && draft.publishableKey && draft.clientSecret;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="page-enter relative z-10 mx-auto w-full max-w-6xl px-4 py-8 pb-24 sm:py-12 sm:pb-12">
        <button
          type="button"
          onClick={cancel}
          className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Change amount
        </button>

        <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">Secure checkout</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-fg sm:text-4xl">
          Confirm your rank
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
          Pay on Pay4Rank. Card details never touch our servers. Your live rank updates only after Stripe
          confirms the charge.
        </p>

        <ol className="pay-steps mt-6" aria-label="Checkout steps">
          <li className="is-done">
            <Check className="h-3 w-3" /> Amount
          </li>
          <li className="is-on">
            <Lock className="h-3 w-3" /> Pay
          </li>
          <li>
            <Trophy className="h-3 w-3" /> Live rank
          </li>
        </ol>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <aside className="pay-ticket overflow-hidden rounded-2xl">
            <div className="px-5 py-5 sm:px-6">
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-gold uppercase">
                <Crown className="h-3.5 w-3.5 fill-gold" /> Pay4Rank
              </p>
              <p className="mt-4 font-display text-5xl font-black tracking-tight text-gold-grad tabular-nums">
                ${formatUsd(draft.amount)}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/50">
                <span className="pay-usd">USD only</span>
                <span>ranking credits</span>
              </p>
            </div>
            <div className="pay-perf" />
            <div className="space-y-3 px-5 py-4 text-sm sm:px-6">
              <Row label="Cycle" value={cycleLabel} />
              <Row label="Listing as" value={draft.displayName} />
              {draft.shortNote ? <Row label="Note" value={draft.shortNote} /> : null}
            </div>
            <div className="mx-5 mb-5 rounded-xl border border-white/[0.06] bg-[#12121a] px-4 py-3 sm:mx-6">
              <p className="flex items-start gap-2 text-[12px] leading-relaxed text-white/45">
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Higher confirmed credits rank higher. Ties go to the earlier payment. Ranking credits are
                non-refundable after Stripe confirms. This is visibility, not a cash prize.
              </p>
            </div>
          </aside>

          <section className="glass-card flex h-full flex-col rounded-2xl p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold tracking-[0.12em] text-fg uppercase">Payment</h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/40">
                <Lock className="h-3 w-3" /> Encrypted · USD
              </span>
            </div>

            {canEmbed ? (
              <StripeEmbed publishableKey={draft.publishableKey!} clientSecret={draft.clientSecret!} />
            ) : draft.url ? (
              <div className="flex flex-1 flex-col justify-center space-y-4">
                <p className="text-sm leading-relaxed text-white/50">
                  Continue to Stripe to finish this ${formatUsd(draft.amount)} USD ranking-credit purchase. You return
                  here the moment the charge succeeds.
                </p>
                <a
                  href={draft.url}
                  className="btn-gold tap flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold"
                >
                  <Lock className="h-4 w-4" /> Pay ${formatUsd(draft.amount)} USD
                </a>
              </div>
            ) : (
              <p className="text-sm text-white/45">Checkout is unavailable. Go back and try again.</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <p className="flex items-center gap-1.5 text-[11px] text-white/35">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Powered by Stripe. Pay4Rank never stores your card.
              </p>
              <button type="button" className="min-h-11 text-[12px] text-white/40 hover:text-fg" onClick={cancel}>
                Cancel
              </button>
            </div>
            <CardMarks />
          </section>
        </div>
      </main>
      <SiteFooter compact />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] font-semibold tracking-wider text-white/35 uppercase">{label}</span>
      <span className="max-w-[62%] text-right font-semibold text-fg">{value}</span>
    </div>
  );
}

function CardMarks() {
  return (
    <ul className="pay-marks mt-4" aria-label="Accepted cards">
      <li>Visa</li>
      <li>Mastercard</li>
      <li>Amex</li>
      <li>Discover</li>
    </ul>
  );
}
