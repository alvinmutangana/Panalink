import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import {
  disputes,
  listings,
  orders,
  paymentMethods,
  payments,
  reviews,
  user,
} from "../../db/schema";
import { getLang } from "../../lib/i18n";
import { getOrderLabels } from "../../lib/orders-i18n";
import { getLifeLabels } from "../../lib/lifecycle-i18n";
import { getPayLabels } from "../../lib/pay-i18n";
import { getDisputeLabels } from "../../lib/dispute-i18n";
import { shortDate } from "../../lib/format";
import { cn } from "../../lib/utils";
import OrderCard, { type OrderView } from "../../components/OrderCard";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

async function OrdersList({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;

  const [o, l, p, dp, lang, sp] = await Promise.all([
    getOrderLabels(),
    getLifeLabels(),
    getPayLabels(),
    getDisputeLabels(),
    getLang(),
    searchParams,
  ]);

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
        .select({
          orderId: payments.orderId,
          provider: payments.provider,
          reference: payments.reference,
          status: payments.status,
        })
        .from(payments)
        .where(inArray(payments.orderId, orderIds))
        .orderBy(desc(payments.createdAt))
    : [];
  const lastPay = new Map<string, { provider: string; reference: string; status: string }>();
  for (const x of pays) {
    if (!lastPay.has(x.orderId)) {
      lastPay.set(x.orderId, {
        provider: x.provider,
        reference: x.reference,
        status: x.status,
      });
    }
  }

  const revs = orderIds.length
    ? await db
        .select({
          orderId: reviews.orderId,
          rating: reviews.rating,
          comment: reviews.comment,
        })
        .from(reviews)
        .where(inArray(reviews.orderId, orderIds))
    : [];
  const reviewOf = new Map(
    revs.map((r) => [r.orderId, { rating: r.rating, comment: r.comment }])
  );

  const disp = orderIds.length
    ? await db
        .select({
          orderId: disputes.orderId,
          status: disputes.status,
          reason: disputes.reason,
          resolution: disputes.resolution,
        })
        .from(disputes)
        .where(inArray(disputes.orderId, orderIds))
    : [];
  const disputeOf = new Map(
    disp.map((d) => [
      d.orderId,
      { status: d.status, reason: d.reason, resolution: d.resolution },
    ])
  );

  const sellerIdsToPay = [
    ...new Set(
      rows.filter((r) => r.buyerId === me && r.status === "accepted").map((r) => r.sellerId)
    ),
  ];
  const methods = sellerIdsToPay.length
    ? await db
        .select()
        .from(paymentMethods)
        .where(inArray(paymentMethods.userId, sellerIdsToPay))
    : [];
  const methodOf = new Map(methods.map((m) => [m.userId, m]));

  const view = (r: (typeof rows)[number]): OrderView => {
    const iAmBuyer = r.buyerId === me;
    const m = iAmBuyer && r.status === "accepted" ? methodOf.get(r.sellerId) : undefined;
    return {
      id: r.id,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      total: r.total,
      status: r.status,
      listingId: r.listingId,
      listingTitle: r.listingTitle,
      imageUrl: r.imageUrl,
      otherName: nameOf.get(iAmBuyer ? r.sellerId : r.buyerId) ?? "?",
      dateText: shortDate(r.createdAt, lang),
      review: reviewOf.get(r.id) ?? null,
      payment: lastPay.get(r.id) ?? null,
      payTo: m
        ? { provider: m.provider, number: m.number, accountName: m.accountName }
        : null,
      dispute: disputeOf.get(r.id) ?? null,
    };
  };

  const received = rows.filter((r) => r.sellerId === me).map(view);
  const placed = rows.filter((r) => r.buyerId === me).map(view);

  const error =
    sp.e === "ref" ? p.errRef : sp.e === "method" ? p.errMethod : "";

  return (
    <>
      <h1 className="text-3xl">{o.ordersTitle}</h1>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
          {sp.e === "method" && (
            <>
              {" "}
              <a href="/payment-details" className="font-medium underline">
                {p.bannerBtn}
              </a>
            </>
          )}
        </p>
      )}

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
              <OrderCard key={r.id} order={r} role="seller" o={o} l={l} p={p} dp={dp} />
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
              <OrderCard key={r.id} order={r} role="buyer" o={o} l={l} p={p} dp={dp} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
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
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
