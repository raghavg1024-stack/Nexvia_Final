"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SetupState = { error: string | null };

export async function createCompanyAction(
  _previousState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in first." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const websiteInput = String(formData.get("website") ?? "").trim();
  const logoInput = String(formData.get("logo_url") ?? "").trim();

  if (name.length < 2 || name.length > 100) {
    return { error: "Enter a company name between 2 and 100 characters." };
  }

  const validateUrl = (value: string) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
      return null;
    }
  };
  const website = validateUrl(websiteInput);
  const logo_url = validateUrl(logoInput);
  if (websiteInput && !website) return { error: "Enter a valid company website URL." };
  if (logoInput && !logo_url) return { error: "Enter a valid logo URL." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ user_type: "recruiter" })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name, description: description || null, website, logo_url, created_by: user.id })
    .select("id")
    .single();
  if (companyError || !company) return { error: companyError?.message ?? "Could not create the company." };

  const { error: memberError } = await supabase
    .from("company_members")
    .insert({ company_id: company.id, user_id: user.id });
  if (memberError) return { error: memberError.message };

  revalidatePath("/recruiter");
  redirect("/recruiter");
}
