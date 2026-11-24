"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "../../../lib/admin";
import { db } from "../../../db";
import { disputes } from "../../../db/schema";

export async function resolveDispute(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const resolution = String(formData.get("resolution") ?? "").trim();
  if (!id || resolution.length < 5 || resolution.length > 500) return;

  await db
    .update(disputes)
    .set({
      status: "resolved",
      resolution,
      resolvedBy: admin.user.id,
      resolvedAt: new Date(),
    })
    .where(and(eq(disputes.id, id), eq(disputes.status, "open")));

  revalidatePath("/admin/disputes");
  revalidatePath("/orders");
}
