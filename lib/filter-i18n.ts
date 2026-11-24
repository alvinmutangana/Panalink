import { getLang } from "./i18n";

const f = {
  en: { min: "Min price (RWF)", max: "Max price (RWF)" },
  fr: { min: "Prix min (RWF)", max: "Prix max (RWF)" },
  rw: { min: "Igiciro gito (RWF)", max: "Igiciro kinini (RWF)" },
};

export async function getFilterLabels() {
  return f[await getLang()];
}
