import { cancelOrder, payOrder, respondToOrder } from "../app/orders/actions";
import type { OrderLabels } from "../lib/orders-i18n";
import { control, label } from "../lib/ui";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";
import StatusBadge from "./StatusBadge";

export type OrderView = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: string;
  listingId: string;
  listingTitle: string;
  imageUrl: string | null;
  otherName: string;
  dateText: string;
  lastPaymentFailed: boolean;
};

const PROGRESS: Record<string, number> = { pending: 1, accepted: 2, paid: 3 };

export default function OrderCard({
  order,
  role,
  o,
}: {
  order: OrderView;
  role: "buyer" | "seller";
  o: OrderLabels;
}) {
  const statusLabel =
    o.status[order.status as keyof typeof o.status] ?? order.status;
  const progress = PROGRESS[order.status] ?? 0;
  const steps = [o.stepPlaced, o.stepAccepted, o.stepPaid];

  return (
    <li className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-20">
          {order.imageUrl ? (
            <img
              src={order.imageUrl}
              alt=""
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center text-2xl font-semibold text-primary/30"
            >
              {order.listingTitle.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <a
              href={`/listings/${order.listingId}`}
              className="min-w-0 break-words text-lg font-medium leading-snug underline-offset-4 hover:underline"
            >
              {order.listingTitle}
            </a>
            <StatusBadge status={order.status} label={statusLabel} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "buyer" ? o.seller : o.buyer}: {order.otherName}
          </p>
          <p className="text-sm text-muted-foreground">
            {o.placedOn} {order.dateText}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{o.qty}</dt>
          <dd className="price">{order.quantity}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{o.unit}</dt>
          <dd className="price">{order.unitPrice.toLocaleString()} RWF</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{o.total}</dt>
          <dd className="price text-primary">{order.total.toLocaleString()} RWF</dd>
        </div>
      </dl>

      {progress > 0 && (
        <ol aria-label={statusLabel} className="mt-4 flex items-center gap-2 text-xs">
          {steps.map((s, i) => (
            <li
              key={s}
              aria-current={i === progress - 1 ? "step" : undefined}
              className="flex flex-1 items-center gap-2 last:flex-none"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  i < progress
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className={i < progress ? "font-medium" : "text-muted-foreground"}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("h-px flex-1", i + 1 < progress ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          ))}
        </ol>
      )}

      {/* Seller: review a new order */}
      {role === "seller" && order.status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={respondToOrder}>
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="decision" value="accepted" />
            <button type="submit" className={buttonVariants()}>
              {o.accept}
            </button>
          </form>
          <form action={respondToOrder}>
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="decision" value="declined" />
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }), "text-destructive")}
            >
              {o.decline}
            </button>
          </form>
        </div>
      )}

      {/* Seller: waiting for payment */}
      {role === "seller" && order.status === "accepted" && (
        <p className="mt-4 text-sm text-muted-foreground">{o.waitingPay}</p>
      )}

      {/* Buyer: cancel a pending order */}
      {role === "buyer" && order.status === "pending" && (
        <form action={cancelOrder} className="mt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "outline" }), "text-destructive")}
          >
            {o.cancel}
          </button>
        </form>
      )}

      {/* Buyer: pay an accepted order */}
      {role === "buyer" && order.status === "accepted" && (
        <form action={payOrder} className="mt-4 rounded-lg bg-secondary/60 p-4">
          <input type="hidden" name="orderId" value={order.id} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-medium">{o.payTitle}</h3>
            <span className="rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-medium">
              {o.testBadge}
            </span>
          </div>

          {order.lastPaymentFailed && (
            <p
              role="alert"
              className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {o.payFailed}
            </p>
          )}

          <label htmlFor={`phone-${order.id}`} className={cn(label, "mt-3")}>
            {o.phoneLabel}
          </label>
          <input
            id={`phone-${order.id}`}
            name="phone"
            inputMode="numeric"
            pattern="07[2389][0-9]{7}"
            maxLength={10}
            autoComplete="tel-national"
            required
            aria-describedby={`phone-hint-${order.id}`}
            className={control}
          />
          <p
            id={`phone-hint-${order.id}`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {o.phoneHint}
          </p>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
          >
            {o.payBtn} · {order.total.toLocaleString()} RWF
          </button>
          <p className="mt-2 text-sm text-muted-foreground">{o.testNote}</p>
        </form>
      )}
    </li>
  );
}