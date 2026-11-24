"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { disputes, orders } from "../../db/schema";

export async function raiseDispute(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;

  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!orderId || reason.length < 10 || reason.length > 500) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        or(eq(orders.buyerId, me), eq(orders.sellerId, me)),
        inArray(orders.status, ["payment_submitted", "paid", "delivering", "completed"])
      )
    );
  if (!order) return;

  const [existing] = await db
    .select({ id: disputes.id })
    .from(disputes)
    .where(eq(disputes.orderId, order.id))
    .limit(1);
  if (existing) return;

  await db.insert(disputes).values({ orderId: order.id, raisedBy: me, reason });

  revalidatePath("/orders");
}
