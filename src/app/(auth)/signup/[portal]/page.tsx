import { notFound } from "next/navigation";
import { isPortalKey } from "@/lib/portal-auth";
import { SignupForm } from "../signup-form";

export function generateStaticParams() {
  return ["student", "industry", "academia", "parent"].map((portal) => ({ portal }));
}

export default async function PortalSignupPage({ params }: { params: Promise<{ portal: string }> }) {
  const { portal } = await params;
  if (!isPortalKey(portal)) notFound();
  return <SignupForm portalKey={portal} />;
}
