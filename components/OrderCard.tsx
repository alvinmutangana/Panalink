import { cancelOrder, respondToOrder } from "../app/orders/actions";
import {
  confirmReceived,
  markDelivering,
  submitReview,
} from "../app/orders/lifecycle";
import {
  confirmPayment,
  rejectPayment,
  submitPayment,
} from "../app/orders/payments";
import { raiseDispute } from "../app/orders/disputes";
import type { OrderLabels } from "../lib/orders-i18n";
import type { LifeLabels } from "../lib/lifecycle-i18n";
import type { PayLabels } from "../lib/pay-i18n";
import type { DisputeLabels } from "../lib/dispute-i18n";
import { control, label } from "../lib/ui";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";
import StatusBadge from "./StatusBadge";
import Stars from "./Stars";

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
  review: { rating: number; comment: string | null } | null;
  payment: { provider: string; reference: string; status: string } | null;
  payTo: { provider: string; number: string; accountName: string } | null;
  dispute: { status: string; reason: string; resolution: string | null } | null;
};

const PROGRESS: Record<string, number> = {
  pending: 1,
  accepted: 2,
  payment_submitted: 2,
  paid: 3,
  delivering: 4,
  completed: 5,
};

const DISPUTABLE = ["payment_submitted", "paid", "delivering", "completed"];

