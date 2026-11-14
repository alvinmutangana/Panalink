import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { listings } from "../../../db/schema";
import { getDict } from "../../../lib/i18n";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { deleteListing } from "./actions";

async function MyListings() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const t = await getDict();

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.sellerId, session.user.id))
    .orderBy(desc(listings.createdAt));

  const catLabel = (c: string) =>
    t.categories[c as keyof typeof t.categories] ?? c;

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{t.mine}</h1>

      {rows.length === 0 ? (
        <p>{t.noneYet}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((l) => (
            <li key={l.id} className="rounded border p-4">
              {l.imageUrl && (
                <img
                  src={l.imageUrl}
                  alt={l.title}
                  loading="lazy"
                  className="mb-3 h-48 w-full rounded object-cover"
                />
              )}
              <h2 className="text-lg font-semibold">{l.title}</h2>
              <p className="text-sm opacity-70">
                {catLabel(l.category)} · {l.district}
              </p>
              <p className="mt-2 font-bold">{l.price.toLocaleString()} RWF</p>
              <div className="mt-3 flex items-center gap-3">
                <a href={`/listings/${l.id}/edit`} className="rounded bg-gray-800 px-3 py-1 text-white">
                  {t.edit}
                </a>
                <form action={deleteListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="rounded bg-red-700 px-3 py-1 text-white">{t.delete}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function MyListingsPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <MyListings />
      </Suspense>
    </main>
  );
}
