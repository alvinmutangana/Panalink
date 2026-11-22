import { Suspense } from "react";
import { getDict } from "../../lib/i18n";
import { getShell } from "../../lib/shell-i18n";
import { getMarket } from "../../lib/market-i18n";
import { getProducts } from "../../lib/queries";
import { CATEGORIES } from "../../lib/categories";
import { control, label } from "../../lib/ui";
import ProductCard from "../../components/ProductCard";
import { Skeleton } from "../../components/ui/skeleton";
import { buttonVariants } from "../../components/ui/button";

const PAGE_SIZE = 12;

type Params = {
  q?: string;
  category?: string;
  district?: string;
  page?: string;
};

const gridClass =
  "mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-4";

async function Results({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const [t, s, m] = await Promise.all([getDict(), getShell(), getMarket()]);

  const q = sp.q?.trim() ?? "";
  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? "")
    ? sp.category!
    : "";
  const district = sp.district?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const rows = await getProducts({
    q,
    category,
    district,
    limit: PAGE_SIZE + 1,
    offset: (page - 1) * PAGE_SIZE,
  });
  const hasNext = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);
  const hasFilters = Boolean(q || category || district);

  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (category) u.set("category", category);
    if (district) u.set("district", district);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return qs ? `/listings?${qs}` : "/listings";
  };

  return (
    <>
      <h1 className="text-3xl">{t.browse}</h1>

      <form
        method="GET"
        action="/listings"
        className="mt-6 grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
      >
        <div>
          <label htmlFor="f-q" className={label}>
            {s.searchLabel}
          </label>
          <input
            id="f-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder={s.searchPlaceholder}
            className={control}
          />
        </div>
        <div>
          <label htmlFor="f-category" className={label}>
            {m.filterCategory}
          </label>
          <select
            id="f-category"
            name="category"
            defaultValue={category}
            className={control}
          >
            <option value="">{t.allCategories}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.categories[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-district" className={label}>
            {m.filterDistrict}
          </label>
          <input
            id="f-district"
            name="district"
            defaultValue={district}
            placeholder={t.districtPlaceholder}
            className={control}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={buttonVariants()}>
            {m.apply}
          </button>
          {hasFilters && (
            <a href="/listings" className={buttonVariants({ variant: "outline" })}>
              {m.clear}
            </a>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-medium">
            {hasFilters ? m.noResultsTitle : m.emptyTitle}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {hasFilters ? m.noResultsText : m.emptyText}
          </p>
        </div>
      ) : (
        <ul className={gridClass}>
          {items.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              categoryLabel={
                t.categories[p.category as keyof typeof t.categories] ?? p.category
              }
              verifiedLabel={m.verified}
              byLabel={m.by}
            />
          ))}
        </ul>
      )}

      {(page > 1 || hasNext) && (
        <nav
          aria-label={m.pagination}
          className="mt-8 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <a
              href={pageHref(page - 1)}
              className={buttonVariants({ variant: "outline" })}
            >
              ← {m.prev}
            </a>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">{page}</span>
          {hasNext ? (
            <a
              href={pageHref(page + 1)}
              className={buttonVariants({ variant: "outline" })}
            >
              {m.next} →
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-6 h-28 w-full rounded-xl" />
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </>
  );
}

export default function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  return (
    <main className="container-page py-8">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
