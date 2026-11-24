import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../../db";
import { disputes, listings, orders, user } from "../../../db/schema";
import { requireAdmin } from "../../../lib/admin";
import { getDisputeLabels } from "../../../lib/dispute-i18n";
import { getLang } from "../../../lib/i18n";
import { control, label } from "../../../lib/ui";
import { shortDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { resolveDispute } from "./actions";

const buyer = alias(user, "buyer");
const seller = alias(user, "seller");
const raiser = alias(user, "raiser");

async function Disputes() {
  await requireAdmin();
  const [dp, lang, rows] = await Promise.all([
    getDisputeLabels(),
    getLang(),
    db
      .select({
        id: disputes.id,
        status: disputes.status,
        reason: disputes.reason,
        resolution: disputes.resolution,
        createdAt: disputes.createdAt,
        total: orders.total,
        listingTitle: listings.title,
        buyerName: buyer.name,
        sellerName: seller.name,
        raisedByName: raiser.name,
      })
      .from(disputes)
      .innerJoin(orders, eq(orders.id, disputes.orderId))
      .innerJoin(listings, eq(listings.id, orders.listingId))
      .innerJoin(buyer, eq(buyer.id, orders.buyerId))
      .innerJoin(seller, eq(seller.id, orders.sellerId))
      .innerJoin(raiser, eq(raiser.id, disputes.raisedBy))
      .orderBy(desc(disputes.createdAt))
      .limit(100),
  ]);

  const open = rows.filter((r) => r.status === "open");
  const resolved = rows.filter((r) => r.status !== "open");

  return (
    <>
      <h1 className="text-3xl">{dp.adminTitle}</h1>
      <p className="mt-2 text-muted-foreground">{dp.adminIntro}</p>

      <section className="mt-8" aria-labelledby="open-heading">
        <h2 id="open-heading" className="text-xl">
          {dp.openSection} ({open.length})
        </h2>

        {open.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            {dp.emptyOpen}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {open.map((r) => (
              <li
                key={r.id}
                className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
              >
                <p className="text-lg font-medium">{r.listingTitle}</p>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground">{dp.buyer}</dt>
                    <dd>{r.buyerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{dp.seller}</dt>
                    <dd>{r.sellerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{dp.amount}</dt>
                    <dd className="price">{r.total.toLocaleString()} RWF</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{dp.reportedBy}</dt>
                    <dd>
                      {r.raisedByName} · {shortDate(r.createdAt, lang)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 whitespace-pre-line rounded-lg bg-warning/10 p-3 text-sm">
                  {r.reason}
                </p>

                <form action={resolveDispute} className="mt-4">
                  <input type="hidden" name="id" value={r.id} />
                  <label htmlFor={`res-${r.id}`} className={label}>
                    {dp.resolutionLabel}
                  </label>
                  <textarea
                    id={`res-${r.id}`}
                    name="resolution"
                    rows={3}
                    required
                    minLength={5}
                    maxLength={500}
                    aria-describedby={`res-hint-${r.id}`}
                    className={cn(control, "py-2")}
                  />
                  <p
                    id={`res-hint-${r.id}`}
                    className="mt-1.5 text-sm text-muted-foreground"
                  >
                    {dp.resolutionHint}
                  </p>
                  <button type="submit" className={cn(buttonVariants(), "mt-3")}>
                    {dp.resolveBtn}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="mt-10" aria-labelledby="resolved-heading">
          <h2 id="resolved-heading" className="text-xl">
            {dp.resolvedSection} ({resolved.length})
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {resolved.map((r) => (
              <li key={r.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <p className="font-medium">
                  {r.listingTitle} · {r.buyerName} / {r.sellerName}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {r.reason}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm">
                  <strong>{dp.resolutionIs}:</strong> {r.resolution}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function AdminDisputesPage() {
  return (
    <main className="container-page max-w-5xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-6 h-48 w-full rounded-xl" />
          </>
        }
      >
        <Disputes />
      </Suspense>
    </main>
  );
}
