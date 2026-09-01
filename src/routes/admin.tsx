import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Save, Search, Shield, Trash2 } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  adminGrantByEmail,
  adminListPayments,
  adminListUsers,
  adminRemoveEntry,
  adminResetCycle,
  adminSaveStripeKeys,
  adminSetRole,
  adminStripeSettings,
  adminUpdatePrizes,
  getLeaderboard,
  getMyAccount,
  getPrizes,
  type BoardEntry,
} from "@/lib/server/rank";
import { SceneBackground } from "@/components/rank/Background";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { toast } from "sonner";
import { formatUsd, publicErrorMessage } from "@/lib/utils";
import { matchesQuery } from "@/lib/username";
import { seoHead } from "@/lib/seo";
import { FadeSwitch, Segmented } from "@/components/rank/motion";

export const Route = createFileRoute("/admin")({
  head: () =>
    seoHead({
      title: "Admin",
      description: "Pay4Rank administration.",
      path: "/admin",
      noindex: true,
    }),
  component: AdminPage,
});

type Tab = "overview" | "users" | "prizes" | "reset" | "stripe";

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [board, setBoard] = useState<BoardEntry[]>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof adminListUsers>>>([]);
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof adminListPayments>>>([]);
  const [gold, setGold] = useState(1000);
  const [silver, setSilver] = useState(500);
  const [bronze, setBronze] = useState(250);
  const [weekly, setWeekly] = useState(100);
  const [grantEmail, setGrantEmail] = useState("");
  const [stripeInfo, setStripeInfo] = useState<Awaited<ReturnType<typeof adminStripeSettings>> | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const acc = await getMyAccount();
        setAccount(acc);
        setIsAdmin(acc.profile.isAdmin);
        setIsOwner(acc.profile.isOwner);
        if (!acc.profile.isAdmin) return;
        const [b, p, u, pay] = await Promise.all([
          getLeaderboard({ data: { cycleType: "monthly" } }),
          getPrizes(),
          adminListUsers(),
          adminListPayments(),
        ]);
        setBoard(b);
        setUsers(u);
        setPayments(pay);
        setGold(p.find((x) => x.cycleType === "monthly" && x.tier === "gold")?.amount ?? 1000);
        setSilver(p.find((x) => x.cycleType === "monthly" && x.tier === "silver")?.amount ?? 500);
        setBronze(p.find((x) => x.cycleType === "monthly" && x.tier === "bronze")?.amount ?? 250);
        setWeekly(p.find((x) => x.cycleType === "weekly")?.amount ?? 100);
        if (acc.profile.isOwner) {
          setStripeInfo(await adminStripeSettings());
        }
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [user?.id]);

  if (isPending || isAdmin === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-center">
        <div>
          <Shield className="mx-auto mb-3 h-12 w-12 text-danger/60" />
          <h1 className="text-xl font-black text-fg">Access denied</h1>
          <p className="mt-2 text-sm text-white/40">This area is only for administrators.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-gold">
            Back to rankings
          </Link>
        </div>
      </div>
    );
  }

  const filteredBoard = board.filter((e) =>
    matchesQuery(query, e.displayName, e.username, e.shortNote, e.webLink),
  );
  const filteredUsers = users.filter((u) =>
    matchesQuery(query, u.display_name, u.username, u.email, u.user_id),
  );

  const tabs: Tab[] = isOwner
    ? ["overview", "users", "prizes", "reset", "stripe"]
    : ["overview", "users", "prizes", "reset"];

  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar
        active="Admin"
        account={
          account
            ? {
                name: account.profile.displayName || user.displayName || "Admin",
                email: account.profile.email || user.primaryEmail || "",
                image: account.profile.profileImage || user.profileImageUrl,
                completeness: account.completeness,
                monthlyRank: account.monthlyRank,
                weeklyRank: account.weeklyRank,
                twoFactor: account.profile.twoFactorEnabled,
                isAdmin: true,
                isOwner,
              }
            : null
        }
      />
      <main className="page-enter relative z-10 mx-auto max-w-6xl px-4 py-8 pb-24">
        <h1 className="mb-2 flex items-center gap-2 font-display text-2xl font-black text-fg">
          <Shield className="h-5 w-5 text-gold" /> Admin
        </h1>
        <p className="mb-6 text-sm text-white/35">
          {isOwner
            ? "Owner account — only you can grant admin. Granted admins cannot remove you, grant others, or see Stripe keys."
            : "Admin access granted by the owner. You cannot grant others or change the owner."}
        </p>
        <div className="field relative mb-6">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username, name, or email"
            className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] pr-3 pl-10 text-sm text-fg outline-none focus:border-gold/40"
          />
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          className="mb-6"
          options={tabs.map((t) => ({ id: t, label: t }))}
        />

        <FadeSwitch id={tab}>
        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 font-bold text-fg">
                Monthly board
                {query.trim() ? (
                  <span className="ml-2 text-xs font-semibold text-white/35">
                    {filteredBoard.length} match{filteredBoard.length === 1 ? "" : "es"}
                  </span>
                ) : null}
              </h2>
              <div className="max-h-[520px] space-y-1 overflow-y-auto">
                {filteredBoard.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-white/35">No players match that search.</p>
                )}
                {filteredBoard.slice(0, 70).map((e) => (
                  <div key={e.id} className="lb-row flex items-center gap-3 rounded-lg px-2 py-2">
                    <span className="w-8 text-center text-xs font-bold text-white/50">{e.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">{e.displayName}</p>
                      {e.username ? <p className="truncate text-[10px] text-white/35">@{e.username}</p> : null}
                    </div>
                    <span className="text-sm font-bold text-gold">${formatUsd(e.amountPaid)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await adminRemoveEntry({ data: { id: e.id, cycleType: "monthly" } });
                          setBoard(await getLeaderboard({ data: { cycleType: "monthly" } }));
                          toast.success("Removed");
                        } catch (err) {
                          toast.error(publicErrorMessage(err, "Could not remove"));
                        }
                      }}
                      className="p-1 text-white/30 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 font-bold text-fg">Recent payments</h2>
              <div className="max-h-[520px] space-y-2 overflow-y-auto">
                {payments.length === 0 && <p className="text-sm text-white/35">No Stripe payments yet.</p>}
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{p.displayName || "Player"}</p>
                      <p className="text-[10px] text-white/30">
                        {p.cycleType} · {p.createdAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gold">${formatUsd(p.amount)}</p>
                      <p className={`text-[10px] font-bold ${p.status === "completed" ? "text-success" : "text-white/35"}`}>
                        {p.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            {isOwner && (
              <form
                className="glass-card flex flex-col gap-2 rounded-2xl p-4 sm:flex-row"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const r = await adminGrantByEmail({ data: { email: grantEmail } });
                    toast.success(r.pending ? "They'll be admin when they sign in." : "Admin granted.");
                    setGrantEmail("");
                    setUsers(await adminListUsers());
                  } catch (err) {
                    toast.error(publicErrorMessage(err, "Could not grant admin"));
                  }
                }}
              >
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value.slice(0, 254))}
                  placeholder="Grant admin by email"
                  className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
                />
                <button type="submit" className="btn-gold rounded-xl px-4 py-2.5 text-sm font-extrabold">
                  Grant admin
                </button>
              </form>
            )}
            <div className="glass-card divide-y divide-white/5 overflow-hidden rounded-2xl">
              {filteredUsers.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-white/35">No users match that search.</p>
              )}
              {filteredUsers.map((u) => (
                <div key={u.user_id} className="lb-row flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg">{u.display_name ?? "Unnamed"}</p>
                    <p className="truncate text-[11px] text-white/30">
                      {u.username ? `@${u.username} · ` : ""}
                      {u.email || u.user_id}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      u.is_owner
                        ? "bg-gold text-bg"
                        : u.is_admin
                          ? "bg-gold/20 text-gold"
                          : "bg-white/5 text-white/40"
                    }`}
                  >
                    {u.is_owner ? "owner" : u.is_admin ? "admin" : "user"}
                  </span>
                  {isOwner && !u.is_owner && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await adminSetRole({ data: { userId: u.user_id, isAdmin: !u.is_admin } });
                          setUsers(await adminListUsers());
                        } catch (err) {
                          toast.error(publicErrorMessage(err, "Not allowed"));
                        }
                      }}
                      className="btn-outline rounded-lg px-2 py-1 text-xs"
                    >
                      {u.is_admin ? "Remove admin" : "Make admin"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "prizes" && (
          <div className="glass-card max-w-lg space-y-4 rounded-2xl p-6">
            {[
              { label: "Monthly gold", v: gold, s: setGold },
              { label: "Monthly silver", v: silver, s: setSilver },
              { label: "Monthly bronze", v: bronze, s: setBronze },
              { label: "Weekly winner", v: weekly, s: setWeekly },
            ].map((f) => (
              <div key={f.label} className="field">
                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  {f.label}
                </label>
                <input
                  type="number"
                  value={f.v}
                  onChange={(e) => f.s(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={async () => {
                try {
                  await adminUpdatePrizes({
                    data: { monthlyGold: gold, monthlySilver: silver, monthlyBronze: bronze, weeklyGold: weekly },
                  });
                  toast.success("Prizes saved");
                } catch (err) {
                  toast.error(publicErrorMessage(err, "Could not save prizes"));
                }
              }}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold"
            >
              <Save className="h-4 w-4" /> Save prizes
            </button>
          </div>
        )}

        {tab === "reset" && (
          <div className="glass-card max-w-lg space-y-3 rounded-2xl p-6">
            <p className="text-sm text-white/45">Archive the current board and start a fresh cycle.</p>
            {(["monthly", "weekly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={async () => {
                  if (!confirm(`Reset ${c} cycle?`)) return;
                  try {
                    const r = await adminResetCycle({ data: { cycleType: c } });
                    toast.success(`Archived ${r.archived} entries`);
                    setBoard(await getLeaderboard({ data: { cycleType: "monthly" } }));
                  } catch (err) {
                    toast.error(publicErrorMessage(err, "Could not reset cycle"));
                  }
                }}
                className="btn-outline w-full rounded-xl py-2.5 text-sm capitalize"
              >
                Reset {c} cycle
              </button>
            ))}
          </div>
        )}

        {tab === "stripe" && isOwner && (
          <div className="glass-card max-w-lg space-y-4 rounded-2xl p-6">
            <div>
              <h2 className="font-bold text-fg">Stripe test keys</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-white/40">
                Connected: Rankup sandbox (test mode). Paste the secret key from Stripe →
                Developers → API keys. Ranks update only after Stripe confirms the charge.
                When you're ready, replace these with live keys — I'll switch the app over.
              </p>
            </div>
            {stripeInfo && (
              <p className={`text-xs font-bold ${stripeInfo.configured ? "text-success" : "text-gold"}`}>
                {stripeInfo.fromEnv
                  ? `Configured from the server environment · ${stripeInfo.livemode ? "live" : "test"} mode. Keys never leave the server.`
                  : stripeInfo.configured
                    ? `Configured · ${stripeInfo.livemode ? "live" : "test"} mode`
                    : "Not configured yet"}
              </p>
            )}
            {stripeInfo?.fromEnv ? (
              <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-[12px] text-success/90">
                Secret keys are injected by the environment. They are not stored in the browser, not shown here, and cannot be exported.
              </p>
            ) : (
              <>
            <div className="field">
              <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                Secret key
              </label>
              <input
                type="password"
                autoComplete="off"
                name="stripe-secret"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_test_… or sk_live_…"
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
              />
            </div>
            <div className="field">
              <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                Publishable key (optional)
              </label>
              <input
                type="password"
                autoComplete="off"
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_test_… or pk_live_…"
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
              />
            </div>
            <div className="field">
              <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                Webhook secret (optional)
              </label>
              <input
                type="password"
                autoComplete="off"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="whsec_…"
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
              />
              <p className="mt-1 text-[10px] text-white/30">
                Endpoint path: /api/stripe/webhook — events: checkout.session.completed
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await adminSaveStripeKeys({
                    data: {
                      secretKey: secretKey || undefined,
                      publishableKey: publishableKey || undefined,
                      webhookSecret: webhookSecret || undefined,
                    },
                  });
                  setSecretKey("");
                  setPublishableKey("");
                  setWebhookSecret("");
                  setStripeInfo(await adminStripeSettings());
                  toast.success("Stripe keys saved");
                } catch (err) {
                  toast.error(publicErrorMessage(err, "Save failed"));
                }
              }}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold"
            >
              <Save className="h-4 w-4" /> Save Stripe keys
            </button>
              </>
            )}
          </div>
        )}
        </FadeSwitch>
      </main>
      <SiteFooter />
    </div>
  );
}
