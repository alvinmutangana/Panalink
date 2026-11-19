import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { conversations, listings, messages, user } from "../../db/schema";
import { getLang } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const extra = {
  en: { title: "Messages", empty: "No conversations yet.", noMsg: "No messages yet", you: "You" },
  fr: { title: "Messages", empty: "Aucune conversation.", noMsg: "Aucun message", you: "Vous" },
  rw: { title: "Ubutumwa", empty: "Nta biganiro biraba.", noMsg: "Nta butumwa buraba", you: "Wowe" },
};

async function Inbox() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;
  const x = extra[await getLang()];

  const convos = await db
    .select({
      id: conversations.id,
      buyerId: conversations.buyerId,
      sellerId: conversations.sellerId,
      createdAt: conversations.createdAt,
      listingTitle: listings.title,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .where(or(eq(conversations.buyerId, me), eq(conversations.sellerId, me)));

  const otherIds = [
    ...new Set(convos.map((c) => (c.buyerId === me ? c.sellerId : c.buyerId))),
  ];
  const others = otherIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, otherIds))
    : [];
  const nameOf = new Map(others.map((o) => [o.id, o.name]));

  const items = await Promise.all(
    convos.map(async (c) => {
      const [last] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      const otherId = c.buyerId === me ? c.sellerId : c.buyerId;
      return {
        ...c,
        otherName: nameOf.get(otherId) ?? "?",
        last,
        activity: (last?.createdAt ?? c.createdAt).getTime(),
      };
    })
  );
  items.sort((a, b) => b.activity - a.activity);

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{x.title}</h1>

      {items.length === 0 ? (
        <p>{x.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id}>
              <a href={`/messages/${c.id}`} className="block rounded border p-4">
                <p className="font-semibold">{c.otherName}</p>
                <p className="text-sm opacity-70">{c.listingTitle}</p>
                <p className="mt-1 text-sm">
                  {c.last
                    ? `${c.last.senderId === me ? x.you + ": " : ""}${c.last.body}`
                    : x.noMsg}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function InboxPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Inbox />
      </Suspense>
    </main>
  );
}
