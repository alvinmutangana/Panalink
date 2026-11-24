import { eq } from "drizzle-orm";
import { db } from "../db";
import { paymentMethods } from "../db/schema";

export async function getPaymentMethod(userId: string) {
  const [row] = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId));
  return row ?? null;
}
