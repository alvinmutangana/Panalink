import { Suspense } from "react";
import { getAdminLabels } from "../../../lib/admin-i18n";
import { getSellers, requireAdmin } from "../../../lib/admin";
import { getLang } from "../../../lib/i18n";
import { shortDate } from "../../../lib/format";
import StatusBadge from "../../../components/StatusBadge";
import { Skeleton } from "../../../components/ui/skeleton";

async function Sellers() {
  await requireAdmin();
  const [a, lang, rows] = await Promise.all([
    getAdminLabels(),
    getLang(),
    getSellers(),
  ]);

  const status = (v: string) =>
    ({
      approved: { tone: "paid", text: a.stVerified },
      pending: { tone: "pending", text: a.stPending },
      rejected: { tone: "declined", text: a.stRejected },
    })[v] ?? { tone: "cancelled", text: a.stNone };

  return (
    <>
      <h1 className="text-3xl">{a.sellersTitle}</h1>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <p className="text-muted-foreground">{a.sellersEmpty}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">{a.tableCaption}</caption>
            <thead className="border-b bg-secondary/60 text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">{a.colName}</th>
                <th scope="col" className="px-4 py-3 font-medium">{a.colEmail}</th>
                <th scope="col" className="px-4 py-3 font-medium">{a.colDistrict}</th>
                <th scope="col" className="px-4 py-3 font-medium">{a.colStatus}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{a.colProducts}</th>
                <th scope="col" className="px-4 py-3 font-medium">{a.colJoined}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = status(r.verification);
                return (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <th scope="row" className="px-4 py-3 font-medium">{r.name}</th>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.district}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={st.tone} label={st.text} />
                    </td>
                    <td className="price px-4 py-3 text-right">{r.products}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {shortDate(r.createdAt, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function SellersPage() {
  return (
    <main className="container-page max-w-5xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-6 h-64 w-full rounded-xl" />
          </>
        }
      >
        <Sellers />
      </Suspense>
    </main>
  );
}
