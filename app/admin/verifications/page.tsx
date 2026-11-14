import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { sellerVerifications, user } from "../../../db/schema";
import { reviewVerification } from "./actions";

async function PendingList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const rows = await db
    .select({
      userId: sellerVerifications.userId,
      idNumber: sellerVerifications.idNumber,
      submittedAt: sellerVerifications.submittedAt,
      name: user.name,
      email: user.email,
      district: user.district,
    })
    .from(sellerVerifications)
    .innerJoin(user, eq(user.id, sellerVerifications.userId))
    .where(eq(sellerVerifications.status, "pending"));

  if (rows.length === 0) return <p>No pending requests.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r) => (
        <li key={r.userId} className="rounded border p-4">
          <h2 className="text-lg font-semibold">{r.name}</h2>
          <p className="text-sm opacity-70">
            {r.email} · {r.district}
          </p>
          <p className="mt-2">ID: {r.idNumber}</p>
          <div className="mt-3 flex gap-3">
            {(["approved", "rejected"] as const).map((d) => (
              <form key={d} action={reviewVerification}>
                <input type="hidden" name="userId" value={r.userId} />
                <input type="hidden" name="decision" value={d} />
                <button
                  className={
                    d === "approved"
                      ? "rounded bg-green-700 px-3 py-1 text-white"
                      : "rounded bg-red-700 px-3 py-1 text-white"
                  }
                >
                  {d === "approved" ? "Approve" : "Reject"}
                </button>
              </form>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminVerificationsPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Seller verification requests</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <PendingList />
      </Suspense>
    </main>
  );
}
