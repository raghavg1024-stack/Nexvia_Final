import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile";

export default async function AcademiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile || profile.user_type !== "academia") {
    redirect("/login/academia");
  }
  return <>{children}</>;
}