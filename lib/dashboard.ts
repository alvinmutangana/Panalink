import { and, count, eq, inArray, or } from "drizzle-orm";
import { db } from "../db";
import {
  conversations,
  listings,
  orders,
  sellerVerifications,
} from "../db/schema";

export async function getSellerStats(userId: string) {
  const [[p], [pending], paidRows, [v], [c]] = await Promise.all([
    db.select({ n: count() }).from(listings).where(eq(listings.sellerId, userId)),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(eq(orders.sellerId, userId), eq(orders.status, "pending"))),
    db
      .select({ total: orders.total })
      .from(orders)
      .where(and(eq(orders.sellerId, userId), inArray(orders.status, ["paid", "delivering", "completed"]))),
    db
      .select({ status: sellerVerifications.status })
      .from(sellerVerifications)
      .where(eq(sellerVerifications.userId, userId)),
    db
      .select({ n: count() })
      .from(conversations)
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId))),
  ]);

  return {
    products: p.n,
    toReview: pending.n,
    paid: paidRows.length,
    paidTotal: paidRows.reduce((sum, r) => sum + r.total, 0),
    verification: v?.status ?? "none",
    conversations: c.n,
  };
}

export async function getBuyerStats(userId: string) {
  const [[placed], [awaiting], [c]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(eq(orders.buyerId, userId)),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(eq(orders.buyerId, userId), eq(orders.status, "accepted"))),
    db
      .select({ n: count() })
      .from(conversations)
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId))),
  ]);

  return { placed: placed.n, awaiting: awaiting.n, conversations: c.n };
}
