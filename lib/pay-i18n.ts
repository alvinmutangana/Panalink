import { getLang } from "./i18n";

const pay = {
  en: {
    providers: { mtn: "MTN Mobile Money", airtel: "Airtel Money" },
    status: { payment_submitted: "Payment to confirm" },
    detailsTitle: "Payment details",
    detailsIntro:
      "After you accept an order, the buyer pays you directly on this number or merchant code. PanaLink does not hold or process any money.",
    providerLabel: "Mobile money network",
    numberLabel: "Phone number or merchant code",
    numberHint: "Digits only. This is where buyers send the money.",
    nameLabel: "Name on the account",
    nameHint: "Buyers see this name to make sure they pay the right person.",
    save: "Save payment details",
    saved: "Payment details saved.",
    menu: "Payment details",
    bannerMissing:
      "Add your mobile money details so buyers can pay you after you accept an order.",
    bannerBtn: "Add payment details",
    payTitle: "Pay the seller directly",
    sendExactly: "Send exactly",
    to: "to",
    accountName: "account name",
    step2: "Then enter the transaction ID from the confirmation message.",
    networkLabel: "Network you used",
    refLabel: "Transaction ID",
    refHint: "6 to 30 letters or numbers, as shown in the confirmation SMS.",
    submitRef: "I have paid",
    payNote: "PanaLink does not hold or process money. Keep your confirmation message.",
    noMethodBuyer: "The seller has not added payment details yet. Send them a message.",
    waitingConfirm: "Waiting for the seller to confirm your payment.",
    rejectedNote:
      "The seller could not find your payment. Check the transaction ID and try again, or report a problem.",
    sellerReported: "The buyer says they have paid",
    sellerCheck: "Check your mobile money messages for this transaction ID and amount.",
    network: "Network",
    txId: "Transaction ID",
    amount: "Amount",
    gotMoney: "I received the money",
    noMoney: "I did not receive it",
    paidLine: "Payment confirmed",
    errRef: "That transaction ID is invalid or has already been used.",
    errMethod: "Add your payment details before accepting orders.",
  },
  fr: {
    providers: { mtn: "MTN Mobile Money", airtel: "Airtel Money" },
    status: { payment_submitted: "Paiement à confirmer" },
    detailsTitle: "Coordonnées de paiement",
    detailsIntro:
      "Après avoir accepté une commande, l\u2019acheteur vous paie directement sur ce numéro ou ce code marchand. PanaLink ne détient ni ne traite aucun argent.",
    providerLabel: "Réseau Mobile Money",
    numberLabel: "Numéro de téléphone ou code marchand",
    numberHint: "Chiffres uniquement. C\u2019est là que les acheteurs envoient l\u2019argent.",
    nameLabel: "Nom du titulaire du compte",
    nameHint: "Les acheteurs voient ce nom pour payer la bonne personne.",
    save: "Enregistrer",
    saved: "Coordonnées enregistrées.",
    menu: "Coordonnées de paiement",
    bannerMissing:
      "Ajoutez vos coordonnées Mobile Money pour que les acheteurs puissent vous payer après l\u2019acceptation d\u2019une commande.",
    bannerBtn: "Ajouter les coordonnées",
    payTitle: "Payer directement le vendeur",
    sendExactly: "Envoyez exactement",
    to: "à",
    accountName: "nom du compte",
    step2: "Saisissez ensuite l\u2019identifiant de transaction du message de confirmation.",
    networkLabel: "Réseau utilisé",
    refLabel: "Identifiant de transaction",
    refHint: "6 à 30 lettres ou chiffres, comme dans le SMS de confirmation.",
    submitRef: "J\u2019ai payé",
    payNote:
      "PanaLink ne détient ni ne traite l\u2019argent. Gardez votre message de confirmation.",
    noMethodBuyer:
      "Le vendeur n\u2019a pas encore ajouté ses coordonnées de paiement. Écrivez-lui.",
    waitingConfirm: "En attente de la confirmation de votre paiement par le vendeur.",
    rejectedNote:
      "Le vendeur n\u2019a pas trouvé votre paiement. Vérifiez l\u2019identifiant et réessayez, ou signalez un problème.",
    sellerReported: "L\u2019acheteur dit avoir payé",
    sellerCheck:
      "Vérifiez vos messages Mobile Money pour cet identifiant de transaction et ce montant.",
    network: "Réseau",
    txId: "Identifiant de transaction",
    amount: "Montant",
    gotMoney: "J\u2019ai reçu l\u2019argent",
    noMoney: "Je ne l\u2019ai pas reçu",
    paidLine: "Paiement confirmé",
    errRef: "Cet identifiant de transaction est invalide ou déjà utilisé.",
    errMethod: "Ajoutez vos coordonnées de paiement avant d\u2019accepter des commandes.",
  },
  rw: {
    providers: { mtn: "MTN Mobile Money", airtel: "Airtel Money" },
    status: { payment_submitted: "Ubwishyu bwo kwemeza" },
    detailsTitle: "Aho wishyurirwa",
    detailsIntro:
      "Umaze kwemera komande, umuguzi akwishyura ako kanya kuri iyi numero cyangwa kode. PanaLink ntibika cyangwa ngo ikoreshe amafaranga.",
    providerLabel: "Ikigo cya Mobile Money",
    numberLabel: "Numero ya telefone cyangwa kode",
    numberHint: "Imibare gusa. Aho abaguzi boherereza amafaranga.",
    nameLabel: "Izina riri kuri konti",
    nameHint: "Abaguzi babona iri zina kugira ngo bishyure umuntu nyawe.",
    save: "Bika",
    saved: "Byabitswe.",
    menu: "Aho wishyurirwa",
    bannerMissing:
      "Shyiraho numero yawe ya Mobile Money kugira ngo abaguzi bakwishyure umaze kwemera komande.",
    bannerBtn: "Shyiraho aho wishyurirwa",
    payTitle: "Ishyura umucuruzi ako kanya",
    sendExactly: "Ohereza neza",
    to: "kuri",
    accountName: "izina rya konti",
    step2: "Hanyuma andika nimero y\u2019igikorwa iri mu butumwa bwemeza.",
    networkLabel: "Ikigo wakoresheje",
    refLabel: "Nimero y\u2019igikorwa",
    refHint: "Inyuguti cyangwa imibare 6 kugeza kuri 30, nk\u2019uko biri mu butumwa bwa SMS.",
    submitRef: "Nishyuye",
    payNote:
      "PanaLink ntibika cyangwa ngo ikoreshe amafaranga. Bika ubutumwa bwemeza.",
    noMethodBuyer:
      "Umucuruzi ntaragaragaza aho yishyurirwa. Mwandikire ubutumwa.",
    waitingConfirm: "Itegereje ko umucuruzi yemeza ubwishyu bwawe.",
    rejectedNote:
      "Umucuruzi ntiyabonye ubwishyu bwawe. Reba nimero y\u2019igikorwa wongere ugerageze, cyangwa ugaragaze ikibazo.",
    sellerReported: "Umuguzi avuga ko yishyuye",
    sellerCheck:
      "Reba ubutumwa bwawe bwa Mobile Money ushake iyi nimero n\u2019aya mafaranga.",
    network: "Ikigo",
    txId: "Nimero y\u2019igikorwa",
    amount: "Amafaranga",
    gotMoney: "Nayakiriye",
    noMoney: "Sinayakiriye",
    paidLine: "Ubwishyu bwemejwe",
    errRef: "Iyi nimero y\u2019igikorwa si yo cyangwa yarakoreshejwe.",
    errMethod: "Shyiraho aho wishyurirwa mbere yo kwemera komande.",
  },
};

export type PayLabels = typeof pay.en;

export async function getPayLabels(): Promise<PayLabels> {
  return pay[await getLang()];
}
