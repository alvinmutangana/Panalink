import { Suspense } from "react";
import { getDict } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import LoginForm from "../../components/LoginForm";

async function Content() {
  const t = await getDict();

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{t.loginTitle}</h1>
      <LoginForm
        labels={{
          email: t.email,
          password: t.password,
          loginBtn: t.loginBtn,
          loggingIn: t.loggingIn,
          wrongCreds: t.wrongCreds,
        }}
      />
      <p className="mt-4 text-sm">
        {t.noAccount}{" "}
        <a href="/signup" className="underline">
          {t.signUpLink}
        </a>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <Content />
      </Suspense>
    </main>
  );
}
