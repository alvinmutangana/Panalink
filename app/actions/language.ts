"use server";

import { cookies } from "next/headers";

const LANGS = ["rw", "en", "fr"];

export async function setLanguage(formData: FormData) {
  const lang = String(formData.get("lang") ?? "");
  if (!LANGS.includes(lang)) return;

  (await cookies()).set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
