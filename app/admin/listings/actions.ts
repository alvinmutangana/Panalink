"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../../lib/admin";
import { db } from "../../../db";
import { listings } from "../../../db/schema";

export async function removeListing(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.delete(listings).where(eq(listings.id, id));

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  revalidatePath("/");
}
