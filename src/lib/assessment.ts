"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ASSESSMENT_QUESTIONS,
  XP_RULES,
  matchCareers,
  skillsAreRelated,
} from "@/lib/data";
import { grantReward } from "@/lib/rewards";
import { createCareerRoadmap } from "@/lib/roadmap";
import { createClient } from "@/lib/supabase/server";
import type {
  AnalysisReport,
  AssessmentResponse,
  AssessmentStatus,
  Career,
  CareerRecommendation,
  LearningStyle,
} from "@/lib/types";

export interface AssessmentSnapshot {
  status: AssessmentStatus;
  current_question_index: number;
  responses: AssessmentResponse[];
  completed_at: string | null;
}

export interface AssessmentResult {
  assessment: AssessmentSnapshot | null;
  analysisReport: AnalysisReport | null;
  recommendations: CareerRecommendation[];
}

const LEARNING_STYLE_MAP: Record<string, LearningStyle> = {
  "Watching videos": "visual",
  "Listening/audio": "auditory",
  "Reading notes": "reading",
  "Hands-on practice": "kinesthetic",
};

const STUDY_CAPACITY_MAP: Record<string, number> = {
  "Less than 3": 3,
  "3-5": 5,
  "5-10": 10,
  "10-15": 15,
  "15+": 20,
};

const SKILLS = [
  "Problem solving",
  "Programming",
  "Writing",
  "Public speaking",
  "Design",
  "Data analysis",
  "Teamwork",
  "Research",
] as const;

const SKILL_STRENGTHS: Record<string, string> = {
  "Problem solving": "Strong analytical thinking and a knack for breaking down complex problems",
  Programming: "Hands-on coding ability and technical building skills",
  Writing: "Clear written communication and content creation skills",
  "Public speaking": "Confident verbal communication and presentation skills",
  Design: "An eye for aesthetics and user-centered design",
  "Data analysis": "Comfort working with data and drawing insights from it",
  Teamwork: "A collaborative mindset and the ability to work well in teams",
  Research: "Solid research skills and curiosity-driven learning",
};

const SKILL_GROWTH: Record<string, string> = {
  "Problem solving": "Sharpen structured problem solving through practice challenges",
  Programming: "Build programming fundamentals with hands-on coding projects",
  Writing: "Develop clearer writing through regular drafting and feedback",
  "Public speaking": "Grow confidence with speaking and presentation practice",
  Design: "Explore design principles and hands-on visual tools",
  "Data analysis": "Build data analysis skills with spreadsheets and SQL",
  Teamwork: "Strengthen collaboration by taking part in group projects",
  Research: "Practice structured research and information synthesis",
};

function getAnswer(responses: AssessmentResponse[], questionId: string) {
  return responses.find((r) => r.question_id === questionId)?.answer;
}

function getSelectedSkills(responses: AssessmentResponse[]): string[] {
  const answer = getAnswer(responses, "skills_2");
  return Array.isArray(answer) ? (answer as string[]) : [];
}

function buildAnalysisReport(
  responses: AssessmentResponse[]
): Omit<AnalysisReport, "id" | "user_id" | "created_at"> {
  const learningStyle =
    LEARNING_STYLE_MAP[String(getAnswer(responses, "learning_style_1") ?? "")] ?? "visual";
  const studyCapacity =
    STUDY_CAPACITY_MAP[String(getAnswer(responses, "study_availability_1") ?? "")] ?? 5;

  const selectedSkills = getSelectedSkills(responses);
  const strengths = SKILLS.filter((s) => selectedSkills.includes(s)).map((s) => SKILL_STRENGTHS[s]);
  const growthAreas = SKILLS.filter((s) => !selectedSkills.includes(s)).map((s) => SKILL_GROWTH[s]);

  const recommendedPace =
    studyCapacity >= 15
      ? "Accelerated: commit to daily study sessions to move quickly toward your goal."
      : studyCapacity >= 10
        ? "Steady: aim for focused daily study blocks to build momentum."
        : studyCapacity >= 5
          ? "Balanced: plan a few focused sessions each week and stay consistent."
          : "Gentle: start with short, consistent sessions a couple of times a week.";

  const interestSum = responses
    .filter((r) => r.question_id.startsWith("interest"))
    .reduce<number>((sum, r) => sum + (typeof r.answer === "number" ? r.answer : 0), 0);
  const goals = String(getAnswer(responses, "goals_1") ?? "grow your career").toLowerCase();
  const education = String(getAnswer(responses, "education_1") ?? "").toLowerCase();
  const topStrengths =
    strengths.slice(0, 3).join(", ").toLowerCase() ||
    "an adaptable mindset and a willingness to learn";
  const interestNote =
    interestSum >= 12
      ? "a strong appetite for logic, creation, and helping others"
      : "a thoughtful mix of interests";
  const styleNote: Record<LearningStyle, string> = {
    visual: "visual",
    auditory: "auditory",
    reading: "reading-based",
    kinesthetic: "hands-on",
  };

  const summary = `Based on your responses, you show ${interestNote}. Your primary goal is to ${goals}${
    education ? `, building on a ${education} background` : ""
  }. You learn best through ${styleNote[learningStyle]} study and can commit about ${studyCapacity} hours per week. Your standout strengths are ${topStrengths}. Focusing on your growth areas will help you reach your goal faster and build a career that fits how you naturally learn and work.`;

  return {
    strengths,
    growth_areas: growthAreas,
    learning_style: learningStyle,
    study_capacity_hours: studyCapacity,
    recommended_pace: recommendedPace,
    summary,
  };
}

