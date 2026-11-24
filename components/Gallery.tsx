export default function Gallery({
  images,
  title,
  showLabel,
}: {
  images: string[];
  title: string;
  showLabel: string;
}) {
  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary">
        <div
          aria-hidden="true"
          className="flex size-full items-center justify-center text-7xl font-semibold text-primary/30"
        >
          {title.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl bg-secondary [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <img
            key={src}
            id={`photo-${i + 1}`}
            src={src}
            alt={images.length > 1 ? `${title} (${i + 1}/${images.length})` : title}
            width={1024}
            height={768}
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full min-w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <li key={src}>
              <a
                href={`#photo-${i + 1}`}
                aria-label={`${showLabel} ${i + 1}`}
                className="block size-16 overflow-hidden rounded-md ring-1 ring-foreground/20 hover:ring-primary"
              >
                <img
                  src={src}
                  alt=""
                  width={128}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
