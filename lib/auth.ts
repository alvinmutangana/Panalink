import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "buyer" },
      district: { type: "string", required: false },
      language: { type: "string", required: false, defaultValue: "rw" },
      phone: { type: "string", required: false },
    },
    databaseHooks: {
    user: {
      create: {
        before: async (user: Record<string, any>) => ({
          data: { ...user, role: user.role === "seller" ? "seller" : "buyer" },
        }),
      },
    },
  },
  },
  plugins: [nextCookies()],
});
