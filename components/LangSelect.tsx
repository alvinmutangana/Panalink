import { setLanguage } from "../app/actions/language";
import type { Lang } from "../lib/i18n";

const short: Record<Lang, string> = { rw: "RW", en: "EN", fr: "FR" };
const full: Record<Lang, string> = {
  rw: "Kinyarwanda",
  en: "English",
  fr: "Français",
};

export default function LangSelect({
  current,
  label,
}: {
  current: Lang;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex overflow-hidden rounded-md border border-input"
    >
      {(["rw", "en", "fr"] as const).map((l) => (
        <form key={l} action={setLanguage}>
          <input type="hidden" name="lang" value={l} />
          <button
            type="submit"
            lang={l}
            title={full[l]}
            aria-label={full[l]}
            aria-pressed={current === l}
            className={`min-h-11 min-w-11 px-2.5 text-sm font-medium ${
              current === l
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {short[l]}
          </button>
        </form>
      ))}
    </div>
  );
}
