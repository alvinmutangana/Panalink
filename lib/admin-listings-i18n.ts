import { getLang } from "./i18n";

const al = {
  en: {
    nav: "Products",
    title: "Moderate products",
    intro: "Remove products that break the platform rules. This cannot be undone.",
    empty: "No products yet.",
    seller: "Seller",
    added: "Added",
    remove: "Remove",
    confirm: "Remove this product?",
    confirmText: "The product and its orders will be deleted.",
    confirmYes: "Yes, remove",
  },
  fr: {
    nav: "Produits",
    title: "Modérer les produits",
    intro:
      "Supprimez les produits qui enfreignent les règles de la plateforme. Cette action est irréversible.",
    empty: "Aucun produit pour le moment.",
    seller: "Vendeur",
    added: "Ajouté le",
    remove: "Supprimer",
    confirm: "Supprimer ce produit ?",
    confirmText: "Le produit et ses commandes seront supprimés.",
    confirmYes: "Oui, supprimer",
  },
  rw: {
    nav: "Ibicuruzwa",
    title: "Genzura ibicuruzwa",
    intro:
      "Kuraho ibicuruzwa bica amategeko y\u2019urubuga. Ntibishobora gusubizwaho.",
    empty: "Nta bicuruzwa biraboneka.",
    seller: "Umucuruzi",
    added: "Cyashyizweho ku wa",
    remove: "Kuraho",
    confirm: "Wakuraho iki gicuruzwa?",
    confirmText: "Igicuruzwa na komande zacyo bizasibwa.",
    confirmYes: "Yego, kuraho",
  },
};

export async function getAdminListingsLabels() {
  return al[await getLang()];
}
