import type { Metadata } from "next";
import { getProfile, getSession } from "@/lib/profile";
import { ResumeBuilder } from "../../resume-builder/resume-builder-client";

export const metadata: Metadata = {
  title: "Academic Resume Builder",
  robots: { index: false, follow: false },
};

export default async function AcademicResumeBuilderPage() {
  const [user, profile] = await Promise.all([getSession(), getProfile()]);

  return (
    <ResumeBuilder
      variant="academia"
      profile={{
        fullName: profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined) ?? "",
        email: profile?.email ?? user?.email ?? "",
        headline: "",
        skills: profile?.skill_tags ?? [],
      }}
    />
  );
}
