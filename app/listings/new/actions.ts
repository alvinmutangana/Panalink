"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { isApprovedSeller } from "../../../lib/seller";
import { db } from "../../../db";
import { listings } from "../../../db/schema";

const CATEGORIES = ["agriculture", "crafts", "food", "other"];

export async function createListing(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");
  if (!(await isApprovedSeller(session.user.id))) redirect("/verify");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const district = String(formData.get("district") ?? "").trim();
  const price = Number(formData.get("price"));
  const rawImage = String(formData.get("imageUrl") ?? "");

  if (!title || !district || !CATEGORIES.includes(category)) return;
  if (!Number.isInteger(price) || price <= 0) return;

  const allowedPrefix = `${process.env.R2_PUBLIC_URL}/listings/${session.user.id}/`;
  const imageUrl = rawImage.startsWith(allowedPrefix) ? rawImage : null;

  await db.insert(listings).values({
    sellerId: session.user.id,
    title,
    description: description || null,
    category,
    price,
    district,
    imageUrl,
  });

  redirect("/dashboard");
}
