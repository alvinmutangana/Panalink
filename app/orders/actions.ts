"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { getProvider, RW_PHONE } from "../../lib/payments";
import { db } from "../../db";
import { listings, orders, payments } from "../../db/schema";

export async function placeOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const listingId = String(formData.get("listingId") ?? "");
  const quantity = Number(formData.get("quantity"));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) return;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing) redirect("/listings");
  if (listing.sellerId === session.user.id) redirect(`/listings/${listing.id}`);

  await db.insert(orders).values({
    listingId: listing.id,
    buyerId: session.user.id,
    sellerId: listing.sellerId,
    quantity,
    unitPrice: listing.price,
    total: listing.price * quantity,
  });

  redirect("/orders");
}

export async function respondToOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!orderId || !["accepted", "declined"].includes(decision)) return;

  await db
    .update(orders)
    .set({ status: decision, updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.sellerId, session.user.id),
        eq(orders.status, "pending")
      )
    );

  revalidatePath("/orders");
}

export async function cancelOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.buyerId, session.user.id),
        eq(orders.status, "pending")
      )
    );

  revalidatePath("/orders");
}

export async function payOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const orderId = String(formData.get("orderId") ?? "");
  const phone = String(formData.get("phone") ?? "").replace(/\s/g, "");
  if (!orderId || !RW_PHONE.test(phone)) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.buyerId, session.user.id),
        eq(orders.status, "accepted")
      )
    );
  if (!order) return;

  const provider = getProvider();
  const result = await provider.charge({
    orderId: order.id,
    amount: order.total,
    phone,
  });

  await db.insert(payments).values({
    orderId: order.id,
    provider: provider.name,
    amount: order.total,
    status: result.status,
    reference: result.reference,
  });

  if (result.status === "paid") {
    await db
      .update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(and(eq(orders.id, order.id), eq(orders.status, "accepted")));
  }

  revalidatePath("/orders");
}
