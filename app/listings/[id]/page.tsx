import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { listings, user } from "../../../db/schema";
import { getDict, getLang } from "../../../lib/i18n";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { startConversation } from "../../messages/actions";

const extra = {
  en: { soldBy: "Sold by", back: "← Back to listings", message: "Message seller", login: "Log in to message the seller" },
  fr: { soldBy: "Vendu par", back: "← Retour aux annonces", message: "Contacter le vendeur", login: "Connectez-vous pour contacter le vendeur" },
  rw: { soldBy: "Acuruzwa na", back: "← Subira ku bicuruzwa", message: "Andikira umucuruzi", login: "Injira kugira ngo wandikire umucuruzi" },
};

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getDict();
  const lang = await getLang();
  const x = extra[lang];

  const session = await auth.api.getSession({ headers: await headers() });

  const [row] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
      description: listings.description,
      category: listings.category,
      price: listings.price,
      district: listings.district,
      imageUrl: listings.imageUrl,
      sellerName: user.name,
    })
    .from(listings)
    .innerJoin(user, eq(user.id, listings.sellerId))
    .where(eq(listings.id, id));

  if (!row) notFound();

  const catLabel =
    t.categories[row.category as keyof typeof t.categories] ?? row.category;

  return (
    <>
      <LanguageSwitcher />
      <a href="/listings" className="text-sm underline">
        {x.back}
      </a>

      {row.imageUrl && (
        <img
          src={row.imageUrl}
          alt={row.title}
          className="mt-4 h-64 w-full rounded object-cover"
        />
      )}

      <h1 className="mt-4 text-2xl font-bold">{row.title}</h1>
      <p className="text-sm opacity-70">
        {catLabel} · {row.district}
      </p>
      <p className="mt-2 text-xl font-bold">{row.price.toLocaleString()} RWF</p>
      {row.description && <p className="mt-4">{row.description}</p>}

      <p className="mt-6 text-sm">
        {x.soldBy} <strong>{row.sellerName}</strong>
      </p>

      {!session && (
        <a href="/login" className="mt-4 inline-block underline">
          {x.login}
        </a>
      )}
      {session && session.user.id !== row.sellerId && (
        <form action={startConversation} className="mt-4">
          <input type="hidden" name="listingId" value={row.id} />
          <button className="rounded bg-green-700 px-4 py-3 text-white">
            {x.message}
          </button>
        </form>
      )}
    </>
  );
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Detail params={params} />
      </Suspense>
    </main>
  );
}
