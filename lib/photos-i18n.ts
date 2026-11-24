import { getLang } from "./i18n";

const photos = {
  en: {
    title: "Photos",
    hint: "Add up to 3 photos. The first one is the cover.",
    add: "Add a photo",
    addAnother: "Add another photo",
    remove: "Remove photo",
    cover: "Cover",
    compressing: "Preparing photo...",
    uploading: "Uploading...",
    error: "Upload failed. Please try again.",
    full: "You have added the maximum of 3 photos.",
    show: "Show photo",
  },
  fr: {
    title: "Photos",
    hint: "Ajoutez jusqu\u2019\u00e0 3 photos. La premi\u00e8re est la couverture.",
    add: "Ajouter une photo",
    addAnother: "Ajouter une autre photo",
    remove: "Supprimer la photo",
    cover: "Couverture",
    compressing: "Pr\u00e9paration de la photo...",
    uploading: "Envoi en cours...",
    error: "\u00c9chec de l\u2019envoi. Veuillez r\u00e9essayer.",
    full: "Vous avez ajout\u00e9 le maximum de 3 photos.",
    show: "Afficher la photo",
  },
  rw: {
    title: "Amafoto",
    hint: "Shyiraho amafoto agera kuri 3. Iya mbere ni yo igaragara ku isura.",
    add: "Ongeraho ifoto",
    addAnother: "Ongeraho indi foto",
    remove: "Kuraho ifoto",
    cover: "Isura",
    compressing: "Ifoto iritegurwa...",
    uploading: "Iri koherezwa...",
    error: "Kohereza ntibyagenze neza. Ongera ugerageze.",
    full: "Mugeze ku mafoto 3 ntarengwa.",
    show: "Reba ifoto",
  },
};

export type PhotoLabels = typeof photos.en;

export async function getPhotoLabels(): Promise<PhotoLabels> {
  return photos[await getLang()];
}
