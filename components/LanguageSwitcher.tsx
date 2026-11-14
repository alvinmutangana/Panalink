import { setLanguage } from "../app/actions/language";

export default function LanguageSwitcher() {
  return (
    <div className="mb-4 flex gap-2 text-sm">
      {["rw", "en", "fr"].map((l) => (
        <form key={l} action={setLanguage}>
          <input type="hidden" name="lang" value={l} />
          <button className="rounded border px-2 py-1 uppercase">{l}</button>
        </form>
      ))}
    </div>
  );
}
