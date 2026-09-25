"use server";

import { redirect } from "next/navigation";
import { createJob, getCompanyByUserId } from "@/lib/jobs";
import { getProfile } from "@/lib/profile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function postJobAction(prevState: any, formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.user_type !== "recruiter") {
    return { error: "Access Denied" };
  }

  const company = await getCompanyByUserId(profile.id);
  if (!company) {
    return { error: "You must create a company first." };
  }

  const title = String(formData.get("title") ?? "").trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role_type = String(formData.get("role_type") ?? "").trim() as any;
  const description = String(formData.get("description") ?? "").trim();
  const skillsRaw = String(formData.get("required_skills") ?? "").trim();
  const required_skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 30) : [];
  const majorsRaw = String(formData.get("eligible_majors") ?? "").trim();
  const eligible_majors = majorsRaw ? majorsRaw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 30) : [];
  const location = String(formData.get("location") ?? "").trim();
  const applicationUrlInput = String(formData.get("application_url") ?? "").trim();
  
  const cgpaRaw = formData.get("min_cgpa");
  const min_cgpa = cgpaRaw && String(cgpaRaw).trim() !== "" ? Number(cgpaRaw) : null;
  const percentageRaw = formData.get("min_percentage");
  const min_percentage = percentageRaw && String(percentageRaw).trim() !== "" ? Number(percentageRaw) : null;

  if (!title || !role_type || !description) {
    return { error: "Please fill out all required fields." };
  }
  if (min_cgpa !== null && (!Number.isFinite(min_cgpa) || min_cgpa < 0 || min_cgpa > 10)) {
    return { error: "Minimum CGPA must be between 0 and 10." };
  }
  if (min_percentage !== null && (!Number.isFinite(min_percentage) || min_percentage < 0 || min_percentage > 100)) {
    return { error: "Minimum marks must be between 0 and 100." };
  }
  let application_url: string | null = null;
  if (applicationUrlInput) {
    try {
      const parsed = new URL(applicationUrlInput);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Invalid protocol");
      application_url = parsed.toString();
    } catch {
      return { error: "Enter a valid application URL." };
    }
  }

  try {
    await createJob(company.id, {
      title,
      role_type,
      description,
      required_skills,
      min_cgpa,
      min_percentage,
      eligible_majors,
      location: location || null,
      application_url,
      status: "open",
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { error: error.message };
  }

  redirect("/recruiter");
}
