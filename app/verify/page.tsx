import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { sellerVerifications } from "../../db/schema";
import { getAuthLabels } from "../../lib/auth-i18n";
import { control, label } from "../../lib/ui";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { submitVerification } from "./actions";

async function VerifyContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const [a, [record]] = await Promise.all([
    getAuthLabels(),
    db
      .select()
      .from(sellerVerifications)
      .where(eq(sellerVerifications.userId, session.user.id)),
  ]);

  const status = record?.status;

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="text-3xl">{a.verifyTitle}</h1>
      <p className="mt-2 text-muted-foreground">{a.verifyIntro}</p>

      <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        {status === "approved" && (
          <div role="status">
            <h2 className="text-xl text-success">{a.approvedTitle}</h2>
            <p className="mt-2">{a.approvedText}</p>
            <a href="/listings/new" className={cn(buttonVariants({ size: "lg" }), "mt-5")}>
              {a.createListing}
            </a>
          </div>
        )}

        {status === "pending" && (
          <div role="status">
            <h2 className="text-xl">{a.pendingTitle}</h2>
            <p className="mt-2 text-muted-foreground">{a.pendingText}</p>
          </div>
        )}

        {status !== "approved" && status !== "pending" && (
          <>
            {status === "rejected" && (
              <div
                role="alert"
                className="mb-5 rounded-md bg-destructive/10 px-3 py-2 text-destructive"
              >
                <p className="font-medium">{a.rejectedTitle}</p>
                <p className="text-sm">{a.rejectedText}</p>
              </div>
            )}

            <form action={submitVerification} className="flex flex-col gap-4">
              <div>
                <label htmlFor="id-number" className={label}>
                  {a.idLabel}
                </label>
                <input
                  id="id-number"
                  name="idNumber"
                  inputMode="numeric"
                  pattern="[0-9 ]{16,19}"
                  maxLength={19}
                  autoComplete="off"
                  required
                  aria-describedby="id-hint"
                  className={control}
                />
                <p id="id-hint" className="mt-1.5 text-sm text-muted-foreground">
                  {a.idHint}
                </p>
              </div>

              <button
                type="submit"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                {a.submitVerify}
              </button>

              <p className="text-sm text-muted-foreground">{a.privacy}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="container-page py-10 sm:py-14">
      <Suspense
        fallback={<Skeleton className="mx-auto h-80 w-full max-w-lg rounded-xl" />}
      >
        <VerifyContent />
      </Suspense>
    </main>
  );
}
