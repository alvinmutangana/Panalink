import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { listings, orders, payments, user } from "../../db/schema";
import { getLang } from "../../lib/i18n";
import { getOrderLabels } from "../../lib/orders-i18n";
import { shortDate } from "../../lib/format";
import { cn } from "../../lib/utils";
import OrderCard, { type OrderView } from "../../components/OrderCard";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

async function OrdersList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;

  const [o, lang] = await Promise.all([getOrderLabels(), getLang()]);

  const rows = await db
    .select({
      id: orders.id,
      buyerId: orders.buyerId,
      sellerId: orders.sellerId,
      quantity: orders.quantity,
      unitPrice: orders.unitPrice,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      listingId: orders.listingId,
      listingTitle: listings.title,
      imageUrl: listings.imageUrl,
    })
    .from(orders)
    .innerJoin(listings, eq(listings.id, orders.listingId))
    .where(or(eq(orders.buyerId, me), eq(orders.sellerId, me)))
    .orderBy(desc(orders.createdAt));

  const otherIds = [
    ...new Set(rows.map((r) => (r.buyerId === me ? r.sellerId : r.buyerId))),
  ];
  const others = otherIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, otherIds))
    : [];
  const nameOf = new Map(others.map((u) => [u.id, u.name]));

  const orderIds = rows.map((r) => r.id);
  const pays = orderIds.length
    ? await db
        .select({ orderId: payments.orderId, status: payments.status })
        .from(payments)
        .where(inArray(payments.orderId, orderIds))
        .orderBy(desc(payments.createdAt))
    : [];
  const lastPay = new Map<string, string>();
  for (const p of pays) if (!lastPay.has(p.orderId)) lastPay.set(p.orderId, p.status);

  const view = (r: (typeof rows)[number]): OrderView => ({
    id: r.id,
    quantity: r.quantity,
    unitPrice: r.unitPrice,
    total: r.total,
    status: r.status,
    listingId: r.listingId,
    listingTitle: r.listingTitle,
    imageUrl: r.imageUrl,
    otherName: nameOf.get(r.buyerId === me ? r.sellerId : r.buyerId) ?? "?",
    dateText: shortDate(r.createdAt, lang),
    lastPaymentFailed: lastPay.get(r.id) === "failed",
  });

  const received = rows.filter((r) => r.sellerId === me).map(view);
  const placed = rows.filter((r) => r.buyerId === me).map(view);

  return (
    <>
      <h1 className="text-3xl">{o.ordersTitle}</h1>

      {received.length === 0 && placed.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-medium">{o.emptyTitle}</h2>
          <p className="mt-1 text-muted-foreground">{o.emptyText}</p>
          <a href="/listings" className={cn(buttonVariants(), "mt-4")}>
            {o.emptyCta}
          </a>
        </div>
      )}

      {received.length > 0 && (
        <section className="mt-8" aria-labelledby="received-heading">
          <h2 id="received-heading" className="text-xl">
            {o.receivedTitle}
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {received.map((r) => (
              <OrderCard key={r.id} order={r} role="seller" o={o} />
            ))}
          </ul>
        </section>
      )}

      {placed.length > 0 && (
        <section className="mt-10" aria-labelledby="placed-heading">
          <h2 id="placed-heading" className="text-xl">
            {o.placedTitle}
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {placed.map((r) => (
              <OrderCard key={r.id} order={r} role="buyer" o={o} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <main className="container-page max-w-3xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="mt-6 h-48 w-full rounded-xl" />
            <Skeleton className="mt-4 h-48 w-full rounded-xl" />
          </>
        }
      >
        <OrdersList />
      </Suspense>
    </main>
  );
}
