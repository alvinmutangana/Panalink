import { getLang } from "./i18n";

const rating = {
  en: {
    title: "Seller reviews",
    none: "No reviews yet.",
    one: "review",
    many: "reviews",
    outOf: "out of 5",
  },
  fr: {
    title: "Avis sur le vendeur",
    none: "Aucun avis pour le moment.",
    one: "avis",
    many: "avis",
    outOf: "sur 5",
  },
  rw: {
    title: "Ibitekerezo ku mucuruzi",
    none: "Nta bitekerezo biraba.",
    one: "igitekerezo",
    many: "ibitekerezo",
    outOf: "kuri 5",
  },
};

export async function getRatingLabels() {
  return rating[await getLang()];
}
