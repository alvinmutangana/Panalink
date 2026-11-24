import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { listings, user } from "../../../db/schema";
import { requireAdmin } from "../../../lib/admin";
import { getAdminListingsLabels } from "../../../lib/admin-listings-i18n";
import { getLang } from "../../../lib/i18n";
import { shortDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { removeListing } from "./actions";

async function Moderation() {
  await requireAdmin();
  const [x, lang, rows] = await Promise.all([
    getAdminListingsLabels(),
    getLang(),
    db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        district: listings.district,
        imageUrl: listings.imageUrl,
        createdAt: listings.createdAt,
        sellerName: user.name,
        sellerEmail: user.email,
      })
      .from(listings)
      .innerJoin(user, eq(user.id, listings.sellerId))
      .orderBy(desc(listings.createdAt))
      .limit(100),
  ]);

  return (
    <>
      <h1 className="text-3xl">{x.title}</h1>
      <p className="mt-2 text-muted-foreground">{x.intro}</p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <p className="text-muted-foreground">{x.empty}</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((l) => (
            <li
              key={l.id}
              className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-20">
                  {l.imageUrl ? (
                    <img
                      src={l.imageUrl}
                      alt=""
                      width={160}
                      height={160}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex size-full items-center justify-center text-2xl font-semibold text-primary/30"
                    >
                      {l.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <a
                    href={`/listings/${l.id}`}
                    className="break-words text-lg font-medium leading-snug underline-offset-4 hover:underline"
                  >
                    {l.title}
                  </a>
                  <p className="price text-primary">{l.price.toLocaleString()} RWF</p>
                  <p className="text-sm text-muted-foreground">
                    {x.seller}: {l.sellerName} ({l.sellerEmail}) · {l.district}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {x.added} {shortDate(l.createdAt, lang)}
                  </p>
                </div>
              </div>

              <details className="mt-4">
                <summary
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "cursor-pointer list-none text-destructive [&::-webkit-details-marker]:hidden"
                  )}
                >
                  {x.remove}
                </summary>
                <form
                  action={removeListing}
                  className="mt-3 rounded-lg bg-destructive/10 p-3"
                >
                  <input type="hidden" name="id" value={l.id} />
                  <p className="font-medium">{x.confirm}</p>
                  <p className="text-sm text-muted-foreground">{x.confirmText}</p>
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "mt-3 bg-destructive hover:bg-destructive/90"
                    )}
                  >
                    {x.confirmYes}
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminListingsPage() {
  return (
    <main className="container-page max-w-5xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </>
        }
      >
        <Moderation />
      </Suspense>
    </main>
  );
}
