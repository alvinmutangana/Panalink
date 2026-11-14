"use client";

import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

export default function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      className="rounded bg-gray-800 px-4 py-2 text-white"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
      }}
    >
      {label}
    </button>
  );
}
