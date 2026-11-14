import { Suspense } from "react";
import { getDict } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import SignupForm from "../../components/SignupForm";

async function Content() {
  const t = await getDict();

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{t.signupTitle}</h1>
      <SignupForm
        labels={{
          fullName: t.fullName,
          email: t.email,
          passwordHint: t.passwordHint,
          iBuy: t.iBuy,
          iSell: t.iSell,
          districtPlaceholder: t.districtPlaceholder,
          signupBtn: t.signupBtn,
          creating: t.creating,
          somethingWrong: t.somethingWrong,
        }}
      />
    </>
  );
}

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Content />
      </Suspense>
    </main>
  );
}
