"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { paymentMethods } from "../../db/schema";

export async function savePaymentMethod(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const provider = String(formData.get("provider") ?? "");
  const number = String(formData.get("number") ?? "").replace(/\s/g, "");
  const accountName = String(formData.get("accountName") ?? "").trim();

  if (!["mtn", "airtel"].includes(provider)) return;
  if (!/^\d{5,12}$/.test(number)) return;
  if (accountName.length < 2 || accountName.length > 60) return;

  await db
    .insert(paymentMethods)
    .values({ userId: session.user.id, provider, number, accountName })
    .onConflictDoUpdate({
      target: paymentMethods.userId,
      set: { provider, number, accountName, updatedAt: new Date() },
    });

  redirect("/payment-details?saved=1");
}
