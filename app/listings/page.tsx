import { Suspense } from "react";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "../../db";
import { listings } from "../../db/schema";
import { getDict } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";

type Params = { q?: string; category?: string; district?: string };

async function Results({ searchParams }: { searchParams: Promise<Params> }) {
  const { q, category, district } = await searchParams;
  const t = await getDict();

  const filters = [];
  if (q) filters.push(ilike(listings.title, `%${q.trim()}%`));
  if (category) filters.push(eq(listings.category, category));
  if (district) filters.push(ilike(listings.district, district.trim()));

  const rows = await db
    .select()
    .from(listings)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(listings.createdAt))
    .limit(50);

  const catLabel = (c: string) =>
    t.categories[c as keyof typeof t.categories] ?? c;

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{t.browse}</h1>

      <form method="GET" action="/listings" className="mb-6 flex flex-col gap-3">
        <input name="q" defaultValue={q ?? ""} placeholder={t.searchPlaceholder} className="rounded border p-3" />
        <select name="category" defaultValue={category ?? ""} className="rounded border p-3">
          <option value="">{t.allCategories}</option>
          <option value="agriculture">{t.categories.agriculture}</option>
          <option value="crafts">{t.categories.crafts}</option>
          <option value="food">{t.categories.food}</option>
          <option value="other">{t.categories.other}</option>
        </select>
        <input name="district" defaultValue={district ?? ""} placeholder={t.districtPlaceholder} className="rounded border p-3" />
        <button className="rounded bg-green-700 p-3 text-white">{t.search}</button>
      </form>

      {rows.length === 0 ? (
        <p>{t.noListings}</p>
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
              <h2 className="text-lg font-semibold"><a href={`/listings/${l.id}`} className="underline">{l.title}</a></h2>
              <p className="text-sm opacity-70">
                {catLabel(l.category)} · {l.district}
              </p>
              {l.description && <p className="mt-2">{l.description}</p>}
              <p className="mt-2 font-bold">{l.price.toLocaleString()} RWF</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
