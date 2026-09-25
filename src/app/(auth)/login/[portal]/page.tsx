import { notFound } from "next/navigation";
import { isPortalKey } from "@/lib/portal-auth";
import { LoginForm } from "../login-form";

export function generateStaticParams() {
  return ["student", "industry", "academia", "parent"].map((portal) => ({ portal }));
}

export default async function PortalLoginPage({ params }: { params: Promise<{ portal: string }> }) {
  const { portal } = await params;
  if (!isPortalKey(portal)) notFound();
  return <LoginForm portalKey={portal} />;
}
