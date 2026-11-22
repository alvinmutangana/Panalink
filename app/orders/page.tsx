import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { listings, orders, payments, user } from "../../db/schema";
import { getLang } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { cancelOrder, payOrder, respondToOrder } from "./actions";

const extra = {
  en: {
    title: "Orders", empty: "No orders yet.", qty: "Quantity", total: "Total",
    from: "Seller", by: "Buyer", accept: "Accept", decline: "Decline", cancel: "Cancel order",
    pay: "Pay now", phone: "Mobile money number (07...)",
    testNote: "Test payment: no real money is charged.",
    failed: "The last payment failed. Please try again.",
    status: { pending: "Waiting for seller", accepted: "Accepted, waiting for payment", declined: "Declined", cancelled: "Cancelled", paid: "Paid ✓" },
  },
  fr: {
    title: "Commandes", empty: "Aucune commande.", qty: "Quantité", total: "Total",
    from: "Vendeur", by: "Acheteur", accept: "Accepter", decline: "Refuser", cancel: "Annuler la commande",
    pay: "Payer", phone: "Numéro Mobile Money (07...)",
    testNote: "Paiement de test : aucun argent réel n'est débité.",
    failed: "Le dernier paiement a échoué. Veuillez réessayer.",
    status: { pending: "En attente du vendeur", accepted: "Acceptée, en attente de paiement", declined: "Refusée", cancelled: "Annulée", paid: "Payée ✓" },
  },
  rw: {
    title: "Komande", empty: "Nta komande ziraba.", qty: "Ingano", total: "Yose hamwe",
    from: "Umucuruzi", by: "Umuguzi", accept: "Emera", decline: "Anga", cancel: "Hagarika komande",
    pay: "Ishyura", phone: "Numero ya Mobile Money (07...)",
    testNote: "Ubwishyu bwo kugerageza: nta mafaranga nyayo akurwaho.",
    failed: "Ubwishyu bwa nyuma ntibwagenze neza. Ongera ugerageze.",
    status: { pending: "Irategereje umucuruzi", accepted: "Yemewe, itegereje ubwishyu", declined: "Yangiwe", cancelled: "Yahagaritswe", paid: "Yishyuwe ✓" },
  },
};

async function OrdersList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;
  const x = extra[await getLang()];

  const rows = await db
    .select({
      id: orders.id,
      buyerId: orders.buyerId,
      sellerId: orders.sellerId,
      quantity: orders.quantity,
      total: orders.total,
      status: orders.status,
      listingId: orders.listingId,
      listingTitle: listings.title,
    })
    .from(orders)
    .innerJoin(listings, eq(listings.id, orders.listingId))
    .where(or(eq(orders.buyerId, me), eq(orders.sellerId, me)))
    .orderBy(desc(orders.createdAt));

  const otherIds = [
    ...new Set(rows.map((o) => (o.buyerId === me ? o.sellerId : o.buyerId))),
  ];
  const others = otherIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, otherIds))
    : [];
  const nameOf = new Map(others.map((o) => [o.id, o.name]));

  // latest payment status per order, so we can show "payment failed"
  const orderIds = rows.map((o) => o.id);
  const pays = orderIds.length
    ? await db
        .select({ orderId: payments.orderId, status: payments.status })
        .from(payments)
        .where(inArray(payments.orderId, orderIds))
        .orderBy(desc(payments.createdAt))
    : [];
  const lastPay = new Map<string, string>();
  for (const p of pays) if (!lastPay.has(p.orderId)) lastPay.set(p.orderId, p.status);

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{x.title}</h1>

      {rows.length === 0 ? (
        <p>{x.empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((o) => {
            const iAmBuyer = o.buyerId === me;
            const otherId = iAmBuyer ? o.sellerId : o.buyerId;
            return (
              <li key={o.id} className="rounded border p-4">
                <a href={`/listings/${o.listingId}`} className="text-lg font-semibold underline">
                  {o.listingTitle}
                </a>
                <p className="text-sm opacity-70">
                  {iAmBuyer ? x.from : x.by}: {nameOf.get(otherId) ?? "?"}
                </p>
                <p className="mt-2">
                  {x.qty}: {o.quantity} · {x.total}: <strong>{o.total.toLocaleString()} RWF</strong>
                </p>
                <p className="mt-1 text-sm">
                  {x.status[o.status as keyof typeof x.status] ?? o.status}
                </p>

                {o.status === "pending" && !iAmBuyer && (
                  <div className="mt-3 flex gap-3">
                    {(["accepted", "declined"] as const).map((d) => (
                      <form key={d} action={respondToOrder}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="decision" value={d} />
                        <button
                          className={
                            d === "accepted"
                              ? "rounded bg-green-700 px-3 py-1 text-white"
                              : "rounded bg-red-700 px-3 py-1 text-white"
                          }
                        >
                          {d === "accepted" ? x.accept : x.decline}
                        </button>
                      </form>
                    ))}
                  </div>
                )}

                {o.status === "pending" && iAmBuyer && (
                  <form action={cancelOrder} className="mt-3">
                    <input type="hidden" name="orderId" value={o.id} />
                    <button className="rounded bg-red-700 px-3 py-1 text-white">{x.cancel}</button>
                  </form>
                )}

                {o.status === "accepted" && iAmBuyer && (
                  <form action={payOrder} className="mt-3 flex flex-col gap-2">
                    <input type="hidden" name="orderId" value={o.id} />
                    {lastPay.get(o.id) === "failed" && (
                      <p className="text-sm text-red-500">{x.failed}</p>
                    )}
                    <input
                      name="phone"
                      inputMode="numeric"
                      pattern="07[2389][0-9]{7}"
                      maxLength={10}
                      placeholder={x.phone}
                      required
                      className="rounded border p-3"
                    />
                    <button className="rounded bg-green-700 p-3 text-white">
                      {x.pay} · {o.total.toLocaleString()} RWF
                    </button>
                    <p className="text-xs opacity-70">{x.testNote}</p>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <OrdersList />
      </Suspense>
    </main>
  );
}