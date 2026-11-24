import { avg, count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { reviews, user } from "../db/schema";
import { getRatingLabels } from "../lib/rating-i18n";
import { getLang } from "../lib/i18n";
import { shortDate } from "../lib/format";
import Stars from "./Stars";

export default async function SellerReviews({ sellerId }: { sellerId: string }) {
  const [x, lang, [agg], recent] = await Promise.all([
    getRatingLabels(),
    getLang(),
    db
      .select({ avg: avg(reviews.rating), n: count() })
      .from(reviews)
      .where(eq(reviews.sellerId, sellerId)),
    db
      .select({
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        buyerName: user.name,
      })
      .from(reviews)
      .innerJoin(user, eq(user.id, reviews.buyerId))
      .where(eq(reviews.sellerId, sellerId))
      .orderBy(desc(reviews.createdAt))
      .limit(3),
  ]);

  const n = agg.n;
  const average = agg.avg ? Number(agg.avg) : 0;

  return (
    <section aria-labelledby="reviews-heading" className="mt-6">
      <h2 id="reviews-heading" className="text-lg">
        {x.title}
      </h2>

      {n === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{x.none}</p>
      ) : (
        <>
          <p className="mt-2 flex items-center gap-2">
            <Stars value={average} label={`${average.toFixed(1)} ${x.outOf}`} />
            <span className="text-sm">
              {average.toFixed(1)} · {n} {n === 1 ? x.one : x.many}
            </span>
          </p>

          <ul className="mt-3 flex flex-col gap-3">
            {recent.map((r, i) => (
              <li key={i} className="rounded-lg bg-card p-3 ring-1 ring-foreground/10">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{r.buyerName.split(" ")[0]}</span>
                  <span className="text-muted-foreground">
                    {shortDate(r.createdAt, lang)}
                  </span>
                </div>
                <Stars value={r.rating} label={`${r.rating} ${x.outOf}`} />
                {r.comment && (
                  <p className="mt-1 whitespace-pre-line text-sm">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
