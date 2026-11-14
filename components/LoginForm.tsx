"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";

type Labels = {
  email: string;
  password: string;
  loginBtn: string;
  loggingIn: string;
  wrongCreds: string;
};

export default function LoginForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setLoading(false);
    if (error) {
      setError(labels.wrongCreds);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input name="email" type="email" placeholder={labels.email} required className="rounded border p-3" />
      <input name="password" type="password" placeholder={labels.password} required className="rounded border p-3" />
      {error && <p className="text-red-600">{error}</p>}
      <button disabled={loading} className="rounded bg-green-700 p-3 text-white">
        {loading ? labels.loggingIn : labels.loginBtn}
      </button>
    </form>
  );
}
