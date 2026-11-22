import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { getDict, getLang } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import SignOutButton from "./sign-out-button";

const inboxLabel = { en: "Messages", fr: "Messages", rw: "Ubutumwa" };

async function UserInfo() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const t = await getDict();
  const lang = await getLang();
  const { user } = session;
  const roleLabel = t.roles[user.role as keyof typeof t.roles] ?? user.role;

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-2 text-2xl font-bold">
        {t.welcome}, {user.name}
      </h1>
      <p>
        {t.role}: {roleLabel}
      </p>
      <p>
        {t.district}: {user.district}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <a href="/listings" className="underline">{t.browse}</a>
        <a href="/messages" className="underline">{inboxLabel[lang]}</a>
        <a href="/orders" className="underline">{lang === "fr" ? "Commandes" : lang === "rw" ? "Komande" : "Orders"}</a>
        {user.role === "seller" && (
          <>
            <a href="/listings/new" className="underline">{t.create}</a>
            <a href="/listings/mine" className="underline">{t.mine}</a>
            <a href="/verify" className="underline">{t.verify}</a>
          </>
        )}
      </div>

      <div className="mt-6">
        <SignOutButton label={t.signOut} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <UserInfo />
      </Suspense>
    </main>
  );
}
