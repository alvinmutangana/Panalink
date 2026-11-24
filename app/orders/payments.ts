"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { orders, payments } from "../../db/schema";

const REF = /^[A-Za-z0-9._-]{6,30}$/;

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

export async function submitPayment(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  const provider = String(formData.get("provider") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();

  if (!orderId) return;
  if (!["mtn", "airtel"].includes(provider) || !REF.test(reference)) {
    redirect("/orders?e=ref");
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.id, orderId), eq(orders.buyerId, me.id), eq(orders.status, "accepted"))
    );
  if (!order) return;

  const [used] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(
      and(
        sql`lower(${payments.reference}) = ${reference.toLowerCase()}`,
        inArray(payments.status, ["submitted", "confirmed"])
      )
    )
    .limit(1);
  if (used) redirect("/orders?e=ref");

  await db.insert(payments).values({
    orderId: order.id,
    provider,
    amount: order.total,
    status: "submitted",
    reference,
  });

  await db
    .update(orders)
    .set({ status: "payment_submitted", updatedAt: new Date() })
    .where(and(eq(orders.id, order.id), eq(orders.status, "accepted")));

  revalidatePath("/orders");
}

export async function confirmPayment(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.sellerId, me.id),
        eq(orders.status, "payment_submitted")
      )
    );
  if (!order) return;

  await db
    .update(payments)
    .set({ status: "confirmed" })
    .where(and(eq(payments.orderId, order.id), eq(payments.status, "submitted")));

  await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(and(eq(orders.id, order.id), eq(orders.status, "payment_submitted")));

  revalidatePath("/orders");
}

export async function rejectPayment(formData: FormData) {
  const me = await requireUser();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.sellerId, me.id),
        eq(orders.status, "payment_submitted")
      )
    );
  if (!order) return;

  await db
    .update(payments)
    .set({ status: "rejected" })
    .where(and(eq(payments.orderId, order.id), eq(payments.status, "submitted")));

  await db
    .update(orders)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(and(eq(orders.id, order.id), eq(orders.status, "payment_submitted")));

  revalidatePath("/orders");
}
