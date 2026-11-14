import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const listings = pgTable(
  "listings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    price: integer("price").notNull(), // in RWF
    district: text("district").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("listings_district_idx").on(t.district),
    index("listings_category_idx").on(t.category),
  ]
);

export const sellerVerifications = pgTable("seller_verifications", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  idNumber: text("id_number"), // cleared after an admin decision
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});
