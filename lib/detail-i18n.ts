import { getLang } from "./i18n";

const detail = {
  en: {
    back: "← Back to products",
    soldBy: "Sold by",
    verified: "Verified seller",
    notVerified: "Seller not verified",
    location: "Seller location",
    category: "Category",
    orderTitle: "Order this product",
    quantity: "Quantity",
    placeOrder: "Place order",
    orderHelp: "The seller must accept your order before you pay.",
    testNote: "Payments are in test mode: no real money is charged.",
    message: "Message the seller",
    loginPrompt: "Log in or sign up to order or message the seller.",
    login: "Log in",
    signup: "Sign up",
    yourListing: "This is your listing.",
    edit: "Edit listing",
  },
  fr: {
    back: "← Retour aux produits",
    soldBy: "Vendu par",
    verified: "Vendeur vérifié",
    notVerified: "Vendeur non vérifié",
    location: "Localisation du vendeur",
    category: "Catégorie",
    orderTitle: "Commander ce produit",
    quantity: "Quantité",
    placeOrder: "Commander",
    orderHelp: "Le vendeur doit accepter votre commande avant que vous payiez.",
    testNote: "Les paiements sont en mode test : aucun argent réel n'est débité.",
    message: "Écrire au vendeur",
    loginPrompt: "Connectez-vous ou inscrivez-vous pour commander ou écrire au vendeur.",
    login: "Connexion",
    signup: "Inscription",
    yourListing: "Ceci est votre annonce.",
    edit: "Modifier l'annonce",
  },
  rw: {
    back: "← Subira ku bicuruzwa",
    soldBy: "Acuruzwa na",
    verified: "Umucuruzi wemejwe",
    notVerified: "Umucuruzi ntaremezwa",
    location: "Aho umucuruzi aherereye",
    category: "Icyiciro",
    orderTitle: "Tumiza iki gicuruzwa",
    quantity: "Ingano",
    placeOrder: "Tumiza",
    orderHelp: "Umucuruzi agomba kwemera komande yawe mbere y'uko wishyura.",
    testNote: "Kwishyura ni uburyo bwo kugerageza: nta mafaranga nyayo akurwaho.",
    message: "Andikira umucuruzi",
    loginPrompt: "Injira cyangwa wiyandikishe kugira ngo utumize cyangwa wandikire umucuruzi.",
    login: "Injira",
    signup: "Iyandikishe",
    yourListing: "Iki ni igicuruzwa cyawe.",
    edit: "Hindura igicuruzwa",
  },
};

export type Detail = typeof detail.en;

export async function getDetail(): Promise<Detail> {
  return detail[await getLang()];
}