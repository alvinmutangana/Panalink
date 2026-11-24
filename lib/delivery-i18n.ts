import { getLang } from "./i18n";

const dl = {
  en: {
    field: "Delivery",
    local: "Only in my district",
    nationwide: "I can deliver anywhere in Rwanda",
    badge: "Delivers across Rwanda",
    reach: "Can reach district",
    reachHint: "Products sold in this district or delivered there.",
  },
  fr: {
    field: "Livraison",
    local: "Uniquement dans mon district",
    nationwide: "Je peux livrer partout au Rwanda",
    badge: "Livre partout au Rwanda",
    reach: "Peut atteindre le district",
    reachHint: "Produits vendus dans ce district ou livrés jusque-là.",
  },
  rw: {
    field: "Kohereza",
    local: "Mu karere kanjye gusa",
    nationwide: "Nshobora kohereza hose mu Rwanda",
    badge: "Yoherezwa hose mu Rwanda",
    reach: "Igera mu karere",
    reachHint: "Ibicuruzwa biri muri aka karere cyangwa byoherezwa ho.",
  },
};

export async function getDeliveryLabels() {
  return dl[await getLang()];
}
