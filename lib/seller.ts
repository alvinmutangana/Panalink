import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { sellerVerifications } from "../db/schema";

export async function isApprovedSeller(userId: string) {
  const [row] = await db
    .select({ status: sellerVerifications.status })
    .from(sellerVerifications)
    .where(
      and(
        eq(sellerVerifications.userId, userId),
        eq(sellerVerifications.status, "approved")
      )
    );
  return Boolean(row);
}
