"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { listings } from "../../../db/schema";

export async function deleteListing(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(listings)
    .where(and(eq(listings.id, id), eq(listings.sellerId, session.user.id)));

  revalidatePath("/listings/mine");
  revalidatePath("/listings");
}
