import { Suspense } from "react";
import { getAuthLabels } from "../../lib/auth-i18n";
import LoginForm from "../../components/LoginForm";
import { Skeleton } from "../../components/ui/skeleton";

async function Content() {
  const a = await getAuthLabels();

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-3xl">{a.loginTitle}</h1>
      <p className="mt-2 text-muted-foreground">{a.loginIntro}</p>

      <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <LoginForm a={a} />
      </div>

      <p className="mt-6 text-center text-sm">
        {a.noAccount}{" "}
        <a
          href="/signup"
          className="font-medium text-primary underline underline-offset-4"
        >
          {a.signupLink}
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="container-page py-10 sm:py-14">
      <Suspense
        fallback={<Skeleton className="mx-auto h-96 w-full max-w-md rounded-xl" />}
      >
        <Content />
      </Suspense>
    </main>
  );
}
