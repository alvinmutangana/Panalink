import { Suspense } from "react";
import { getAdminLabels } from "../../../lib/admin-i18n";
import { getPendingRequests, requireAdmin } from "../../../lib/admin";
import { getLang } from "../../../lib/i18n";
import { shortDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { reviewVerification } from "./actions";

async function Requests() {
  await requireAdmin();
  const [a, lang, rows] = await Promise.all([
    getAdminLabels(),
    getLang(),
    getPendingRequests(),
  ]);

  return (
    <>
      <h1 className="text-3xl">{a.reqTitle}</h1>
      <p className="mt-2 text-muted-foreground">{a.approveNote}</p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-medium">{a.reqEmpty}</h2>
          <p className="mt-1 text-muted-foreground">{a.reqEmptyText}</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {rows.map((r) => (
            <li
              key={r.userId}
              className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium">{r.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {r.email} · {r.district}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.submitted} {shortDate(r.submittedAt, lang)}
                </p>
              </div>

              <dl className="mt-4">
                <dt className="text-sm text-muted-foreground">{a.idNumber}</dt>
                <dd className="mt-1 font-mono text-lg tracking-wider">{r.idNumber}</dd>
              </dl>

              <div className="mt-4 flex flex-wrap items-start gap-3">
                <form action={reviewVerification}>
                  <input type="hidden" name="userId" value={r.userId} />
                  <input type="hidden" name="decision" value="approved" />
                  <button type="submit" className={buttonVariants()}>
                    {a.approve}
                  </button>
                </form>

                <details>
                  <summary
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "cursor-pointer list-none text-destructive [&::-webkit-details-marker]:hidden"
                    )}
                  >
                    {a.reject}
                  </summary>
                  <form
                    action={reviewVerification}
                    className="mt-3 rounded-lg bg-destructive/10 p-3"
                  >
                    <input type="hidden" name="userId" value={r.userId} />
                    <input type="hidden" name="decision" value="rejected" />
                    <p className="font-medium">{a.rejectConfirm}</p>
                    <p className="text-sm text-muted-foreground">{a.rejectConfirmText}</p>
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "mt-3 bg-destructive hover:bg-destructive/90"
                      )}
                    >
                      {a.rejectYes}
                    </button>
                  </form>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function VerificationsPage() {
  return (
    <main className="container-page max-w-5xl py-8">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-80" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </>
        }
      >
        <Requests />
      </Suspense>
    </main>
  );
}
