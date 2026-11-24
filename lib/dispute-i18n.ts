import { getLang } from "./i18n";

const dp = {
  en: {
    report: "Report a problem",
    reasonLabel: "What happened?",
    reasonHint: "10 to 500 characters. An administrator will review it.",
    send: "Send report",
    openTitle: "Problem reported: waiting for an administrator",
    resolvedTitle: "Problem resolved",
    resolutionIs: "Decision",
    navDisputes: "Disputes",
    adminTitle: "Disputes",
    adminIntro:
      "Review problems reported by buyers and sellers, and record how each was resolved.",
    emptyOpen: "No open disputes.",
    openSection: "Open",
    resolvedSection: "Resolved",
    reportedBy: "Reported by",
    buyer: "Buyer",
    seller: "Seller",
    order: "Order",
    amount: "Amount",
    resolutionLabel: "Your decision",
    resolutionHint: "Explain the decision. Both users will see it. 5 to 500 characters.",
    resolveBtn: "Mark as resolved",
  },
  fr: {
    report: "Signaler un problème",
    reasonLabel: "Que s\u2019est-il passé ?",
    reasonHint: "10 à 500 caractères. Un administrateur l\u2019examinera.",
    send: "Envoyer le signalement",
    openTitle: "Problème signalé : en attente d\u2019un administrateur",
    resolvedTitle: "Problème résolu",
    resolutionIs: "Décision",
    navDisputes: "Litiges",
    adminTitle: "Litiges",
    adminIntro:
      "Examinez les problèmes signalés par les acheteurs et les vendeurs, et notez comment chacun a été résolu.",
    emptyOpen: "Aucun litige ouvert.",
    openSection: "Ouverts",
    resolvedSection: "Résolus",
    reportedBy: "Signalé par",
    buyer: "Acheteur",
    seller: "Vendeur",
    order: "Commande",
    amount: "Montant",
    resolutionLabel: "Votre décision",
    resolutionHint:
      "Expliquez la décision. Les deux utilisateurs la verront. 5 à 500 caractères.",
    resolveBtn: "Marquer comme résolu",
  },
  rw: {
    report: "Garagaza ikibazo",
    reasonLabel: "Byagenze bite?",
    reasonHint: "Inyuguti 10 kugeza kuri 500. Umuyobozi azabisuzuma.",
    send: "Ohereza raporo",
    openTitle: "Ikibazo cyagaragajwe: gitegereje umuyobozi",
    resolvedTitle: "Ikibazo cyakemutse",
    resolutionIs: "Icyemezo",
    navDisputes: "Ibibazo",
    adminTitle: "Ibibazo",
    adminIntro:
      "Suzuma ibibazo byagaragajwe n\u2019abaguzi n\u2019abacuruzi, wandike uko buri kimwe cyakemutse.",
    emptyOpen: "Nta kibazo gifunguye.",
    openSection: "Bifunguye",
    resolvedSection: "Byakemutse",
    reportedBy: "Cyagaragajwe na",
    buyer: "Umuguzi",
    seller: "Umucuruzi",
    order: "Komande",
    amount: "Amafaranga",
    resolutionLabel: "Icyemezo cyawe",
    resolutionHint:
      "Sobanura icyemezo. Abakoresha bombi bazakibona. Inyuguti 5 kugeza kuri 500.",
    resolveBtn: "Emeza ko cyakemutse",
  },
};

export type DisputeLabels = typeof dp.en;

export async function getDisputeLabels(): Promise<DisputeLabels> {
  return dp[await getLang()];
}
