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
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { toast } from "sonner";
import { formatScore, formatUsd, publicErrorMessage } from "@/lib/utils";
import { loadAccount } from "@/lib/account-cache";
import { adminGetSpin, adminSaveSpin, type SpinSegment } from "@/lib/server/spin";
import { adminGetEconomy, adminSaveEconomy, type CreditEconomy } from "@/lib/server/economy";
import { DEFAULT_ECONOMY } from "@/lib/economy";
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

type Tab = "overview" | "users" | "prizes" | "spin" | "economy" | "reset" | "stripe";

function shrinkWheelImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Image must be under 8MB."));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 256;
      const scale = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
      const w = Math.max(1, Math.round((img.width || 1) * scale));
      const h = Math.max(1, Math.round((img.height || 1) * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      let q = 0.82;
      let data = canvas.toDataURL("image/jpeg", q);
      while (data.length > 140_000 && q > 0.4) {
        q -= 0.1;
        data = canvas.toDataURL("image/jpeg", q);
      }
      if (data.length > 175_000) reject(new Error("Image is still too large. Try a simpler graphic."));
      else resolve(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [board, setBoard] = useState<BoardEntry[]>([]);
  const [weeklyBoard, setWeeklyBoard] = useState<BoardEntry[]>([]);
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
  const [spinSegs, setSpinSegs] = useState<SpinSegment[]>([]);
  const [economy, setEconomy] = useState<CreditEconomy>(DEFAULT_ECONOMY);
  const [ecoLog, setEcoLog] = useState<{ at: string; who: string; note: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const acc = await loadAccount();
        setAccount(acc);
        setIsAdmin(acc.profile.isAdmin);
        setIsOwner(acc.profile.isOwner);
        if (!acc.profile.isAdmin) return;
        const [b, w, p, u, pay] = await Promise.all([
          getLeaderboard({ data: { cycleType: "monthly" } }),
          getLeaderboard({ data: { cycleType: "weekly" } }),
          getPrizes(),
          adminListUsers(),
          adminListPayments(),
        ]);
        setBoard(b);
        setWeeklyBoard(w);
        setUsers(u);
        setPayments(pay);
        setGold(p.find((x) => x.cycleType === "monthly" && x.tier === "gold")?.amount ?? 1000);
        setSilver(p.find((x) => x.cycleType === "monthly" && x.tier === "silver")?.amount ?? 500);
        setBronze(p.find((x) => x.cycleType === "monthly" && x.tier === "bronze")?.amount ?? 250);
        setWeekly(p.find((x) => x.cycleType === "weekly")?.amount ?? 100);
        if (acc.profile.isOwner) {
          setStripeInfo(await adminStripeSettings());
        }
        try {
          setSpinSegs((await adminGetSpin()).segments);
        } catch {
          setSpinSegs([]);
        }
        try {
          const e = await adminGetEconomy();
          setEconomy(e.economy);
          setEcoLog(e.log);
        } catch {
          /* ignore */
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
  const filteredWeeklyBoard = weeklyBoard.filter((e) =>
    matchesQuery(query, e.displayName, e.username, e.shortNote, e.webLink),
  );
  const filteredUsers = users.filter((u) =>
    matchesQuery(query, u.display_name, u.username, u.email, u.user_id),
  );

  const tabs: Tab[] = isOwner
    ? ["overview", "users", "prizes", "spin", "economy", "reset", "stripe"]
    : ["overview", "users", "prizes", "spin", "economy", "reset"];

  return (
    <div className="relative min-h-screen">
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
                    <span className="text-sm font-bold text-gold">{formatScore(e.amountPaid)} SCORE</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Remove ${e.displayName}${e.username ? ` (@${e.username})` : ""} from the monthly leaderboard?\n\nTheir account, credits, and weekly rank stay.`,
                          )
                        ) {
                          return;
                        }
                        try {
                          await adminRemoveEntry({ data: { id: e.id, cycleType: "monthly" } });
                          setBoard(await getLeaderboard({ data: { cycleType: "monthly" } }));
                          toast.success("Removed from monthly");
                        } catch (err) {
                          toast.error(publicErrorMessage(err, "Could not remove"));
                        }
                      }}
                      className="p-1 text-white/30 hover:text-danger"
                      aria-label={`Remove ${e.displayName} from monthly`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 font-bold text-fg">
                Weekly board
                {query.trim() ? (
                  <span className="ml-2 text-xs font-semibold text-white/35">
                    {filteredWeeklyBoard.length} match{filteredWeeklyBoard.length === 1 ? "" : "es"}
                  </span>
                ) : null}
              </h2>
              <div className="max-h-[520px] space-y-1 overflow-y-auto">
                {filteredWeeklyBoard.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-white/35">No players match that search.</p>
                )}
                {filteredWeeklyBoard.slice(0, 70).map((e) => (
                  <div key={e.id} className="lb-row flex items-center gap-3 rounded-lg px-2 py-2">
                    <span className="w-8 text-center text-xs font-bold text-white/50">{e.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">{e.displayName}</p>
                      {e.username ? <p className="truncate text-[10px] text-white/35">@{e.username}</p> : null}
                    </div>
                    <span className="text-sm font-bold text-gold">{formatScore(e.amountPaid)} SCORE</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Remove ${e.displayName}${e.username ? ` (@${e.username})` : ""} from the weekly leaderboard?\n\nTheir account, credits, and monthly rank stay.`,
                          )
                        ) {
                          return;
                        }
                        try {
                          await adminRemoveEntry({ data: { id: e.id, cycleType: "weekly" } });
                          setWeeklyBoard(await getLeaderboard({ data: { cycleType: "weekly" } }));
                          toast.success("Removed from weekly");
                        } catch (err) {
                          toast.error(publicErrorMessage(err, "Could not remove"));
                        }
                      }}
                      className="p-1 text-white/30 hover:text-danger"
                      aria-label={`Remove ${e.displayName} from weekly`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 lg:col-span-2">
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

        {tab === "spin" && (
          <div className="glass-card space-y-4 rounded-2xl p-6">
            <h2 className="font-bold text-fg">Free Spin — 6 portions</h2>
            <p className="text-sm text-white/40">Images and score rewards appear on the public wheel. Disabled slices are never drawn as winners.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {spinSegs.map((s, i) => (
                <div key={s.slot} className="rounded-xl border border-white/[0.06] bg-[#12121a] p-3">
                  <p className="text-[10px] font-bold tracking-wider text-gold uppercase">Portion {s.slot}</p>
                  <input
                    value={s.label}
                    onChange={(e) =>
                      setSpinSegs((rows) => rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value.slice(0, 24) } : r)))
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-white/[0.08] bg-[#0c0c12] px-2 text-sm text-fg"
                    placeholder="Label"
                  />
                  <input
                    type="number"
                    value={s.scoreReward}
                    onChange={(e) =>
                      setSpinSegs((rows) =>
                        rows.map((r, idx) => (idx === i ? { ...r, scoreReward: Number(e.target.value) || 0 } : r)),
                      )
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-white/[0.08] bg-[#0c0c12] px-2 text-sm text-fg"
                    placeholder="Score reward"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-white/50">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) =>
                        setSpinSegs((rows) => rows.map((r, idx) => (idx === i ? { ...r, enabled: e.target.checked } : r)))
                      }
                    />
                    Enabled
                  </label>
                  {s.image ? (
                    <img src={s.image} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover ring-1 ring-white/10" />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full text-xs text-white/40"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      void shrinkWheelImage(f)
                        .then((url) => setSpinSegs((rows) => rows.map((r, idx) => (idx === i ? { ...r, image: url } : r))))
                        .catch((err) => toast.error(publicErrorMessage(err, "Could not use that image.")));
                    }}
                  />
                  {s.image ? (
                    <button
                      type="button"
                      className="mt-1 text-[11px] text-danger"
                      onClick={() => setSpinSegs((rows) => rows.map((r, idx) => (idx === i ? { ...r, image: null } : r)))}
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={async () => {
                if (spinSegs.length !== 6) {
                  toast.error("Wheel portions did not load. Refresh the page and try again.");
                  return;
                }
                try {
                  const res = await adminSaveSpin({ data: { segments: spinSegs } });
                  setSpinSegs(res.segments);
                  toast.success("Wheel saved");
                } catch (err) {
                  toast.error(publicErrorMessage(err, "Could not save wheel"));
                }
              }}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold"
            >
              <Save className="h-4 w-4" /> Save wheel
            </button>
          </div>
        )}

        {tab === "economy" && (
          <div className="glass-card max-w-xl space-y-4 rounded-2xl p-6">
            <h2 className="font-bold text-fg">Credit economy</h2>
            <p className="text-sm text-white/40">Changes apply to future purchases only. Existing wallets stay the same.</p>
            {[
              { label: "Credits per $1 USD", v: economy.creditsPerUsd, k: "creditsPerUsd" as const },
              { label: "Minimum purchase USD", v: economy.minUsd, k: "minUsd" as const },
              { label: "Maximum purchase USD", v: economy.maxUsd, k: "maxUsd" as const },
              { label: "Promo bonus %", v: economy.promoBonusPct, k: "promoBonusPct" as const },
            ].map((f) => (
              <div key={f.k} className="field">
                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">{f.label}</label>
                <input
                  type="number"
                  value={f.v}
                  onChange={(e) => setEconomy((prev) => ({ ...prev, [f.k]: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg"
                />
              </div>
            ))}
            <div className="field">
              <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">Preset packages (USD, comma)</label>
              <input
                value={economy.packages.join(",")}
                onChange={(e) =>
                  setEconomy((prev) => ({
                    ...prev,
                    packages: e.target.value.split(",").map((n) => Number(n.trim())).filter((n) => n > 0),
                  }))
                }
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/50">
              <input type="checkbox" checked={economy.customEnabled} onChange={(e) => setEconomy((p) => ({ ...p, customEnabled: e.target.checked }))} />
              Custom amount enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-white/50">
              <input type="checkbox" checked={economy.purchaseEnabled} onChange={(e) => setEconomy((p) => ({ ...p, purchaseEnabled: e.target.checked }))} />
              Credit purchases available
            </label>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await adminSaveEconomy({ data: economy });
                  setEconomy(res.economy);
                  setEcoLog(res.log);
                  toast.success("Economy saved — future purchases only");
                } catch (err) {
                  toast.error(publicErrorMessage(err, "Could not save economy"));
                }
              }}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold"
            >
              <Save className="h-4 w-4" /> Save economy
            </button>
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-wider text-white/40 uppercase">Change log</p>
              <ul className="space-y-1 text-[11px] text-white/40">
                {ecoLog.slice(0, 12).map((row, i) => (
                  <li key={i}>
                    {row.at.slice(0, 16).replace("T", " ")} — {row.note}
                  </li>
                ))}
              </ul>
            </div>
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
