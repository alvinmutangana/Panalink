import { getDeliveryLabels } from "../lib/delivery-i18n";

export default async function DeliveryBadge({ value }: { value?: string }) {
  if (value !== "nationwide") return null;
  const dl = await getDeliveryLabels();

  return (
    <p className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {dl.badge}
    </p>
  );
}
