import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { getPayLabels } from "../../lib/pay-i18n";
import { getPaymentMethod } from "../../lib/payment-methods";
import { control, label } from "../../lib/ui";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { savePaymentMethod } from "./actions";

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const [p, method, sp] = await Promise.all([
    getPayLabels(),
    getPaymentMethod(session.user.id),
    searchParams,
  ]);

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="text-3xl">{p.detailsTitle}</h1>
      <p className="mt-2 text-muted-foreground">{p.detailsIntro}</p>

      {sp.saved === "1" && (
        <p
          role="status"
          className="mt-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success"
        >
          {p.saved}
        </p>
      )}

      <form
        action={savePaymentMethod}
        className="mt-6 flex flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
      >
        <div>
          <label htmlFor="pm-provider" className={label}>
            {p.providerLabel}
          </label>
          <select
            id="pm-provider"
            name="provider"
            defaultValue={method?.provider ?? "mtn"}
            className={control}
          >
            <option value="mtn">{p.providers.mtn}</option>
            <option value="airtel">{p.providers.airtel}</option>
          </select>
        </div>

        <div>
          <label htmlFor="pm-number" className={label}>
            {p.numberLabel}
          </label>
          <input
            id="pm-number"
            name="number"
            inputMode="numeric"
            pattern="[0-9 ]{5,16}"
            required
            autoComplete="off"
            defaultValue={method?.number ?? ""}
            aria-describedby="pm-number-hint"
            className={control}
          />
          <p id="pm-number-hint" className="mt-1.5 text-sm text-muted-foreground">
            {p.numberHint}
          </p>
        </div>

        <div>
          <label htmlFor="pm-name" className={label}>
            {p.nameLabel}
          </label>
          <input
            id="pm-name"
            name="accountName"
            required
            minLength={2}
            maxLength={60}
            autoComplete="off"
            defaultValue={method?.accountName ?? ""}
            aria-describedby="pm-name-hint"
            className={control}
          />
          <p id="pm-name-hint" className="mt-1.5 text-sm text-muted-foreground">
            {p.nameHint}
          </p>
        </div>

        <button type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          {p.save}
        </button>
      </form>
    </div>
  );
}

export default function PaymentDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  return (
    <main className="container-page py-10">
      <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-lg rounded-xl" />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
