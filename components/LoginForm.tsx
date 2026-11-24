"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { control, label } from "../lib/ui";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";
import PasswordField from "./PasswordField";
import type { AuthLabels } from "../lib/auth-i18n";

export default function LoginForm({ a }: { a: AuthLabels }) {
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
      setError(a.wrongCreds);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className={label}>
          {a.email}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={control}
        />
      </div>

      <PasswordField
        id="login-password"
        label={a.password}
        showLabel={a.showPassword}
        autoComplete="current-password"
      />

      {error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        {loading ? a.loggingIn : a.loginBtn}
      </button>
    </form>
  );
}
