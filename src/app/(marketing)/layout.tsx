import { PublicNav } from "@/app/_components/public-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-background text-foreground">
      <PublicNav />
      {children}
    </div>
  );
}
