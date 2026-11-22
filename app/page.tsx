import { Suspense } from "react";
import { getDict } from "../lib/i18n";
import { getShell } from "../lib/shell-i18n";
import { getMarket } from "../lib/market-i18n";
import { getDistricts, getProducts } from "../lib/queries";
import { CATEGORIES } from "../lib/categories";
import { cn } from "../lib/utils";
import ProductCard from "../components/ProductCard";
import { Skeleton } from "../components/ui/skeleton";
import { buttonVariants } from "../components/ui/button";

const grid =
  "mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-4";

async function Home() {
  const [t, s, m] = await Promise.all([getDict(), getShell(), getMarket()]);
  const [recent, districts] = await Promise.all([
    getProducts({ limit: 8 }),
    getDistricts(8),
  ]);

  const withPhotos = recent.filter((p) => p.imageUrl);
  const heroPhotos =
    withPhotos.length >= 3 ? withPhotos.slice(0, 3) : withPhotos.slice(0, 1);

  const steps = [
    { title: m.how1Title, text: m.how1Text },
    { title: m.how2Title, text: m.how2Text },
    { title: m.how3Title, text: m.how3Text },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="border-b">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              {m.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              {m.heroText}
            </p>

            <form
              action="/listings"
              method="GET"
              role="search"
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="hero-search" className="sr-only">
                {s.searchLabel}
              </label>
              <input
                id="hero-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder={s.searchPlaceholder}
                className="min-h-12 w-full rounded-md border px-4 text-base"
              />
              <button type="submit" className={buttonVariants({ size: "lg" })}>
                {m.searchBtn}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/listings" className={buttonVariants({ variant: "outline" })}>
                {m.browseBtn}
              </a>
              <a href="/signup" className={buttonVariants({ variant: "ghost" })}>
                {m.sellBtn}
              </a>
            </div>
          </div>

          {heroPhotos.length > 0 && (
            <div
              className={cn(
                "hidden gap-3 md:grid",
                heroPhotos.length === 3 ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              {heroPhotos.map((p, i) => (
                <a
                  key={p.id}
                  href={`/listings/${p.id}`}
                  aria-label={p.title}
                  className={cn(
                    "block overflow-hidden rounded-xl bg-secondary",
                    i === 0 && heroPhotos.length === 3
                      ? "col-span-2 aspect-[16/10]"
                      : "aspect-[4/3]"
                  )}
                >
                  <img
                    src={p.imageUrl!}
                    alt=""
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pt-12">
        <h2 className="text-2xl">{m.catTitle}</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <a
                href={`/listings?category=${c}`}
                className="flex min-h-20 items-center justify-between rounded-xl bg-secondary px-4 py-4 text-lg font-medium text-secondary-foreground hover:bg-secondary/70"
              >
                {t.categories[c]}
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Recently added */}
      <section className="container-page pt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl">{m.recentTitle}</h2>
          <a
            href="/listings"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {m.viewAll}
          </a>
        </div>

        {recent.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center">
            <h3 className="text-lg font-medium">{m.emptyTitle}</h3>
            <p className="mt-1 text-muted-foreground">{m.emptyText}</p>
            <a href="/signup" className={cn(buttonVariants(), "mt-4")}>
              {m.sellBtn}
            </a>
          </div>
        ) : (
          <ul className={grid}>
            {recent.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                categoryLabel={t.categories[p.category as keyof typeof t.categories] ?? p.category}
                verifiedLabel={m.verified}
                byLabel={m.by}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Districts */}
      {districts.length > 0 && (
        <section className="container-page pt-12">
          <h2 className="text-2xl">{m.districtTitle}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {districts.map((d) => (
              <li key={d.district}>
                <a
                  href={`/listings?district=${encodeURIComponent(d.district)}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium hover:bg-secondary"
                >
                  {d.district}
                  <span className="text-muted-foreground">{d.n}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="mt-14 bg-secondary/60">
        <div className="container-page py-12">
          <h2 className="text-2xl">{m.howTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((st, i) => (
              <li key={st.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-medium">{st.title}</h3>
                <p className="mt-1 text-muted-foreground">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sell */}
      <section className="container-page py-14">
        <div className="grid gap-8 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl">{m.sellTitle}</h2>
            <p className="mt-3 text-primary-foreground/85">{m.sellText}</p>
            <a
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              )}
            >
              {m.sellCta}
            </a>
            <p className="mt-4 text-sm text-primary-foreground/80">{m.sellNote}</p>
          </div>

          <ol className="flex flex-col gap-3">
            {[m.sell1, m.sell2, m.sell3].map((x, i) => (
              <li
                key={x}
                className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {i + 1}
                </span>
                {x}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

function HomeSkeleton() {
  return (
    <main className="container-page py-12">
      <Skeleton className="h-12 w-3/4 max-w-xl" />
      <Skeleton className="mt-4 h-6 w-2/3 max-w-lg" />
      <Skeleton className="mt-8 h-12 w-full max-w-xl" />
      <div className={grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}
