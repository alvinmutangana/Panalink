import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { conversations, listings, messages, user } from "../../../db/schema";
import { getOrderLabels } from "../../../lib/orders-i18n";
import { control, label } from "../../../lib/ui";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import ScrollToEnd from "../../../components/ScrollToEnd";
import { sendMessage } from "../actions";

async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const me = session.user.id;
  const o = await getOrderLabels();

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href="/messages"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {o.backInbox}
        </a>
        <a
          href={`/messages/${convo.id}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {o.refresh}
        </a>
      </div>

      <header className="mt-1">
        <h1 className="text-2xl">
          {o.conversationWith} {other?.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {o.about}{" "}
          <a
            href={`/listings/${convo.listingId}`}
            className="font-medium text-primary underline underline-offset-4"
          >
            {convo.listingTitle}
          </a>
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            {o.threadEmpty}
          </p>
        )}
        {rows.map((m) => {
          const mine = m.senderId === me;
          return (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5",
                mine
                  ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-card ring-1 ring-foreground/10"
              )}
            >
              {m.body}
            </div>
          );
        })}
      </div>

      <form
        action={sendMessage}
        className="sticky bottom-0 mt-6 flex items-end gap-2 bg-background pb-3 pt-3"
      >
        <input type="hidden" name="conversationId" value={convo.id} />
        <div className="flex-1">
          <label htmlFor="msg-body" className="sr-only">
            {o.writeLabel}
          </label>
          <textarea
            id="msg-body"
            name="body"
            rows={2}
            required
            maxLength={1000}
            placeholder={o.writeLabel}
            className={cn(control, "py-2")}
          />
        </div>
        <button type="submit" className={buttonVariants({ size: "lg" })}>
          {o.send}
        </button>
      </form>
      <ScrollToEnd />
    </>
  );
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="container-page max-w-3xl py-6">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-6 h-16 w-2/3 rounded-2xl" />
            <Skeleton className="ml-auto mt-2 h-16 w-1/2 rounded-2xl" />
          </>
        }
      >
        <Thread params={params} />
      </Suspense>
    </main>
  );
}
