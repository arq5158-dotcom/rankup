import { ExternalLink } from "lucide-react";
import { cn, hostFromUrl, isUrlSafe } from "@/lib/utils";

export function SafeWebLink({
  href,
  className,
  compact = false,
}: {
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!href || !isUrlSafe(href)) return null;
  const host = hostFromUrl(href);
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      referrerPolicy="no-referrer"
      title={`Opens ${host} — third-party site, not affiliated with Pay4Rank`}
      aria-label={`Visit ${host} (opens in a new tab, third-party site)`}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 text-gold/70 hover:text-gold",
        compact ? "min-h-0 max-w-full flex-nowrap text-[9px] leading-none font-medium" : "py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      <ExternalLink className={cn("shrink-0 opacity-70", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
      <span className="min-w-0 truncate">{host}</span>
    </a>
  );
}
