import { eq } from "drizzle-orm";
import { db } from "../db";
import { listings, sellerVerifications, user } from "../db/schema";

export async function getProduct(id: string) {
  const [row] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
      description: listings.description,
      category: listings.category,
      price: listings.price,
      district: listings.district,
      imageUrl: listings.imageUrl,
      delivery: listings.delivery,
      images: listings.images,
      sellerName: user.name,
      sellerDistrict: user.district,
      verification: sellerVerifications.status,
    })
    .from(listings)
    .innerJoin(user, eq(user.id, listings.sellerId))
    .leftJoin(sellerVerifications, eq(sellerVerifications.userId, listings.sellerId))
    .where(eq(listings.id, id));

  if (!row) return null;

  const { verification, images, ...rest } = row;
  const photos = images.length ? images : row.imageUrl ? [row.imageUrl] : [];
  return { ...rest, photos, verified: verification === "approved" };
}
