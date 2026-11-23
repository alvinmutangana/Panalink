import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { isApprovedSeller } from "../../../lib/seller";
import { getDict } from "../../../lib/i18n";
import { getDashLabels } from "../../../lib/dash-i18n";
import { getPhotoLabels } from "../../../lib/photos-i18n";
import { createListing } from "./actions";
import ListingForm from "../../../components/ListingForm";
import { Skeleton } from "../../../components/ui/skeleton";

async function NewListing() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");
  if (!(await isApprovedSeller(session.user.id))) redirect("/verify");

  const [t, d, photoLabels] = await Promise.all([
    getDict(),
    getDashLabels(),
    getPhotoLabels(),
  ]);

  return (
    <>
      <h1 className="text-3xl">{d.formNew}</h1>
      <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <ListingForm
          action={createListing}
          mode="new"
          t={t}
          d={d}
          photoLabels={photoLabels}
          values={{
            title: "",
            description: "",
            category: "agriculture",
            price: "",
            district: session.user.district ?? "",
            photos: [],
          }}
        />
      </div>
    </>
  );
}

export default function NewListingPage() {
  return (
    <main className="container-page max-w-2xl py-8">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <NewListing />
      </Suspense>
    </main>
  );
}
