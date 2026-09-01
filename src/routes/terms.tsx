import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Service",
      description:
        "Terms for using Pay4Rank: accounts, Stripe ranking credits, live promotional listings, and acceptable use.",
      path: "/terms",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Terms of Service" updated="September 1, 2026">
      <p>
        These Terms of Service (“Terms”) are an agreement between you and Pay4Rank for use of the
        website, accounts, and promotional leaderboard. By creating an account or buying ranking
        credits, you agree to these Terms, the <Link to="/rules">Platform Rules</Link>, the{" "}
        <Link to="/privacy">Privacy Policy</Link>, and the <Link to="/cookies">Cookie Policy</Link>.
      </p>

      <h2>1. The service</h2>
      <p>
        Pay4Rank is a paid promotional leaderboard. You purchase credits through Stripe. Spending
        credits increases your Score and visibility for your public profile, brand, project, or approved
        website. Live rank is determined by Score, not by chance and not by dollars sitting in a wallet.
        Featured Gold, Silver, Bronze, and Weekly Champion titles are extra on-platform exposure — not
        cash or material prizes. Pay4Rank is not a lottery, raffle, casino, sweepstakes, or prize contest.
        The service is void where prohibited.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally able to enter a binding contract and a payment
        agreement. We may refuse, suspend, or close accounts that fail eligibility or these Terms.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for your login credentials and for activity on your account. Display names,
        notes, and profile images must not impersonate others, infringe rights, or include unlawful or
        abusive content. Website links must be https destinations you are authorized to share; they are
        reviewed automatically and may be refused or removed. Pay4Rank does not endorse third-party sites.
      </p>

      <h2>4. Ranking credits and payments</h2>
      <ul>
        <li>All credit purchases are processed by Stripe Checkout. Stripe does not sell Score.</li>
        <li>Credits are added only after Stripe confirms a successful payment.</li>
        <li>Cancelled or failed checkouts do not charge you and do not add credits.</li>
        <li>Rank updates when you spend credits for Score or claim a Free Spin Score reward.</li>
        <li>
          Completed purchases are generally <strong>non-refundable</strong>, except where Stripe or the
          law requires otherwise.
        </li>
        <li>You authorize Stripe to charge the selected amount plus any stated processing costs.</li>
        <li>Credits stay in your wallet until you spend them. Credits never reset with weekly or monthly boards.</li>
      </ul>

      <h2>5. Rankings</h2>
      <p>
        Rank is ordered by Score on the active weekly and monthly boards. Spending credits adds the same
        Score to both. Ties are broken by the earlier Score gain. We may correct rankings if a payment is
        reversed, flagged as fraud, or recorded in error. Other players can overtake you at any time.
      </p>

      <h2>6. Featured placement</h2>
      <p>
        Top listings may receive badges, featured modules, special profile styling, and a mention in the
        Hall of Fame. These are part of the promotional listing. They are not cash prizes.
      </p>

      <h2>7. Community giveaways</h2>
      <p>
        From time to time we may offer a separate community giveaway (for example gift cards, merch, or
        partner products). Giveaways are not sold through Stripe ranking credits. No purchase is
        necessary to enter a giveaway we run. Purchasing ranking credits does not improve giveaway odds.
        Official rules for each promotion will be posted on the <Link to="/giveaways">Giveaways</Link>{" "}
        page. 18+ only. Void where prohibited.
      </p>

      <h2>8. Acceptable use</h2>
      <p>You may not:</p>
      <ul>
        <li>Use stolen payment methods or attempt to reverse legitimate charges in bad faith</li>
        <li>Manipulate rankings with fraudulent, automated, or collusive payments</li>
        <li>Harass other users or post illegal, hateful, or pornographic profile content</li>
        <li>Probe, scrape, or disrupt the service beyond ordinary use</li>
        <li>Describe Pay4Rank as a lottery, casino, raffle, or cash-prize contest</li>
      </ul>

      <h2>9. Intellectual property</h2>
      <p>
        Pay4Rank branding, design, and software are owned by us or our licensors. You keep rights to
        content you submit, and you grant us a license to display it on the leaderboard and in related
        promotional materials for the service.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        The service is provided “as is.” We do not warrant uninterrupted uptime, that rankings will be
        free of delay, or that you will hold any particular position. Visibility depends on other
        buyers. To the fullest extent allowed by law, we disclaim implied warranties of merchantability,
        fitness, and non-infringement.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, Pay4Rank is not liable for indirect, incidental, special,
        consequential, or punitive damages, or for lost profits. Our total liability for any claim
        relating to the service is limited to the amount you paid for ranking credits in the 90 days
        before the claim, or one hundred US dollars, whichever is greater.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You will defend and indemnify Pay4Rank against claims arising from your content, your purchases,
        or your breach of these Terms.
      </p>

      <h2>13. Changes and termination</h2>
      <p>
        We may change the Terms or the service. Material changes will be reflected by the “Last
        updated” date. We may suspend or terminate access for violations, fraud risk, or if we shut
        down a cycle or the service.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms: <Link to="/contact">Contact</Link>.
      </p>

      <h2>15. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to the operator of Pay4Rank, without regard to
        conflict-of-law rules. If a provision is unenforceable, the rest remain in effect. You may have
        additional rights that these Terms cannot waive.
      </p>
    </LegalDoc>
  );
}
