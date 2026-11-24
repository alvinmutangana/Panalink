import { getAdminLabels } from "../lib/admin-i18n";
import { getAdminListingsLabels } from "../lib/admin-listings-i18n";
import { getDisputeLabels } from "../lib/dispute-i18n";
import AdminNavClient from "./AdminNavClient";

export default async function AdminNav() {
  const [a, al, dp] = await Promise.all([
    getAdminLabels(),
    getAdminListingsLabels(),
    getDisputeLabels(),
  ]);

  return (
    <AdminNavClient
      label={a.area}
      items={[
        { href: "/admin", label: a.navOverview },
        { href: "/admin/verifications", label: a.navRequests },
        { href: "/admin/sellers", label: a.navSellers },
        { href: "/admin/listings", label: al.nav },
        { href: "/admin/disputes", label: dp.navDisputes },
      ]}
    />
  );
}
