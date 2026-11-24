import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function NotFound() {
  return (
    <main className="container-page py-20 text-center">
      <p className="text-5xl font-semibold text-primary">404</p>
      <h1 className="mt-4 text-2xl">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        Page introuvable · Urupapuro ntirwabonetse
      </p>
      <a href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        PanaLink
      </a>
    </main>
  );
}
