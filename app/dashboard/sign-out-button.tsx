"use client";

import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

export default function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      className="min-h-11 rounded-md bg-primary px-4 text-primary-foreground"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
