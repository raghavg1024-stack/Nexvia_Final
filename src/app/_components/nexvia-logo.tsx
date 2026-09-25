import Link from "next/link";

export function NexviaLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nexvia-g" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#1E3A8A" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#nexvia-g)" />
      <path
        d="M27.4 28.5H25.2l-3.4-6.1-3.4 6.1h-2.2l4.6-8.2-4.6-8.3h2.2l3.4 6.1 3.4-6.1h2.2l-4.7 8.3 4.7 8.2z"
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        transform="translate(-4.2 -0.4) scale(1.36)"
      />
    </svg>
  );
}

export function NexviaLogoMark({
  href,
  className = "",
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <span className="relative inline-flex">
        <NexviaLogo className="h-8 w-8" />
        <span className="pointer-events-none absolute inset-0 rounded-[11px] shadow-[0_8px_18px_rgba(30,58,138,0.2)]" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Nexvia
      </span>
    </Link>
  );
}
