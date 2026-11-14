import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "../../lib/auth";
import { db } from "../../db";
import { sellerVerifications } from "../../db/schema";
import { getDict } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { submitVerification } from "./actions";

async function VerifyContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "seller") redirect("/dashboard");

  const t = await getDict();

  const [record] = await db
    .select()
    .from(sellerVerifications)
    .where(eq(sellerVerifications.userId, session.user.id));

  let body;
  if (record?.status === "approved") {
    body = <p className="text-green-500">{t.verifiedMsg}</p>;
  } else if (record?.status === "pending") {
    body = <p>{t.pendingMsg}</p>;
  } else {
    body = (
      <>
        {record?.status === "rejected" && (
          <p className="mb-4 text-red-500">{t.rejectedMsg}</p>
        )}
        <form action={submitVerification} className="flex flex-col gap-4">
          <input
            name="idNumber"
            inputMode="numeric"
            pattern="[0-9 ]{16,20}"
            placeholder={t.idPlaceholder}
            required
            className="rounded border p-3"
          />
          <button className="rounded bg-green-700 p-3 text-white">{t.submitVerify}</button>
        </form>
      </>
    );
  }

  return (
    <>
      <LanguageSwitcher />
      <h1 className="mb-6 text-2xl font-bold">{t.verifyTitle}</h1>
      {body}
    </>
  );
}

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}