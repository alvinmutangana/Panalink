"use client";

import { usePathname } from "next/navigation";

export default function AdminNavClient({
  items,
  label,
}: {
  items: { href: string; label: string }[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="container-page max-w-5xl pt-6">
      <ul className="flex gap-1 overflow-x-auto border-b">
        {items.map((i) => {
          const active =
            i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <li key={i.href} className="shrink-0">
              <a
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {i.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