export default function OrderCard({
  order,
  role,
  o,
  l,
  p,
  dp,
}: {
  order: OrderView;
  role: "buyer" | "seller";
  o: OrderLabels;
  l: LifeLabels;
  p: PayLabels;
  dp: DisputeLabels;
}) {
  const statusLabel =
    (l.status as Record<string, string>)[order.status] ??
    (p.status as Record<string, string>)[order.status] ??
    (o.status as Record<string, string>)[order.status] ??
    order.status;
  const progress = PROGRESS[order.status] ?? 0;
  const steps = [o.stepPlaced, o.stepAccepted, o.stepPaid, l.stepDelivery, l.stepCompleted];
  const providerName = (v: string) =>
    (p.providers as Record<string, string>)[v] ?? v;

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
              <span
                className={
                  i === progress - 1
                    ? "font-medium"
                    : "hidden text-muted-foreground sm:inline"
                }
              >
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

      {/* Seller: waiting for the buyer to pay */}
      {role === "seller" && order.status === "accepted" && (
        <p className="mt-4 text-sm text-muted-foreground">{o.waitingPay}</p>
      )}

      {/* Seller: verify the reported payment */}
      {role === "seller" && order.status === "payment_submitted" && order.payment && (
        <div className="mt-4 rounded-lg bg-warning/10 p-4">
          <h3 className="text-base font-medium">{p.sellerReported}</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">{p.network}</dt>
              <dd>{providerName(order.payment.provider)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{p.txId}</dt>
              <dd className="break-all font-mono">{order.payment.reference}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{p.amount}</dt>
              <dd className="price">{order.total.toLocaleString()} RWF</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">{p.sellerCheck}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action={confirmPayment}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className={buttonVariants()}>
                {p.gotMoney}
              </button>
            </form>
            <form action={rejectPayment}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline" }), "text-destructive")}
              >
                {p.noMoney}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Seller: paid, send it */}
      {role === "seller" && order.status === "paid" && (
        <form action={markDelivering} className="mt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <button type="submit" className={buttonVariants()}>
            {l.markSent}
          </button>
          <p className="mt-2 text-sm text-muted-foreground">{l.markSentHelp}</p>
        </form>
      )}

      {role === "seller" && order.status === "delivering" && (
        <p className="mt-4 text-sm text-muted-foreground">{l.waitingReceive}</p>
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

      {/* Buyer: pay the seller directly */}
      {role === "buyer" && order.status === "accepted" && (
        order.payTo ? (
          <form action={submitPayment} className="mt-4 rounded-lg bg-secondary/60 p-4">
            <input type="hidden" name="orderId" value={order.id} />
            <h3 className="text-base font-medium">{p.payTitle}</h3>

            {order.payment?.status === "rejected" && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {p.rejectedNote}
              </p>
            )}

            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>
                {p.sendExactly}{" "}
                <strong className="price">{order.total.toLocaleString()} RWF</strong>{" "}
                {p.to}{" "}
                <strong>
                  {providerName(order.payTo.provider)} {order.payTo.number}
                </strong>{" "}
                ({p.accountName}: {order.payTo.accountName})
              </li>
              <li>{p.step2}</li>
            </ol>

            <label htmlFor={`net-${order.id}`} className={cn(label, "mt-4")}>
              {p.networkLabel}
            </label>
            <select
              id={`net-${order.id}`}
              name="provider"
              defaultValue={order.payTo.provider}
              className={control}
            >
              <option value="mtn">{p.providers.mtn}</option>
              <option value="airtel">{p.providers.airtel}</option>
            </select>

            <label htmlFor={`ref-${order.id}`} className={cn(label, "mt-3")}>
              {p.refLabel}
            </label>
            <input
              id={`ref-${order.id}`}
              name="reference"
              required
              minLength={6}
              maxLength={30}
              pattern="[A-Za-z0-9._\-]{6,30}"
              autoComplete="off"
              aria-describedby={`ref-hint-${order.id}`}
              className={control}
            />
            <p
              id={`ref-hint-${order.id}`}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              {p.refHint}
            </p>

            <button
              type="submit"
              className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
            >
              {p.submitRef}
            </button>
            <p className="mt-2 text-sm text-muted-foreground">{p.payNote}</p>
          </form>
        ) : (
          <p className="mt-4 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {p.noMethodBuyer}
          </p>
        )
      )}

      {/* Buyer: waiting for the seller to confirm */}
      {role === "buyer" && order.status === "payment_submitted" && (
        <div className="mt-4 rounded-lg bg-secondary/60 p-4 text-sm">
          <p>{p.waitingConfirm}</p>
          {order.payment && (
            <p className="mt-1 text-muted-foreground">
              {providerName(order.payment.provider)} ·{" "}
              <span className="break-all font-mono">{order.payment.reference}</span>
            </p>
          )}
        </div>
      )}

      {/* Payment confirmed line */}
      {["paid", "delivering", "completed"].includes(order.status) &&
        order.payment?.status === "confirmed" && (
          <p className="mt-4 text-sm text-success">
            ✓ {p.paidLine} · {providerName(order.payment.provider)} ·{" "}
            <span className="break-all font-mono">{order.payment.reference}</span>
          </p>
        )}

      {/* Buyer: confirm receipt */}
      {role === "buyer" && order.status === "delivering" && (
        <form action={confirmReceived} className="mt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <button type="submit" className={buttonVariants({ size: "lg" })}>
            {l.confirmReceived}
          </button>
          <p className="mt-2 text-sm text-muted-foreground">{l.confirmHelp}</p>
        </form>
      )}

      {/* Review shown */}
      {order.status === "completed" && order.review && (
        <div className="mt-4 rounded-lg bg-secondary/60 p-4">
          <h3 className="text-base font-medium">
            {role === "buyer" ? l.yourReview : l.buyerReview}
          </h3>
          <p className="mt-1 flex items-center gap-2">
            <Stars
              value={order.review.rating}
              label={`${order.review.rating} ${l.outOf}`}
            />
            <span className="text-sm">{order.review.rating}/5</span>
          </p>
          {order.review.comment && (
            <p className="mt-2 whitespace-pre-line text-sm">{order.review.comment}</p>
          )}
        </div>
      )}

      {/* Buyer writes a review */}
      {role === "buyer" && order.status === "completed" && !order.review && (
        <form action={submitReview} className="mt-4 rounded-lg bg-secondary/60 p-4">
          <input type="hidden" name="orderId" value={order.id} />
          <fieldset>
            <legend className="text-base font-medium">{l.reviewTitle}</legend>
            <p className="mt-1 text-sm text-muted-foreground">{l.ratingLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-input bg-card px-3 font-medium has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input type="radio" name="rating" value={n} required className="sr-only" />
                  {n}
                  <span aria-hidden="true"> ★</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor={`comment-${order.id}`} className={cn(label, "mt-4")}>
            {l.commentLabel}
          </label>
          <textarea
            id={`comment-${order.id}`}
            name="comment"
            rows={3}
            maxLength={500}
            aria-describedby={`comment-hint-${order.id}`}
            className={cn(control, "py-2")}
          />
          <p
            id={`comment-hint-${order.id}`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {l.commentHint}
          </p>

          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
          >
            {l.submitReview}
          </button>
        </form>
      )}

      {/* Disputes */}
      {order.dispute ? (
        <div
          className={cn(
            "mt-4 rounded-lg p-4 text-sm",
            order.dispute.status === "resolved" ? "bg-success/10" : "bg-warning/10"
          )}
        >
          <h3 className="text-base font-medium">
            {order.dispute.status === "resolved" ? dp.resolvedTitle : dp.openTitle}
          </h3>
          <p className="mt-1 whitespace-pre-line">{order.dispute.reason}</p>
          {order.dispute.resolution && (
            <p className="mt-2 whitespace-pre-line">
              <strong>{dp.resolutionIs}:</strong> {order.dispute.resolution}
            </p>
          )}
        </div>
      ) : (
        DISPUTABLE.includes(order.status) && (
          <details className="mt-4">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-primary underline underline-offset-4">
              {dp.report}
            </summary>
            <form action={raiseDispute} className="mt-2 rounded-lg bg-secondary/60 p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <label htmlFor={`reason-${order.id}`} className={label}>
                {dp.reasonLabel}
              </label>
              <textarea
                id={`reason-${order.id}`}
                name="reason"
                rows={3}
                required
                minLength={10}
                maxLength={500}
                aria-describedby={`reason-hint-${order.id}`}
                className={cn(control, "py-2")}
              />
              <p
                id={`reason-hint-${order.id}`}
                className="mt-1.5 text-sm text-muted-foreground"
              >
                {dp.reasonHint}
              </p>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
              >
                {dp.send}
              </button>
            </form>
          </details>
        )
      )}
    </li>
  );
}
