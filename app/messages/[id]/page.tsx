import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { conversations, listings, messages, user } from "../../../db/schema";
import { getLang } from "../../../lib/i18n";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { sendMessage } from "../actions";

const extra = {
  en: { with: "Conversation with", about: "About", placeholder: "Write a message...", send: "Send", empty: "No messages yet. Say hello!" },
  fr: { with: "Conversation avec", about: "À propos de", placeholder: "Écrire un message...", send: "Envoyer", empty: "Aucun message. Dites bonjour !" },
  rw: { with: "Ikiganiro na", about: "Kuri", placeholder: "Andika ubutumwa...", send: "Ohereza", empty: "Nta butumwa buraba. Muramutse!" },
};

async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;
  const lang = await getLang();
  const x = extra[lang];

  const [convo] = await db
    .select({
      id: conversations.id,
      buyerId: conversations.buyerId,
      sellerId: conversations.sellerId,
      listingId: conversations.listingId,
      listingTitle: listings.title,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .where(eq(conversations.id, id));

  if (!convo || (convo.buyerId !== me && convo.sellerId !== me)) notFound();

  const otherId = convo.buyerId === me ? convo.sellerId : convo.buyerId;
  const [other] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, otherId));

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return (
    <>
      <LanguageSwitcher />
      <h1 className="text-xl font-bold">
        {x.with} {other?.name}
      </h1>
      <p className="mb-4 text-sm opacity-70">
        {x.about}{" "}
        <a href={`/listings/${convo.listingId}`} className="underline">
          {convo.listingTitle}
        </a>
      </p>

      <div className="mb-4 flex flex-col gap-2">
        {rows.length === 0 && <p>{x.empty}</p>}
        {rows.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded p-3 ${
              m.senderId === me ? "ml-auto bg-green-800" : "bg-gray-800"
            }`}
          >
            {m.body}
          </div>
        ))}
      </div>

      <form action={sendMessage} className="flex gap-2">
        <input type="hidden" name="conversationId" value={convo.id} />
        <input
          name="body"
          placeholder={x.placeholder}
          maxLength={1000}
          required
          className="flex-1 rounded border p-3"
        />
        <button className="rounded bg-green-700 px-4 text-white">{x.send}</button>
      </form>
    </>
  );
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Thread params={params} />
      </Suspense>
    </main>
  );
}
