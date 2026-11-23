import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "../../../lib/auth";
import { getDict } from "../../../lib/i18n";
import { getDetail } from "../../../lib/detail-i18n";
import { getPhotoLabels } from "../../../lib/photos-i18n";
import { getProduct } from "../../../lib/product";
import { control, label } from "../../../lib/ui";
import { startConversation } from "../../messages/actions";
import { placeOrder } from "../../orders/actions";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import Gallery from "../../../components/Gallery";
import { cn } from "../../../lib/utils";

function Check() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, d, p, product, session] = await Promise.all([
    getDict(),
    getDetail(),
    getPhotoLabels(),
    getProduct(id),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!product) notFound();

  const me = session?.user.id;
  const isOwner = me === product.sellerId;
  const categoryLabel =
    t.categories[product.category as keyof typeof t.categories] ?? product.category;

  return (
    <>
      <a
        href="/listings"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {d.back}
      </a>

      <div className="mt-2 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <Gallery images={product.photos} title={product.title} showLabel={p.show} />

        <div>
          <p className="text-sm text-muted-foreground">{categoryLabel}</p>
          <h1 className="mt-1 text-3xl text-balance">{product.title}</h1>
          <p className="price mt-3 text-3xl text-primary">
            {product.price.toLocaleString()} RWF
          </p>

          {product.description && (
            <p className="mt-5 whitespace-pre-line text-base">
              {product.description}
            </p>
          )}

          <section
            aria-labelledby="seller-heading"
            className="mt-6 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <h2
              id="seller-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              {d.soldBy}
            </h2>
            <p className="mt-1 text-lg font-medium">{product.sellerName}</p>
            <p className="mt-1">
              {product.verified ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <Check />
                  {d.verified}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{d.notVerified}</span>
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {d.location}: {product.sellerDistrict ?? product.district}
            </p>
          </section>

          <div className="mt-6">
            {isOwner ? (
              <div className="rounded-xl bg-secondary p-4">
                <p>{d.yourListing}</p>
                <a
                  href={`/listings/${product.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
                >
                  {d.edit}
                </a>
              </div>
            ) : session ? (
              <div className="flex flex-col gap-3">
                <form
                  action={placeOrder}
                  className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <input type="hidden" name="listingId" value={product.id} />
                  <h2 className="text-lg font-medium">{d.orderTitle}</h2>
                  <div className="mt-3 flex items-end gap-3">
                    <div>
                      <label htmlFor="qty" className={label}>
                        {d.quantity}
                      </label>
                      <input
                        id="qty"
                        name="quantity"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={1000}
                        defaultValue={1}
                        required
                        className={cn(control, "w-28")}
                      />
                    </div>
                    <button
                      type="submit"
                      className={cn(buttonVariants({ size: "lg" }), "flex-1")}
                    >
                      {d.placeOrder}
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{d.orderHelp}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.testNote}</p>
                </form>

                <form action={startConversation}>
                  <input type="hidden" name="listingId" value={product.id} />
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full"
                    )}
                  >
                    {d.message}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-xl bg-secondary p-4">
                <p>{d.loginPrompt}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href="/login" className={buttonVariants()}>
                    {d.login}
                  </a>
                  <a href="/signup" className={buttonVariants({ variant: "outline" })}>
                    {d.signup}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="container-page py-6">
      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </main>
  );
}
