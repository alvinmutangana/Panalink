import { count, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "../db";
import { listings, orders, sellerVerifications, user } from "../db/schema";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export async function getOverview() {
  const [[sellers], [buyers], [verified], [pending], [products], [allOrders], [paid]] =
    await Promise.all([
      db.select({ n: count() }).from(user).where(eq(user.role, "seller")),
      db.select({ n: count() }).from(user).where(eq(user.role, "buyer")),
      db
        .select({ n: count() })
        .from(sellerVerifications)
        .where(eq(sellerVerifications.status, "approved")),
      db
        .select({ n: count() })
        .from(sellerVerifications)
        .where(eq(sellerVerifications.status, "pending")),
      db.select({ n: count() }).from(listings),
      db.select({ n: count() }).from(orders),
      db.select({ n: count() }).from(orders).where(inArray(orders.status, ["paid", "delivering", "completed"])),
    ]);

  return {
    sellers: sellers.n,
    buyers: buyers.n,
    verified: verified.n,
    pending: pending.n,
    products: products.n,
    orders: allOrders.n,
    paid: paid.n,
  };
}

export async function getPendingRequests() {
  return db
    .select({
      userId: sellerVerifications.userId,
      idNumber: sellerVerifications.idNumber,
      submittedAt: sellerVerifications.submittedAt,
      name: user.name,
      email: user.email,
      district: user.district,
    })
    .from(sellerVerifications)
    .innerJoin(user, eq(user.id, sellerVerifications.userId))
    .where(eq(sellerVerifications.status, "pending"))
    .orderBy(sellerVerifications.submittedAt);
}

export async function getSellers() {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      district: user.district,
      createdAt: user.createdAt,
      verification: sellerVerifications.status,
      products: count(listings.id),
    })
    .from(user)
    .leftJoin(sellerVerifications, eq(sellerVerifications.userId, user.id))
    .leftJoin(listings, eq(listings.sellerId, user.id))
    .where(eq(user.role, "seller"))
    .groupBy(user.id, sellerVerifications.status)
    .orderBy(desc(user.createdAt));

  return rows.map((r) => ({ ...r, verification: r.verification ?? "none" }));
}
