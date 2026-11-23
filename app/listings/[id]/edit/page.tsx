import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../db";
import { listings } from "../../../../db/schema";
import { getDict } from "../../../../lib/i18n";
import { getPhotoLabels } from "../../../../lib/photos-i18n";
import { updateListing } from "./actions";
import PhotoUploader from "../../../../components/PhotoUploader";

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.sellerId, session.user.id)));

  if (!listing) notFound();

  const [t, photoLabels] = await Promise.all([getDict(), getPhotoLabels()]);
  const initial = listing.images.length
    ? listing.images
    : listing.imageUrl
      ? [listing.imageUrl]
      : [];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{t.editTitle}</h1>
      <form action={updateListing} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={listing.id} />
        <PhotoUploader initial={initial} labels={photoLabels} />
        <input name="title" defaultValue={listing.title} required className="rounded border p-3" />
        <textarea name="description" defaultValue={listing.description ?? ""} rows={3} className="rounded border p-3" />
        <select name="category" defaultValue={listing.category} className="rounded border p-3">
          <option value="agriculture">{t.categories.agriculture}</option>
          <option value="crafts">{t.categories.crafts}</option>
          <option value="food">{t.categories.food}</option>
          <option value="other">{t.categories.other}</option>
        </select>
        <input name="price" type="number" min={1} defaultValue={listing.price} required className="rounded border p-3" />
        <input name="district" defaultValue={listing.district} required className="rounded border p-3" />
        <button className="rounded bg-green-700 p-3 text-white">{t.save}</button>
      </form>
    </>
  );
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}
