import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { listings } from "../../../db/schema";
import { getDict } from "../../../lib/i18n";
import { getDashLabels } from "../../../lib/dash-i18n";
import { isApprovedSeller } from "../../../lib/seller";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { deleteListing } from "./actions";

async function MyProducts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const [t, d, approved, rows] = await Promise.all([
    getDict(),
    getDashLabels(),
    isApprovedSeller(session.user.id),
    db
      .select()
      .from(listings)
      .where(eq(listings.sellerId, session.user.id))
      .orderBy(desc(listings.createdAt)),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{d.mineTitle}</h1>
        {approved ? (
          <a href="/listings/new" className={buttonVariants()}>
            {d.addProduct}
          </a>
        ) : (
          <a href="/verify" className={buttonVariants({ variant: "outline" })}>
            {d.verifyNow}
          </a>
        )}
      </div>

      {!approved && (
        <p className="mt-4 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          {d.needVerify}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-medium">{d.noneTitle}</h2>
          <p className="mt-1 text-muted-foreground">{d.noneText}</p>
          {approved && (
            <a href="/listings/new" className={cn(buttonVariants(), "mt-4")}>
              {d.addProduct}
            </a>
          )}
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((l) => (
            <li
              key={l.id}
              className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex gap-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-24">
                  {l.imageUrl ? (
                    <img
                      src={l.imageUrl}
                      alt=""
                      width={192}
                      height={192}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex size-full items-center justify-center text-3xl font-semibold text-primary/30"
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
                  <p className="price mt-1 text-primary">
                    {l.price.toLocaleString()} RWF
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.categories[l.category as keyof typeof t.categories] ?? l.category}{" "}
                    · {l.district}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-3">
                <a
                  href={`/listings/${l.id}/edit`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {d.edit}
                </a>

                <details>
                  <summary
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "cursor-pointer list-none text-destructive [&::-webkit-details-marker]:hidden"
                    )}
                  >
                    {d.delete}
                  </summary>
                  <form
                    action={deleteListing}
                    className="mt-3 rounded-lg bg-destructive/10 p-3"
                  >
                    <input type="hidden" name="id" value={l.id} />
                    <p className="font-medium">{d.confirmDelete}</p>
                    <p className="text-sm text-muted-foreground">{d.confirmText}</p>
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "mt-3 bg-destructive hover:bg-destructive/90"
                      )}
                    >
                      {d.confirmYes}
                    </button>
                  </form>
                </details>
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
    <main className="container-page max-w-3xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </>
        }
      >
        <MyProducts />
      </Suspense>
    </main>
  );
}
