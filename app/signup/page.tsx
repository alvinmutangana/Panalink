import { Suspense } from "react";
import { getAuthLabels } from "../../lib/auth-i18n";
import SignupForm from "../../components/SignupForm";
import { Skeleton } from "../../components/ui/skeleton";

async function Content() {
  const a = await getAuthLabels();

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="text-3xl">{a.signupTitle}</h1>
      <p className="mt-2 text-muted-foreground">{a.signupIntro}</p>

      <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <SignupForm a={a} />
      </div>

      <p className="mt-6 text-center text-sm">
        {a.haveAccount}{" "}
        <a
          href="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          {a.loginLink}
        </a>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="container-page py-10 sm:py-14">
      <Suspense
        fallback={<Skeleton className="mx-auto h-[36rem] w-full max-w-lg rounded-xl" />}
      >
        <Content />
      </Suspense>
    </main>
  );
}
