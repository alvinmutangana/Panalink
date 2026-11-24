import { Suspense } from "react";
import { getAdminLabels } from "../../lib/admin-i18n";
import { getOverview, requireAdmin } from "../../lib/admin";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <dd className="price text-3xl text-primary">{value.toLocaleString()}</dd>
      <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}

async function Overview() {
  await requireAdmin();
  const [a, s] = await Promise.all([getAdminLabels(), getOverview()]);

  return (
    <>
      <h1 className="text-3xl">{a.overviewTitle}</h1>

      <section
        aria-labelledby="attention-heading"
        className={cn(
          "mt-6 rounded-xl p-4 ring-1",
          s.pending > 0
            ? "bg-warning/10 ring-warning/30"
            : "bg-success/10 ring-success/30"
        )}
      >
        <h2 id="attention-heading" className="text-base font-medium">
          {a.attentionTitle}
        </h2>
        <p className="mt-1 text-sm">
          {s.pending > 0 ? a.pendingLine(s.pending) : a.attentionNone}
        </p>
        {s.pending > 0 && (
          <a
            href="/admin/verifications"
            className={cn(buttonVariants({ size: "sm" }), "mt-3")}
          >
            {a.reviewNow}
          </a>
        )}
      </section>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value={s.sellers} label={a.statSellers} />
        <Stat value={s.verified} label={a.statVerified} />
        <Stat value={s.buyers} label={a.statBuyers} />
        <Stat value={s.products} label={a.statProducts} />
        <Stat value={s.orders} label={a.statOrders} />
        <Stat value={s.paid} label={a.statPaid} />
      </dl>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="container-page max-w-5xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-6 h-24 w-full rounded-xl" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </>
        }
      >
        <Overview />
      </Suspense>
    </main>
  );
}
