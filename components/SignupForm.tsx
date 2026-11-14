"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";

type Labels = {
  fullName: string;
  email: string;
  passwordHint: string;
  iBuy: string;
  iSell: string;
  districtPlaceholder: string;
  signupBtn: string;
  creating: string;
  somethingWrong: string;
};

export default function SignupForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      role: String(form.get("role")),
      district: String(form.get("district")),
    });

    setLoading(false);
    if (error) {
      setError(error.message ?? labels.somethingWrong);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input name="name" placeholder={labels.fullName} required className="rounded border p-3" />
      <input name="email" type="email" placeholder={labels.email} required className="rounded border p-3" />
      <input name="password" type="password" placeholder={labels.passwordHint} minLength={8} required className="rounded border p-3" />
      <select name="role" className="rounded border p-3">
        <option value="buyer">{labels.iBuy}</option>
        <option value="seller">{labels.iSell}</option>
      </select>
      <input name="district" placeholder={labels.districtPlaceholder} required className="rounded border p-3" />
      {error && <p className="text-red-600">{error}</p>}
      <button disabled={loading} className="rounded bg-green-700 p-3 text-white">
        {loading ? labels.creating : labels.signupBtn}
      </button>
    </form>
  );
}
