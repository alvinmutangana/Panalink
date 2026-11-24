import { getDeliveryLabels } from "../lib/delivery-i18n";
import { control, label } from "../lib/ui";

export default async function DeliveryField({ value }: { value?: string }) {
  const dl = await getDeliveryLabels();

  return (
    <div>
      <label htmlFor="lf-delivery" className={label}>
        {dl.field}
      </label>
      <select
        id="lf-delivery"
        name="delivery"
        defaultValue={value === "nationwide" ? "nationwide" : "local"}
        className={control}
      >
        <option value="local">{dl.local}</option>
        <option value="nationwide">{dl.nationwide}</option>
      </select>
    </div>
  );
}