export async function getAssessment(): Promise<AssessmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { assessment: null, analysisReport: null, recommendations: [] };
  }

  const { data: assessmentRow } = await supabase
    .from("assessments")
    .select("status, current_question_index, responses, completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: reportRow } = await supabase
    .from("analysis_reports")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: recRows } = await supabase
    .from("career_recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("match_percentage", { ascending: false });

  return {
    assessment: (assessmentRow as AssessmentSnapshot | null) ?? null,
    analysisReport: (reportRow as AnalysisReport | null) ?? null,
    recommendations: (recRows as CareerRecommendation[] | null) ?? [],
  };
}

export async function saveProgress(
  responses: AssessmentResponse[],
  index: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("assessments")
    .select("started_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("assessments").upsert(
    {
      user_id: user.id,
      status: "in_progress",
      current_question_index: index,
      responses,
      started_at: existing?.started_at ?? now,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function completeAssessment(
  responses: AssessmentResponse[]
): Promise<{ report: AnalysisReport; recommendations: CareerRecommendation[] }> {
  const validResponses = new Map(responses.map((response) => [response.question_id, response]));
  const missingQuestion = ASSESSMENT_QUESTIONS.find((question) => {
    const response = validResponses.get(question.id);
    if (!response) return true;
    if (response.category !== question.category) return true;
    if (question.type === "rating") {
      return typeof response.answer !== "number" || response.answer < (question.min ?? 1) || response.answer > (question.max ?? 5);
    }
    if (question.type === "multiselect") {
      return !Array.isArray(response.answer) || response.answer.length === 0 || response.answer.some((value) => !question.options?.includes(value));
    }
    return typeof response.answer !== "string" || !response.answer || !question.options?.includes(response.answer);
  });
  if (missingQuestion || validResponses.size !== ASSESSMENT_QUESTIONS.length) {
    throw new Error("Please answer every assessment question before finishing.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const now = new Date().toISOString();
  const { error: saveError } = await supabase.from("assessments").upsert(
    {
      user_id: user!.id,
      status: "completed",
      current_question_index: ASSESSMENT_QUESTIONS.length,
      responses,
      started_at: now,
      completed_at: now,
    },
    { onConflict: "user_id" }
  );
  if (saveError) {
    throw new Error(saveError.message);
  }

  const reportData = buildAnalysisReport(responses);
  const { error: reportDeleteError } = await supabase
    .from("analysis_reports")
    .delete()
    .eq("user_id", user!.id);
  if (reportDeleteError) {
    throw new Error(reportDeleteError.message);
  }
  const { data: reportRow, error: reportError } = await supabase
    .from("analysis_reports")
    .insert({ user_id: user!.id, ...reportData })
    .select()
    .single();
  if (reportError) {
    throw new Error(reportError.message);
  }

  const selectedSkills = getSelectedSkills(responses);
  type MatchedCareer = { career: Career; score: number; match: number; reasons: string[] };
  const recRows = (matchCareers(responses) as unknown as MatchedCareer[]).map((m) => ({
    user_id: user!.id,
    career_id: m.career.id,
    match_percentage: m.match,
    reasons: m.reasons,
    required_skills: m.career.required_skills,
    existing_strengths: m.career.required_skills.filter((required) =>
      selectedSkills.some((selected) => skillsAreRelated(selected, required))
    ),
    growth_opportunities: m.career.required_skills.filter(
      (required) => !selectedSkills.some((selected) => skillsAreRelated(selected, required))
    ),
    is_selected: false,
  }));

  // Keep assessment completion resilient if a future catalog entry is added to
  // the app before its database seed reaches production.
  const candidateCareerIds = [...new Set(recRows.map((row) => row.career_id))];
  const { data: availableCareers, error: careerLookupError } = await supabase
    .from("careers")
    .select("id")
    .in("id", candidateCareerIds);
  if (careerLookupError) {
    throw new Error(careerLookupError.message);
  }
  const availableCareerIds = new Set((availableCareers ?? []).map((career) => career.id));
  const safeRecRows = recRows.filter((row) => availableCareerIds.has(row.career_id));
  if (safeRecRows.length === 0) {
    throw new Error("No matching career records are available. Please try the assessment again.");
  }

  const { error: recDeleteError } = await supabase
    .from("career_recommendations")
    .delete()
    .eq("user_id", user!.id);
  if (recDeleteError) {
    throw new Error(recDeleteError.message);
  }
  const { data: recInserted, error: recError } = await supabase
    .from("career_recommendations")
    .insert(safeRecRows)
    .select();
  if (recError) {
    throw new Error(recError.message);
  }

  revalidatePath("/analysis");
  revalidatePath("/recommendations");

  try {
    await grantReward("xp", XP_RULES.assessment_completed, "Assessment completed");
  } catch {}

  return {
    report: reportRow as unknown as AnalysisReport,
    recommendations: (recInserted ?? []) as unknown as CareerRecommendation[],
  };
}

export async function selectCareer(careerId: string, recommendationId: string) {
  const result = await createCareerRoadmap(careerId, recommendationId);
  if (!result.ok) throw new Error(result.message ?? "Could not create the roadmap.");

  try {
    await grantReward("xp", XP_RULES.career_selected, "Career selected");
  } catch {}

  revalidatePath("/roadmap");
  redirect("/roadmap");
}
