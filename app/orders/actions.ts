"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { getPaymentMethod } from "../../lib/payment-methods";
import { db } from "../../db";
import { listings, orders } from "../../db/schema";

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

  if (decision === "accepted" && !(await getPaymentMethod(session.user.id))) {
    redirect("/orders?e=method");
  }

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
