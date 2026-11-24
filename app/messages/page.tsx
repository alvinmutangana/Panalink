import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { conversations, listings, messages, user } from "../../db/schema";
import { getLang } from "../../lib/i18n";
import { getOrderLabels } from "../../lib/orders-i18n";
import { shortDate } from "../../lib/format";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

async function Inbox() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;

  const [o, lang] = await Promise.all([getOrderLabels(), getLang()]);

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
  const nameOf = new Map(others.map((u) => [u.id, u.name]));

  const items = await Promise.all(
    convos.map(async (c) => {
      const [last] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      const otherId = c.buyerId === me ? c.sellerId : c.buyerId;
      const when = last?.createdAt ?? c.createdAt;
      return {
        ...c,
        otherName: nameOf.get(otherId) ?? "?",
        last,
        when,
      };
    })
  );
  items.sort((a, b) => b.when.getTime() - a.when.getTime());

  return (
    <>
      <h1 className="text-3xl">{o.msgTitle}</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-medium">{o.msgEmpty}</h2>
          <p className="mt-1 text-muted-foreground">{o.msgEmptyText}</p>
          <a href="/listings" className={cn(buttonVariants(), "mt-4")}>
            {o.emptyCta}
          </a>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id}>
              <a
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-secondary/50"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
                >
                  {c.otherName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">{c.otherName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {shortDate(c.when, lang)}
                    </span>
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {c.listingTitle}
                  </span>
                  <span className="block truncate text-sm">
                    {c.last
                      ? `${c.last.senderId === me ? o.you + ": " : ""}${c.last.body}`
                      : o.noMsgs}
                  </span>
                </span>
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
    <main className="container-page max-w-3xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="mt-6 h-24 w-full rounded-xl" />
            <Skeleton className="mt-3 h-24 w-full rounded-xl" />
          </>
        }
      >
        <Inbox />
      </Suspense>
    </main>
  );
}
