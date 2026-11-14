"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../db";
import { listings } from "../../../../db/schema";

const CATEGORIES = ["agriculture", "crafts", "food", "other"];

export async function updateListing(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const district = String(formData.get("district") ?? "").trim();
  const price = Number(formData.get("price"));
  const rawImage = String(formData.get("imageUrl") ?? "");

  if (!id || !title || !district || !CATEGORIES.includes(category)) return;
  if (!Number.isInteger(price) || price <= 0) return;

  const allowedPrefix = `${process.env.R2_PUBLIC_URL}/listings/${session.user.id}/`;
  const newImage = rawImage.startsWith(allowedPrefix) ? rawImage : undefined;

  await db
    .update(listings)
    .set({
      title,
      description: description || null,
      category,
      price,
      district,
      ...(newImage ? { imageUrl: newImage } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(listings.id, id), eq(listings.sellerId, session.user.id)));

  revalidatePath("/listings/mine");
  revalidatePath("/listings");
  redirect("/listings/mine");
}
