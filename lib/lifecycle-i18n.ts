import { getLang } from "./i18n";

const life = {
  en: {
    status: { delivering: "On its way", completed: "Completed" },
    stepDelivery: "Delivery",
    stepCompleted: "Completed",
    markSent: "Mark as sent",
    markSentHelp: "Tell the buyer that the product is on its way.",
    waitingReceive: "Waiting for the buyer to confirm receipt.",
    confirmReceived: "I received it",
    confirmHelp: "Confirm only when you have received the product.",
    reviewTitle: "Rate this seller",
    ratingLabel: "Your rating (1 = poor, 5 = excellent)",
    commentLabel: "Your review (optional)",
    commentHint: "Say how it went. Up to 500 characters.",
    submitReview: "Submit review",
    yourReview: "Your review",
    buyerReview: "The buyer\u2019s review",
    outOf: "out of 5",
  },
  fr: {
    status: { delivering: "En route", completed: "Terminée" },
    stepDelivery: "Livraison",
    stepCompleted: "Terminée",
    markSent: "Marquer comme envoyée",
    markSentHelp: "Prévenez l\u2019acheteur que le produit est en route.",
    waitingReceive: "En attente de la confirmation de réception par l\u2019acheteur.",
    confirmReceived: "Je l\u2019ai reçu",
    confirmHelp: "Confirmez seulement quand vous avez reçu le produit.",
    reviewTitle: "Évaluer ce vendeur",
    ratingLabel: "Votre note (1 = mauvais, 5 = excellent)",
    commentLabel: "Votre avis (facultatif)",
    commentHint: "Dites comment cela s\u2019est passé. 500 caractères maximum.",
    submitReview: "Envoyer l\u2019avis",
    yourReview: "Votre avis",
    buyerReview: "L\u2019avis de l\u2019acheteur",
    outOf: "sur 5",
  },
  rw: {
    status: { delivering: "Iri mu nzira", completed: "Yarangiye" },
    stepDelivery: "Kohereza",
    stepCompleted: "Yarangiye",
    markSent: "Emeza ko yoherejwe",
    markSentHelp: "Menyesha umuguzi ko igicuruzwa kiri mu nzira.",
    waitingReceive: "Itegereje ko umuguzi yemeza ko yayakiriye.",
    confirmReceived: "Nayakiriye",
    confirmHelp: "Emeza ari uko wakiriye igicuruzwa.",
    reviewTitle: "Tanga amanota y\u2019umucuruzi",
    ratingLabel: "Amanota yawe (1 = make, 5 = meza cyane)",
    commentLabel: "Igitekerezo cyawe (si itegeko)",
    commentHint: "Vuga uko byagenze. Inyuguti zitarenga 500.",
    submitReview: "Ohereza igitekerezo",
    yourReview: "Igitekerezo cyawe",
    buyerReview: "Igitekerezo cy\u2019umuguzi",
    outOf: "kuri 5",
  },
};

export type LifeLabels = typeof life.en;

export async function getLifeLabels(): Promise<LifeLabels> {
  return life[await getLang()];
}
