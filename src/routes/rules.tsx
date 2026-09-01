import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDoc } from "@/components/rank/LegalDoc";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/rules")({
  head: () =>
    seoHead({
      title: "Platform Rules",
      description:
        "Rules for Pay4Rank ranking credits, promotional listings, eligibility, and featured placement. Not a prize contest.",
      path: "/rules",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc title="Platform Rules" updated="September 1, 2026">
      <p>
        These Rules govern Pay4Rank ranking credits and public listings. They work together with the{" "}
        <Link to="/terms">Terms of Service</Link>. The leaderboard is a promotional advertising product
        — not a lottery or raffle. Optional community giveaways, when offered, are run separately and
        never require a purchase.
      </p>

      <h2>1. The product</h2>
      <p>
        Pay4Rank sells ranking credits. Each confirmed Stripe payment adds credits to your profile for
        the weekly or monthly cycle you choose. Higher confirmed credits appear higher on the public
        leaderboard. Other buyers can overtake you at any time. You are buying visibility, not a chance
        to win money.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        Open to individuals who are 18 or older, have a Pay4Rank account in good standing, and can
        legally complete a Stripe payment. Void where this kind of paid promotion is prohibited.
      </p>

      <h2>3. How to buy credits</h2>
      <p>
        Sign in, choose weekly or monthly, select an amount in USD, agree to these Rules, and complete
        Stripe Checkout. Ranking credits equal the confirmed USD amount (one dollar = one credit). An
        incomplete checkout does not charge you and does not rank you.
      </p>

      <h2>4. Cycles</h2>
      <ul>
        <li>
          <strong>Monthly.</strong> Runs from the first moment of the calendar month through the last
          moment of that month in the service clock. The top three listings receive Gold, Silver, and
          Bronze featured placement, badges, and a note in winner history.
        </li>
        <li>
          <strong>Weekly.</strong> Runs until the published Sunday reset. First place receives the Weekly
          Champion badge and featured placement for that week.
        </li>
      </ul>

      <h2>5. How position is decided</h2>
      <p>
        Position is the highest confirmed credit total in that cycle. Rank is not drawn at random and
        does not use odds. Ties are broken by the earlier confirmed Stripe payment. Reversed,
        charged-back, or fraudulent payments are removed and ranks are recomputed.
      </p>

      <h2>6. Featured placement is not a prize</h2>
      <p>
        Gold, Silver, Bronze, and Weekly Champion are display titles and extra on-platform exposure
        included with the listing product. There is no cash prize, no merchandise prize, and no prize
        purse. We do not pay winners. Featured titles may change if payments reverse or listings are
        removed for abuse.
      </p>

      <h2>7. Publicity</h2>
      <p>
        Display names, notes, ranks, credit totals, and optional website links are public on the
        leaderboard. By buying credits, you grant Pay4Rank permission to show that information.
      </p>

      <h2>8. Disqualification</h2>
      <p>
        We may remove listings that use stolen cards, bots, collusion, multiple accounts to evade
        limits, or any other manipulation. Removed purchases are not refunded except where the law
        requires.
      </p>

      <h2>9. Public website links</h2>
      <p>
        You may optionally publish an https website on the leaderboard to promote a brand, project, or
        page you are authorized to share. Links are scanned and may be refused or removed (adult
        content, malware, shorteners, private or local addresses, and other unsafe destinations).
        Pay4Rank does not endorse third-party sites.
      </p>

      <h2>10. Community giveaways (separate)</h2>
      <p>
        Pay4Rank may run optional promotional giveaways. They are not part of ranking-credit checkout
        and are not a prize for climbing the board. Where a giveaway is offered:
      </p>
      <ul>
        <li>No purchase is necessary to enter.</li>
        <li>Buying ranking credits does not increase your chance of winning.</li>
        <li>
          Each giveaway posts its own prize, eligibility, entry period, free entry method, and winner
          announcement on the <Link to="/giveaways">Giveaways</Link> page.
        </li>
        <li>18+ only. Void where prohibited.</li>
      </ul>

      <h2>11. Responsible use</h2>
      <p>
        Buy only what you can afford. Ranking credits are a promotional listing, not an investment, and
        there is no guarantee you will hold a featured position. Other participants can pass you.
      </p>
    </LegalDoc>
  );
}
