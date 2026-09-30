import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, getSession } from "@/lib/profile";
import { ResumeBuilder } from "./resume-builder-client";

export const metadata: Metadata = {
  title: "Resume Builder",
  robots: { index: false, follow: false },
};

export default async function StudentResumeBuilderPage() {
  const [user, profile] = await Promise.all([getSession(), getProfile()]);
  if (!user) redirect("/login/student");
  if (profile?.user_type === "academia") redirect("/academia/resume-builder");
  if (profile && profile.user_type !== "student") redirect("/profile");

  return (
    <ResumeBuilder
      variant="student"
      profile={{
        fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
        email: profile?.email ?? user.email ?? "",
        headline: profile?.major ? `${profile.major} student` : "",
        skills: profile?.skill_tags ?? [],
      }}
    />
  );
}
