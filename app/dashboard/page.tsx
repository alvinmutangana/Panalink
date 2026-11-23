import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { getDict } from "../../lib/i18n";
import { getDashLabels } from "../../lib/dash-i18n";
import { getBuyerStats, getSellerStats } from "../../lib/dashboard";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import SignOutButton from "./sign-out-button";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <dd className="price text-2xl text-primary">{value}</dd>
      <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}

function Action({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex min-h-14 items-center justify-between rounded-xl bg-secondary px-4 py-3 text-lg font-medium text-secondary-foreground hover:bg-secondary/70"
    >
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}

async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { user } = session;
  const isSeller = user.role === "seller";
  const isAdmin = user.role === "admin";

  const [t, d] = await Promise.all([getDict(), getDashLabels()]);
  const roleLabel = t.roles[user.role as keyof typeof t.roles] ?? user.role;

  const seller = isSeller ? await getSellerStats(user.id) : null;
  const buyer = !isSeller ? await getBuyerStats(user.id) : null;

  const verifText = seller
    ? {
        none: d.verifNone,
        pending: d.verifPending,
        rejected: d.verifRejected,
        approved: d.verifApproved,
      }[seller.verification] ?? d.verifNone
    : "";

  return (
    <>
      <h1 className="text-3xl">
        {d.welcome}, {user.name}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {roleLabel} · {user.district}
      </p>

      {seller && (
        <section
          aria-labelledby="verif-heading"
          className={cn(
            "mt-6 rounded-xl p-4 ring-1",
            seller.verification === "approved"
              ? "bg-success/10 ring-success/30"
              : seller.verification === "rejected"
                ? "bg-destructive/10 ring-destructive/30"
                : "bg-warning/10 ring-warning/30"
          )}
        >
          <h2 id="verif-heading" className="text-base font-medium">
            {d.verifTitle}
          </h2>
          <p className="mt-1 text-sm">{verifText}</p>
          {(seller.verification === "none" || seller.verification === "rejected") && (
            <a href="/verify" className={cn(buttonVariants({ size: "sm" }), "mt-3")}>
              {d.verifyNow}
            </a>
          )}
        </section>
      )}

      <h2 className="mt-8 text-xl">
        {seller ? d.sellerOverview : d.buyerOverview}
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {seller && (
          <>
            <Stat value={seller.products} label={d.products} />
            <Stat value={seller.toReview} label={d.toReview} />
            <Stat value={seller.paid} label={d.paid} />
            <Stat value={`${seller.paidTotal.toLocaleString()} RWF`} label={d.paidTotal} />
          </>
        )}
        {buyer && (
          <>
            <Stat value={buyer.placed} label={d.placed} />
            <Stat value={buyer.awaiting} label={d.awaitingPay} />
            <Stat value={buyer.conversations} label={d.convos} />
          </>
        )}
      </dl>

      <nav aria-label={d.welcome} className="mt-8 grid gap-3 sm:grid-cols-2">
        {isSeller && <Action href="/listings/new">{d.addProduct}</Action>}
        {isSeller && <Action href="/listings/mine">{d.myProducts}</Action>}
        <Action href="/orders">{d.orders}</Action>
        <Action href="/messages">{d.messages}</Action>
        <Action href="/listings">{d.browse}</Action>
        {isAdmin && <Action href="/admin">{d.adminArea}</Action>}
      </nav>

      <div className="mt-10">
        <SignOutButton label={d.signOut} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="container-page max-w-3xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-6 h-24 w-full rounded-xl" />
            <Skeleton className="mt-6 h-32 w-full rounded-xl" />
          </>
        }
      >
        <Dashboard />
      </Suspense>
    </main>
  );
}
