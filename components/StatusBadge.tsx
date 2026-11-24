const tone: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-primary/10 text-primary",
  payment_submitted: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  delivering: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export default function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        tone[status] ?? tone.cancelled
      }`}
    >
      {label}
    </span>
  );
}
