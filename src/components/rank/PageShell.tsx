import { Navbar, type AccountInfo } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import type { ReactNode } from "react";

export function PageShell({
  children,
  active,
  account,
  nav,
  wide = false,
}: {
  children: ReactNode;
  active?: string;
  account?: AccountInfo | null;
  nav?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {nav ?? <Navbar active={active} account={account} />}
      <div id="main" className={`page-enter relative z-10 w-full flex-1 ${wide ? "mx-auto max-w-[1280px] px-4 sm:px-6" : "page-wrap"}`}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}