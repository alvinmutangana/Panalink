import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../db";
import { listings } from "../../../../db/schema";
import { getDict } from "../../../../lib/i18n";
import { getDashLabels } from "../../../../lib/dash-i18n";
import { getPhotoLabels } from "../../../../lib/photos-i18n";
import { updateListing } from "./actions";
import ListingForm from "../../../../components/ListingForm";
import { Skeleton } from "../../../../components/ui/skeleton";

async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.sellerId, session.user.id)));

  if (!listing) notFound();

  const [t, d, photoLabels] = await Promise.all([
    getDict(),
    getDashLabels(),
    getPhotoLabels(),
  ]);

  const photos = listing.images.length
    ? listing.images
    : listing.imageUrl
      ? [listing.imageUrl]
      : [];

  return (
    <>
      <h1 className="text-3xl">{d.formEdit}</h1>
      <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <ListingForm
          action={updateListing}
          mode="edit"
          t={t}
          d={d}
          photoLabels={photoLabels}
          values={{
            id: listing.id,
            title: listing.title,
            description: listing.description ?? "",
            category: listing.category,
            price: listing.price,
            district: listing.district,
            photos,
          }}
        />
      </div>
    </>
  );
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="container-page max-w-2xl py-8">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <EditListing params={params} />
      </Suspense>
    </main>
  );
}
