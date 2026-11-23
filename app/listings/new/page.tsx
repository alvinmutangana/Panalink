import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { isApprovedSeller } from "../../../lib/seller";
import { getDict } from "../../../lib/i18n";
import { getPhotoLabels } from "../../../lib/photos-i18n";
import { createListing } from "./actions";
import PhotoUploader from "../../../components/PhotoUploader";

async function ListingForm() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");
  if (!(await isApprovedSeller(session.user.id))) redirect("/verify");

  const [t, photoLabels] = await Promise.all([getDict(), getPhotoLabels()]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{t.createTitle}</h1>
      <form action={createListing} className="flex flex-col gap-4">
        <PhotoUploader labels={photoLabels} />
        <input name="title" placeholder={t.whatSelling} required className="rounded border p-3" />
        <textarea name="description" placeholder={t.shortDesc} rows={3} className="rounded border p-3" />
        <select name="category" className="rounded border p-3">
          <option value="agriculture">{t.categories.agriculture}</option>
          <option value="crafts">{t.categories.crafts}</option>
          <option value="food">{t.categories.food}</option>
          <option value="other">{t.categories.other}</option>
        </select>
        <input name="price" type="number" min={1} placeholder={t.pricePlaceholder} required className="rounded border p-3" />
        <input name="district" defaultValue={session.user.district ?? ""} placeholder={t.district} required className="rounded border p-3" />
        <button className="rounded bg-green-700 p-3 text-white">{t.publish}</button>
      </form>
    </>
  );
}

export default function NewListingPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <ListingForm />
      </Suspense>
    </main>
  );
}
