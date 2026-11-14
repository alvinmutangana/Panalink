"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { sellerVerifications } from "../../../db/schema";

export async function reviewVerification(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const userId = String(formData.get("userId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!userId || !["approved", "rejected"].includes(decision)) return;

  await db
    .update(sellerVerifications)
    .set({ status: decision, idNumber: null, reviewedAt: new Date() })
    .where(
      and(
        eq(sellerVerifications.userId, userId),
        eq(sellerVerifications.status, "pending")
      )
    );

  revalidatePath("/admin/verifications");
}
