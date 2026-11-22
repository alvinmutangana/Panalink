"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {label}
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-card p-2 shadow-card">
        {children}
      </div>
    </details>
  );
}
