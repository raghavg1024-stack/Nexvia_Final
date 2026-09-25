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
    <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-white/80 px-5 py-3 text-xs text-slate-600 backdrop-blur-xl">
      <ol className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label = decodeURIComponent(segment).replaceAll("-", " ");
          const current = index === segments.length - 1;
          return (
            <li key={href} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden="true" />
              {current ? (
                <span className="capitalize font-semibold text-blue-900" aria-current="page">{label}</span>
              ) : (
                <Link href={href} className="capitalize transition hover:text-white">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
