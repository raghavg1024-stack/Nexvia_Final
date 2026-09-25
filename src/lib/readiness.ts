"use server";

import { createClient } from "@/lib/supabase/server";
import type { CareerReadinessScore } from "@/lib/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

type ScoreKeys = Exclude<
  keyof CareerReadinessScore,
  "id" | "user_id" | "updated_at" | "overall" | "suggestions"
>;

type RawScore = Omit<CareerReadinessScore, "id" | "user_id" | "updated_at">;

const SUGGESTION_TEMPLATES: Record<
  ScoreKeys,
  (score: number) => string
> = {
  technical_skills: (score) =>
    `Complete more courses in your roadmap to build technical skills (currently ${score}/100).`,
  communication: (score) =>
    `Practice explaining your projects aloud and use mock-interview feedback to sharpen communication (currently ${score}/100).`,
  projects: (score) =>
    `Finish more milestones to build portfolio-worthy projects (currently ${score}/100).`,
  resume_quality: (score) =>
    `Complete your profile and add finished milestone evidence before tailoring your resume (currently ${score}/100).`,
  interview_readiness: (score) =>
    `Complete more mock interviews and improve your answer scores (currently ${score}/100).`,
};

function buildSuggestions(score: RawScore): string[] {
  const entries = Object.entries(SUGGESTION_TEMPLATES) as [
    ScoreKeys,
    (score: number) => string,
  ][];
  const sorted = entries
    .map(([key, template]) => ({ key, template, value: score[key] }))
    .sort((a, b) => a.value - b.value);

  let count = 3;
  if (sorted[3] && sorted[3].value === sorted[2].value) count = 4;

  return sorted
    .slice(0, count)
    .map(({ template, value }) => template(value));
}

export async function getReadiness(): Promise<CareerReadinessScore | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    let previous: RawScore | null = null;
    const { data: latestRow } = await supabase
      .from("career_readiness")
      .select(
        "technical_skills, communication, projects, resume_quality, interview_readiness, overall, suggestions"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestRow) {
      previous = {
        technical_skills: latestRow.technical_skills,
        communication: latestRow.communication,
        projects: latestRow.projects,
        resume_quality: latestRow.resume_quality,
        interview_readiness: latestRow.interview_readiness,
        overall: latestRow.overall,
        suggestions: Array.isArray(latestRow.suggestions)
          ? (latestRow.suggestions as string[])
          : [],
      };
    }

    const profileRes = await supabase
      .from("profiles")
      .select(
        "xp, level, current_streak_days, full_name, education_level, goals, learning_style, study_hours_per_week"
      )
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileRes.data ?? null;

    const { data: badgeRows } = await supabase
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", user.id);
    const badgesEarned = badgeRows?.length ?? 0;

    const { data: roadmapRows } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const roadmapIds = (roadmapRows ?? []).map((row) => row.id);

    let completedCourses = 0;
    let totalCourses = 0;
    let completedMilestones = 0;
    let totalMilestones = 0;

    if (roadmapIds.length > 0) {
      const { data: milestoneRows } = await supabase
        .from("milestones")
        .select("id, status")
        .in("roadmap_id", roadmapIds);
      const milestones = milestoneRows ?? [];
      totalMilestones = milestones.length;
      completedMilestones = milestones.filter(
        (m) => m.status === "completed"
      ).length;

      const milestoneIds = milestones.map((m) => m.id);
      if (milestoneIds.length > 0) {
        const { data: courseRows } = await supabase
          .from("courses")
          .select("status")
          .in("milestone_id", milestoneIds);
        const courses = courseRows ?? [];
        totalCourses = courses.length;
        completedCourses = courses.filter(
          (c) => c.status === "completed"
        ).length;
      }
    }

    const profileFields = [
      profile?.full_name,
      profile?.education_level,
      profile?.goals,
      profile?.learning_style,
      profile?.study_hours_per_week,
    ];
    const filled = profileFields.filter(
      (value) => value !== null && value !== undefined && value !== ""
    ).length;
    const completeness = Math.round((filled / profileFields.length) * 100);

    const { data: interviewRows } = await supabase
      .from("mock_interviews")
      .select("overall_score")
      .eq("user_id", user.id)
      .eq("is_complete", true)
      .order("completed_at", { ascending: false })
      .limit(5);
    const completedInterviewScores = (interviewRows ?? [])
      .map((row) => Number(row.overall_score))
      .filter((value) => Number.isFinite(value) && value > 0);
    const interviewAverage = completedInterviewScores.length
      ? completedInterviewScores.reduce((sum, value) => sum + value, 0) /
        completedInterviewScores.length
      : null;

    let technical = clamp(
      15 +
        (totalCourses > 0 ? (completedCourses / totalCourses) * 70 : 0) +
        Math.min(15, (profile?.xp ?? 0) / 100)
    );
    let communication = clamp(
      25 + badgesEarned * 4 + (interviewAverage === null ? 0 : interviewAverage * 0.35)
    );
    let projects = clamp(
      10 + (totalMilestones > 0 ? (completedMilestones / totalMilestones) * 80 : 0)
    );
    let resumeQuality = clamp(
      20 + completeness * 0.65 + Math.min(15, completedMilestones * 3)
    );
    let interview = clamp(interviewAverage ?? 20);

    if (!profile && previous) {
      technical = previous.technical_skills;
      communication = previous.communication;
      projects = previous.projects;
      resumeQuality = previous.resume_quality;
      interview = previous.interview_readiness;
    }

    const score: RawScore = {
      technical_skills: technical,
      communication,
      projects,
      resume_quality: resumeQuality,
      interview_readiness: interview,
      overall: Math.round(
        (technical + communication + projects + resumeQuality + interview) / 5
      ),
      suggestions: [],
    };
    score.suggestions = buildSuggestions(score);

    const updatedAt = new Date().toISOString();
    let storedId = "";

    try {
      const payload = {
        user_id: user.id,
        technical_skills: score.technical_skills,
        communication: score.communication,
        projects: score.projects,
        resume_quality: score.resume_quality,
        interview_readiness: score.interview_readiness,
        overall: score.overall,
        suggestions: score.suggestions,
        updated_at: updatedAt,
      };

      const { data: existing } = await supabase
        .from("career_readiness")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let res;
      if (existing) {
        res = await supabase
          .from("career_readiness")
          .update(payload)
          .eq("user_id", user.id)
          .select("id")
          .single();
      } else {
        res = await supabase
          .from("career_readiness")
          .insert(payload)
          .select("id")
          .single();
      }
      if (res.data?.id) storedId = res.data.id;
    } catch {}

    return {
      id: storedId,
      user_id: user.id,
      ...score,
      updated_at: updatedAt,
    };
  } catch {
    return null;
  }
}
