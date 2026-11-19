"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { conversations, listings, messages } from "../../db/schema";

export async function startConversation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const listingId = String(formData.get("listingId") ?? "");
  const [listing] = await db
    .select({ id: listings.id, sellerId: listings.sellerId })
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing) redirect("/listings");
  if (listing.sellerId === session.user.id) redirect(`/listings/${listing.id}`);

  await db
    .insert(conversations)
    .values({
      listingId: listing.id,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
    })
    .onConflictDoNothing();

  const [convo] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.listingId, listing.id),
        eq(conversations.buyerId, session.user.id)
      )
    );

  redirect(`/messages/${convo.id}`);
}

export async function sendMessage(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId || !body || body.length > 1000) return;

  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  const me = session.user.id;
  if (!convo || (convo.buyerId !== me && convo.sellerId !== me)) return;

  await db.insert(messages).values({ conversationId, senderId: me, body });

  revalidatePath(`/messages/${conversationId}`);
}
