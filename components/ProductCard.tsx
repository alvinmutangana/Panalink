import type { Product } from "../lib/queries";

export default function ProductCard({
  p,
  categoryLabel,
  verifiedLabel,
  byLabel,
}: {
  p: Product;
  categoryLabel: string;
  verifiedLabel: string;
  byLabel: string;
}) {
  return (
    <li>
      <a
        href={`/listings/${p.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-card"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt=""
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center text-5xl font-semibold text-primary/30"
            >
              {p.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
          <h3 className="line-clamp-2 text-base font-medium leading-snug">
            {p.title}
          </h3>
          <p className="price text-lg text-primary">
            {p.price.toLocaleString()} RWF
          </p>

          <div className="mt-auto space-y-0.5 pt-2 text-sm text-muted-foreground">
            <p className="flex flex-wrap items-center gap-x-1.5">
              <span>
                {byLabel} {p.sellerName}
              </span>
              {p.verified && (
                <span className="inline-flex items-center gap-1 font-medium text-success">
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {verifiedLabel}
                </span>
              )}
            </p>
            <p>
              {p.district} · {categoryLabel}
            </p>
          </div>
        </div>
      </a>
    </li>
  );
}
