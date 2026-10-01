"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/", "/login", "/signup"]);

export function Breadcrumbs() {
  const pathname = usePathname();
  if (hiddenRoutes.has(pathname)) return null;

  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs border-b px-5 py-3 text-xs">
      <ol className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="inline-flex min-h-6 items-center gap-1.5 transition hover:text-accent">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label = decodeURIComponent(segment).replaceAll("-", " ");
          const current = index === segments.length - 1;
          return (
            <li key={href} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              {current ? (
                <span className="capitalize font-semibold text-foreground" aria-current="page">{label}</span>
              ) : (
                <Link href={href} className="capitalize transition hover:text-accent">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
