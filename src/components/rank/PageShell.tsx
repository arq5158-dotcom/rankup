import { Navbar, type AccountInfo } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { ReactNode } from "react";

export function PageShell({
  children,
  active,
  account,
  nav,
  wide = false,
  crumbs,
}: {
  children: ReactNode;
  active?: string;
  account?: AccountInfo | null;
  nav?: ReactNode;
  wide?: boolean;
  crumbs?: { name: string; path: string }[];
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {nav ?? <Navbar active={active} account={account} />}
      {crumbs && crumbs.length > 0 ? (
        <JsonLd data={breadcrumbJsonLd([{ name: "Pay4Rank", path: "/" }, ...crumbs])} />
      ) : null}
      <div id="main" className={`page-enter relative z-10 w-full flex-1 ${wide ? "mx-auto max-w-[1280px] px-4 sm:px-6" : "page-wrap"}`}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}