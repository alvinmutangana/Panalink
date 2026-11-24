"use client";

import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-page py-20 text-center">
      <h1 className="text-2xl">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Une erreur est survenue · Hari ikitagenze neza
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        Try again
      </button>
    </main>
  );
}
