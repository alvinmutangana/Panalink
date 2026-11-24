export default function Stars({ value, label }: { value: number; label: string }) {
  const full = Math.round(value);
  return (
    <span role="img" aria-label={label} className="inline-flex text-lg leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= full ? "text-primary" : "text-foreground/20"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
