import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { AccountStatusClient } from "./AccountStatusClient";

export const dynamic = "force-dynamic";

export default function AccountStatusPage() {
  return (
    <main className="site-page">
      <SiteHeader />
      <div className="site-wrap max-w-7xl">
        <AccountStatusClient />
      </div>
      <SiteFooter />
    </main>
  );
}
