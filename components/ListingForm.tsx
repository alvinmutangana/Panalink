import { CATEGORIES } from "../lib/categories";
import { DISTRICTS } from "../lib/districts";
import type { Dict } from "../lib/i18n";
import type { DashLabels } from "../lib/dash-i18n";
import type { PhotoLabels } from "../lib/photos-i18n";
import { control, label } from "../lib/ui";
import { cn } from "../lib/utils";
import PhotoUploader from "./PhotoUploader";
import { buttonVariants } from "./ui/button";

export type ListingValues = {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: number | "";
  district: string;
  photos: string[];
};

export default function ListingForm({
  action,
  mode,
  t,
  d,
  photoLabels,
  values,
}: {
  action: (formData: FormData) => void | Promise<void>;
  mode: "new" | "edit";
  t: Dict;
  d: DashLabels;
  photoLabels: PhotoLabels;
  values: ListingValues;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <PhotoUploader initial={values.photos} labels={photoLabels} />

      <div>
        <label htmlFor="lf-title" className={label}>
          {d.titleLabel}
        </label>
        <input
          id="lf-title"
          name="title"
          required
          maxLength={120}
          autoComplete="off"
          defaultValue={values.title}
          aria-describedby="lf-title-hint"
          className={control}
        />
        <p id="lf-title-hint" className="mt-1.5 text-sm text-muted-foreground">
          {d.titleHint}
        </p>
      </div>

      <div>
        <label htmlFor="lf-desc" className={label}>
          {d.descLabel}
        </label>
        <textarea
          id="lf-desc"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={values.description}
          aria-describedby="lf-desc-hint"
          className={cn(control, "py-2")}
        />
        <p id="lf-desc-hint" className="mt-1.5 text-sm text-muted-foreground">
          {d.descHint}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-category" className={label}>
            {d.categoryLabel}
          </label>
          <select
            id="lf-category"
            name="category"
            defaultValue={values.category}
            className={control}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.categories[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lf-price" className={label}>
            {d.priceLabel}
          </label>
          <input
            id="lf-price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            required
            defaultValue={values.price}
            aria-describedby="lf-price-hint"
            className={control}
          />
          <p id="lf-price-hint" className="mt-1.5 text-sm text-muted-foreground">
            {d.priceHint}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="lf-district" className={label}>
          {d.districtLabel}
        </label>
        <input
          id="lf-district"
          name="district"
          list="lf-districts"
          required
          autoComplete="off"
          defaultValue={values.district}
          aria-describedby="lf-district-hint"
          className={control}
        />
        <datalist id="lf-districts">
          {DISTRICTS.map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
        <p id="lf-district-hint" className="mt-1.5 text-sm text-muted-foreground">
          {d.districtHint}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonVariants({ size: "lg" })}>
          {mode === "new" ? d.publish : d.save}
        </button>
        <a
          href="/listings/mine"
          className={buttonVariants({ size: "lg", variant: "outline" })}
        >
          {d.cancel}
        </a>
      </div>
    </form>
  );
}
