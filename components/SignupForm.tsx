"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { control, label } from "../lib/ui";
import { cn } from "../lib/utils";
import { DISTRICTS } from "../lib/districts";
import { buttonVariants } from "./ui/button";
import PasswordField from "./PasswordField";
import type { AuthLabels } from "../lib/auth-i18n";

export default function SignupForm({ a }: { a: AuthLabels }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const role = form.get("role") === "seller" ? "seller" : "buyer";

    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      role,
      district: String(form.get("district")),
    });

    setLoading(false);
    if (error) {
      setError(/exist|already/i.test(error.message ?? "") ? a.emailTaken : a.genericError);
      return;
    }
    router.push(role === "seller" ? "/verify" : "/dashboard");
    router.refresh();
  }

  const roles = [
    { value: "buyer", title: a.buyTitle, text: a.buyText },
    { value: "seller", title: a.sellTitle, text: a.sellText },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <fieldset>
        <legend className={label}>{a.roleLabel}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer gap-3 rounded-xl border border-input bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary"
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                defaultChecked={r.value === "buyer"}
                className="mt-1 size-5 shrink-0 accent-[var(--primary)]"
              />
              <span>
                <span className="block font-medium">{r.title}</span>
                <span className="block text-sm text-muted-foreground">{r.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="su-name" className={label}>
          {a.fullName}
        </label>
        <input
          id="su-name"
          name="name"
          required
          autoComplete="name"
          className={control}
        />
      </div>

      <div>
        <label htmlFor="su-email" className={label}>
          {a.email}
        </label>
        <input
          id="su-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={control}
        />
      </div>

      <PasswordField
        id="su-password"
        label={a.password}
        hint={a.passwordHint}
        showLabel={a.showPassword}
        autoComplete="new-password"
        minLength={8}
      />

      <div>
        <label htmlFor="su-district" className={label}>
          {a.district}
        </label>
        <input
          id="su-district"
          name="district"
          list="rw-districts"
          required
          autoComplete="off"
          aria-describedby="su-district-hint"
          className={control}
        />
        <datalist id="rw-districts">
          {DISTRICTS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <p id="su-district-hint" className="mt-1.5 text-sm text-muted-foreground">
          {a.districtHint}
        </p>
      </div>

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
        {loading ? a.creating : a.signupBtn}
      </button>
    </form>
  );
}
