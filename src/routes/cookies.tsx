import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({
  head: () =>
    seoHead({
      title: "Cookie Policy",
      description:
        "Rank Up uses essential cookies for sign-in, security, and Stripe checkout. No advertising cookies. How to manage consent.",
      path: "/cookies",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Cookie Policy" updated="September 1, 2026">
      <p>
        This policy describes the cookies and similar storage Rank Up uses. It should be read with the{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>What is a cookie?</h2>
      <p>
        A cookie is a small file stored on your device. We also use browser local storage for the same
        kinds of essential jobs — keeping you signed in and remembering that you saw this notice.
      </p>

      <h2>Cookies we use</h2>
      <ul>
        <li>
          <strong>Session / authentication (essential).</strong> Keeps you signed in as you move
          between pages and return to Rank Up. Without this cookie, login cannot work.
        </li>
        <li>
          <strong>Cookie consent (essential).</strong> Stores that you acknowledged this notice so we
          do not show the banner on every visit. Saved in local storage as{" "}
          <code>rankup-cookie-consent</code>.
        </li>
        <li>
          <strong>Stripe (third party, checkout only).</strong> When you pay, Stripe may set cookies on
          its checkout pages to complete the payment securely and prevent fraud. Those cookies are
          governed by Stripe’s policies, not ours.
        </li>
      </ul>

      <h2>What we do not use</h2>
      <p>
        Rank Up does not set advertising cookies, does not run a third-party ad network, and does not
        sell cookie data. We do not currently use optional analytics cookies.
      </p>

      <h2>How long they last</h2>
      <p>
        Session cookies last until you sign out or the session expires. Consent storage remains until
        you clear site data. Stripe cookies follow Stripe’s retention on their domain.
      </p>

      <h2>How to control cookies</h2>
      <p>
        You can delete cookies and site data in your browser settings. Blocking all cookies will
        prevent sign-in and may break checkout. Essential cookies are required to operate the service;
        there is no “reject essential” option because the product cannot function without them.
      </p>

      <h2>Updates</h2>
      <p>
        If we add non-essential cookies later, we will update this policy and ask for a fresh choice
        where the law requires it.
      </p>
    </LegalDoc>
  );
}
