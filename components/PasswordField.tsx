"use client";

import { useState } from "react";
import { control, label as labelClass } from "../lib/ui";

export default function PasswordField({
  id,
  label,
  hint,
  showLabel,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  hint?: string;
  showLabel: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={control}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <label className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="size-5 accent-[var(--primary)]"
        />
        {showLabel}
      </label>
    </div>
  );
}
