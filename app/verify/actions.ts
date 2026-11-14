"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { sellerVerifications } from "../../db/schema";

export async function submitVerification(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const idNumber = String(formData.get("idNumber") ?? "").replace(/\s/g, "");
  if (!/^\d{16}$/.test(idNumber)) return;

  const [existing] = await db
    .select()
    .from(sellerVerifications)
    .where(eq(sellerVerifications.userId, session.user.id));

  if (existing && (existing.status === "approved" || existing.status === "pending")) return;

  await db
    .insert(sellerVerifications)
    .values({ userId: session.user.id, idNumber, status: "pending" })
    .onConflictDoUpdate({
      target: sellerVerifications.userId,
      set: { idNumber, status: "pending", submittedAt: new Date(), reviewedAt: null },
    });

  revalidatePath("/verify");
}
