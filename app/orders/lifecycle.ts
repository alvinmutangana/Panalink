"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { orders, reviews } from "../../db/schema";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

export async function markDelivering(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  await db
    .update(orders)
    .set({ status: "delivering", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.sellerId, me.id),
        eq(orders.status, "paid")
      )
    );

  revalidatePath("/orders");
}

export async function confirmReceived(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  await db
    .update(orders)
    .set({ status: "completed", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.buyerId, me.id),
        eq(orders.status, "delivering")
      )
    );

  revalidatePath("/orders");
}

export async function submitReview(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 500);

  if (!orderId || !Number.isInteger(rating) || rating < 1 || rating > 5) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.buyerId, me.id),
        eq(orders.status, "completed")
      )
    );
  if (!order) return;

  await db
    .insert(reviews)
    .values({
      orderId: order.id,
      sellerId: order.sellerId,
      buyerId: me.id,
      rating,
      comment: comment || null,
    })
    .onConflictDoNothing();

  revalidatePath("/orders");
}
