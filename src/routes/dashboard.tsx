import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Loader2, Save } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccount, updateMyProfile } from "@/lib/server/rank";
import { SceneBackground } from "@/components/rank/Background";
import { Navbar } from "@/components/rank/Navbar";
import { SiteFooter } from "@/components/rank/SiteFooter";
import { SecurityPanel } from "@/components/rank/SecurityPanel";
import { toast } from "sonner";
import { formatUsd, NOTE_MAX_CHARS, publicErrorMessage } from "@/lib/utils";
import { seoHead } from "@/lib/seo";
import { FadeSwitch, Segmented } from "@/components/rank/motion";
import { USERNAME_MAX } from "@/lib/username";

type DashTab = "profile" | "security" | "history";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: s.tab === "security" || s.tab === "history" || s.tab === "profile" ? (s.tab as DashTab) : undefined,
  }),
  head: () =>
    seoHead({
      title: "Dashboard",
      description: "Manage your Pay4Rank profile, security, and ranking-credit history.",
      path: "/dashboard",
      noindex: true,
    }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isPending } = useCurrentUserState();
  const { tab: tabParam } = Route.useSearch();
  const [tab, setTab] = useState<DashTab>(tabParam ?? "profile");
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tabParam) setTab(tabParam);
  }, [tabParam]);

  const load = async () => {
    const a = await getMyAccount();
    setAccount(a);
    setName(a.profile.displayName ?? user?.displayName ?? "");
    setHandle(a.profile.username ?? "");
    setNote(a.profile.shortNote ?? "");
    setLink(a.profile.webLink ?? "");
    setImage(a.profile.profileImage ?? user?.profileImageUrl ?? "");
  };

  useEffect(() => {
    if (!user) return;
    void load().catch(() => setAccount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const save = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        data: {
          displayName: name,
          username: handle,
          shortNote: note,
          webLink: link,
          profileImage: image,
        },
      });
      toast.success("Profile saved");
      await load();
    } catch (e) {
      toast.error(publicErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      <Navbar
        account={
          account
            ? {
                name: name || "Competitor",
                email: user.primaryEmail || "",
                image,
                completeness: account.completeness,
                monthlyRank: account.monthlyRank,
                weeklyRank: account.weeklyRank,
                twoFactor: account.profile.twoFactorEnabled,
                isAdmin: account.profile.isAdmin,
                isOwner: account.profile.isOwner,
              }
            : null
        }
      />
      <main className="page-enter relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <h1 className="font-display text-2xl font-black text-fg">Welcome{name ? `, ${name}` : ""}</h1>
        <p className="mt-1 text-sm text-white/40">Manage your profile, security, and contribution history.</p>

        {account && (
          <div className="glass-card mt-6 mb-6 rounded-2xl border border-gold/15 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 sm:h-16 sm:w-16">
                <Crown className="h-7 w-7 text-gold sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-white/40 uppercase">Your current rank</p>
                <p className="text-3xl font-black text-fg">#{account.monthlyRank ?? "—"}</p>
                <p className="text-sm font-bold text-gold">${formatUsd(account.monthlyPaid)} contributed</p>
              </div>
            </div>
          </div>
        )}

        <Segmented
          value={tab}
          onChange={setTab}
          className="mb-6"
          options={[
            { id: "profile", label: "Profile" },
            { id: "security", label: "Security" },
            { id: "history", label: "History" },
          ]}
        />

        <FadeSwitch id={tab}>
          {tab === "profile" && (
            <div className="glass-card space-y-4 rounded-2xl p-5 sm:p-6">
              {[
                { label: "Display name", value: name, set: setName, hint: "Shown large on the board", max: 24 },
                {
                  label: "Username",
                  value: handle,
                  set: setHandle,
                  hint: "Unique @handle. Letters, numbers, underscore.",
                  max: USERNAME_MAX,
                },
                { label: "Short note", value: note, set: setNote, max: NOTE_MAX_CHARS },
                { label: "Website", value: link, set: setLink, max: 300, hint: "Public https:// link. Adult, malware, and shortened URLs are blocked." },
                { label: "Profile image URL", value: image, set: setImage, max: 500 },
              ].map((f) => (
                <div key={f.label} className="field">
                  <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                    {f.label}
                  </label>
                  <input
                    value={f.value}
                    maxLength={f.max}
                    onChange={(e) => f.set(e.target.value.slice(0, f.max))}
                    className="h-12 w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 text-sm text-fg outline-none focus:border-gold/40 sm:h-auto sm:py-2.5"
                  />
                  {"hint" in f && f.hint ? <p className="mt-1 text-[11px] text-white/30">{f.hint}</p> : null}
                </div>
              ))}
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="btn-gold inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-extrabold"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          )}

          {tab === "security" && (
            <SecurityPanel
              email={account?.profile.email || user.primaryEmail || ""}
              methods={account?.signInMethods ?? []}
              twoFactorEnabled={account?.profile.twoFactorEnabled ?? false}
              onRefresh={load}
            />
          )}

          {tab === "history" && (
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              {!account || account.payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/40">No payments yet. Enter a season from the home page.</p>
              ) : (
                <div className="space-y-3">
                  {account.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#12121a] p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-fg">
                          ${formatUsd(p.amount)} — {p.cycleType}
                        </p>
                        <p className="text-xs text-white/35">{p.createdAt}</p>
                      </div>
                      <span className="rounded-lg bg-success/20 px-2 py-1 text-xs font-bold text-success">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </FadeSwitch>

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-outline rounded-xl px-4 py-2 text-sm">
            ← Leaderboard
          </Link>
          {account?.profile.isAdmin && (
            <Link to="/admin" className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold">
              Admin
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
