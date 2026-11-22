import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db } from "../db";
import { listings, sellerVerifications, user } from "../db/schema";

type Filters = { q?: string; category?: string; district?: string };

export async function getProducts({
  q,
  category,
  district,
  limit = 12,
  offset = 0,
}: Filters & { limit?: number; offset?: number }) {
  const where: SQL[] = [];
  if (q?.trim()) where.push(ilike(listings.title, `%${q.trim()}%`));
  if (category) where.push(eq(listings.category, category));
  if (district?.trim()) where.push(ilike(listings.district, district.trim()));

  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      district: listings.district,
      category: listings.category,
      imageUrl: listings.imageUrl,
      sellerName: user.name,
      verification: sellerVerifications.status,
    })
    .from(listings)
    .innerJoin(user, eq(user.id, listings.sellerId))
    .leftJoin(sellerVerifications, eq(sellerVerifications.userId, listings.sellerId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(listings.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ verification, ...p }) => ({
    ...p,
    verified: verification === "approved",
  }));
}

export type Product = Awaited<ReturnType<typeof getProducts>>[number];

export async function getDistricts(limit = 8) {
  const name = sql<string>`initcap(lower(${listings.district}))`;
  return db
    .select({ district: name, n: count() })
    .from(listings)
    .groupBy(name)
    .orderBy(desc(count()), name)
    .limit(limit);
}
