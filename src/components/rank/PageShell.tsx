import { SceneBackground } from "./Background";
import { Navbar, type AccountInfo } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

export function PageShell({
  children,
  active,
  account,
  nav,
}: {
  children: React.ReactNode;
  active?: string;
  account?: AccountInfo | null;
  nav?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <SceneBackground />
      {nav ?? <Navbar active={active} account={account} />}
      <div id="main" className="page-enter">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
