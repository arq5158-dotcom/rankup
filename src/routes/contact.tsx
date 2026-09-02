import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageShell } from "@/components/rank/PageShell";
import { seoHead } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/server/rank";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact Support",
      description:
        "Contact Pay4Rank about rankings, credit purchases, listings, privacy, or your account. Report unsafe player links here.",
      path: "/contact",
    }),
  loader: async () => {
    try {
      return await getPublicSiteSettings();
    } catch {
      return { supportEmail: null as string | null };
    }
  },
  staleTime: 15_000,
  component: Page,
});

function Page() {
  const { supportEmail } = Route.useLoaderData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail) {
      toast.error("Support email is not listed yet.");
      return;
    }
    const subject = encodeURIComponent(`[Pay4Rank] ${topic} — ${name || "Player"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-xl">
        <p className="page-kicker">Support</p>
        <h1 className="page-title mt-1">Contact</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          For ranking, payment, listing, or privacy questions. Use “Report a link” to flag an unsafe
          player website. Include your display name and the payment receipt email if the issue is a
          ranking-credit purchase.
        </p>
        <article className="mt-4 space-y-3 text-sm leading-relaxed text-white/50">
          <p>
            Pay4Rank support can help with ranking credits, Stripe checkout, weekly or monthly
            Score, Free Spin claims, profile photos, usernames, and featured placement. We cannot
            change Google search rankings or refund a completed credit purchase except as the terms
            allow.
          </p>
          <p>
            If you are reporting a player website, include the display name or @username and why
            the link is unsafe. Adult, malware, and shortened URLs are already blocked on upload;
            we still review reports.
          </p>
        </article>

        <form onSubmit={submit} className="glass-card mt-8 space-y-4 rounded-2xl p-6">
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            >
              {["General", "Payment", "Ranking", "Listing", "Privacy", "Account", "Report a link"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold tracking-wider text-white/40 uppercase">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121a] px-3 py-2.5 text-sm text-fg outline-none focus:border-gold/40"
            />
          </div>
          <button
            type="submit"
            disabled={!supportEmail}
            className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold disabled:opacity-40"
          >
            <Mail className="h-4 w-4" /> Open email
          </button>
          <p className="text-center text-[11px] text-white/30">
            {supportEmail ? `Opens your mail app to ${supportEmail}` : "Support email is not listed."}
          </p>
        </form>

        <p className="mt-6 text-center text-[12px] text-white/35">
          See also{" "}
          <Link to="/how-it-works" className="text-gold">
            How it works
          </Link>
          ,{" "}
          <Link to="/rules" className="text-gold">
            Official rules
          </Link>
          , and{" "}
          <Link to="/privacy" className="text-gold">
            Privacy
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
