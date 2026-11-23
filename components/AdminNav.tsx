import { getAdminLabels } from "../lib/admin-i18n";
import AdminNavClient from "./AdminNavClient";

export default async function AdminNav() {
  const a = await getAdminLabels();

  return (
    <AdminNavClient
      label={a.area}
      items={[
        { href: "/admin", label: a.navOverview },
        { href: "/admin/verifications", label: a.navRequests },
        { href: "/admin/sellers", label: a.navSellers },
      ]}
    />
  );
}
