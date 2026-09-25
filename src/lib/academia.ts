"use server";

import { createClient } from "@/lib/supabase/server";
import type { UUID } from "@/lib/types";

export interface SkillGapData {
  skill: string;
  cohort: string;
  coverage: number;
  outcome: string;
  student_count: number;
  ready_count: number;
}

export interface InstitutionMetrics {
  total_students: number;
  students_skill_mapped: number;
  industry_partners: number;
  active_partnerships: number;
  internship_ready: number;
  placement_pipeline: number;
  avg_readiness: number;
  completed_roadmaps: number;
  avg_streak: number;
}

export interface CohortReadiness {
  cohort: string;
  department: string;
  year: number;
  student_count: number;
  avg_readiness: number;
  internship_ready: number;
  placed: number;
  top_skill_gaps: string[];
}

export interface IndustryPartner {
  id: UUID;
  name: string;
  collaborations: number;
  active_jobs: number;
  hires: number;
  last_activity: string;
}

export interface PlacementFunnel {
  stage: string;
  count: number;
  conversion_rate: number;
}

export async function getInstitutionMetrics(): Promise<InstitutionMetrics> {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: skillMapped },
    { count: industryPartners },
    { count: activeJobs },
    { count: internshipReady },
    { data: readinessScores },
    { count: completedRoadmaps },
    { data: streaks },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("user_type", "student"),
    supabase.from("roadmaps").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("career_readiness").select("*", { count: "exact", head: true }).gte("overall", 70),
    supabase.from("career_readiness").select("overall"),
    supabase.from("roadmaps").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("profiles").select("current_streak_days").eq("user_type", "student"),
  ]);

  const avgReadiness = readinessScores && readinessScores.length > 0
    ? Math.round(readinessScores.reduce((sum, r) => sum + (r.overall || 0), 0) / readinessScores.length)
    : 0;

  const avgStreak = streaks && streaks.length > 0
    ? Math.round(streaks.reduce((sum, s) => sum + (s.current_streak_days || 0), 0) / streaks.length)
    : 0;

  return {
    total_students: totalStudents ?? 0,
    students_skill_mapped: skillMapped ?? 0,
    industry_partners: industryPartners ?? 0,
    active_partnerships: activeJobs ?? 0,
    internship_ready: internshipReady ?? 0,
    placement_pipeline: (internshipReady ?? 0) + (completedRoadmaps ?? 0),
    avg_readiness: avgReadiness,
    completed_roadmaps: completedRoadmaps ?? 0,
    avg_streak: avgStreak,
  };
}

export async function getSkillGaps(limit = 10): Promise<SkillGapData[]> {
  const supabase = await createClient();

  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("id, career_title, user_id, milestones(courses(title, status))")
    .eq("status", "active")
    .limit(500);

  if (!roadmaps || roadmaps.length === 0) return [];

  const skillCounts: Record<string, { total: number; completed: number; career: string }> = {};

  for (const roadmap of roadmaps) {
    const milestones = roadmap.milestones as any[];
    for (const milestone of milestones) {
      for (const course of milestone.courses || []) {
        const skill = course.title;
        if (!skillCounts[skill]) {
          skillCounts[skill] = { total: 0, completed: 0, career: roadmap.career_title };
        }
        skillCounts[skill].total++;
        if (course.status === "completed") {
          skillCounts[skill].completed++;
        }
      }
    }
  }

  return Object.entries(skillCounts)
    .map(([skill, data]) => ({
      skill,
      cohort: `${data.career} track`,
      coverage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      outcome: data.career,
      student_count: data.total,
      ready_count: data.completed,
    }))
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, limit);
}

export async function getCohortReadiness(): Promise<CohortReadiness[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, major, graduation_year")
    .eq("user_type", "student")
    .not("major", "is", null)
    .not("graduation_year", "is", null)
    .limit(500);

  if (!profiles || profiles.length === 0) return [];

  const cohortMap = new Map<string, { students: string[]; department: string; year: number }>();

  for (const p of profiles) {
    const key = `${p.major}-${p.graduation_year}`;
    if (!cohortMap.has(key)) {
      cohortMap.set(key, { students: [], department: p.major || "Unknown", year: p.graduation_year || 2024 });
    }
    cohortMap.get(key)!.students.push(p.id);
  }

  const cohorts: CohortReadiness[] = [];

  for (const [, cohort] of cohortMap) {
    if (cohort.students.length < 3) continue;

    const { data: readiness } = await supabase
      .from("career_readiness")
      .select("overall, technical_skills, projects, communication")
      .in("user_id", cohort.students);

    const { data: roadmaps } = await supabase
      .from("roadmaps")
      .select("id, status, user_id")
      .in("user_id", cohort.students)
      .eq("status", "completed");

    const { data: jobs } = await supabase
      .from("job_applications")
      .select("id, status, job_id")
      .in("user_id", cohort.students)
      .eq("status", "accepted");

    const avgReadiness = readiness && readiness.length > 0
      ? Math.round(readiness.reduce((sum, r) => sum + (r.overall || 0), 0) / readiness.length)
      : 0;

    const skillGaps = readiness && readiness.length > 0
      ? readiness
          .filter(r => (r.technical_skills || 0) < 60 || (r.projects || 0) < 60 || (r.communication || 0) < 60)
          .flatMap(r => {
            const gaps = [];
            if ((r.technical_skills || 0) < 60) gaps.push("Technical skills");
            if ((r.projects || 0) < 60) gaps.push("Projects");
            if ((r.communication || 0) < 60) gaps.push("Communication");
            return gaps;
          })
          .reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {} as Record<string, number>)
      : {};

    const topGaps = Object.entries(skillGaps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    cohorts.push({
      cohort: `${cohort.department} ${cohort.year}`,
      department: cohort.department,
      year: cohort.year,
      student_count: cohort.students.length,
      avg_readiness: avgReadiness,
      internship_ready: readiness?.filter(r => (r.overall || 0) >= 70).length || 0,
      placed: jobs?.length || 0,
      top_skill_gaps: topGaps,
    });
  }

  return cohorts.sort((a, b) => b.student_count - a.student_count);
}

export async function getIndustryPartners(): Promise<IndustryPartner[]> {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, created_at")
    .limit(50);

  if (!companies) return [];

  const partners: IndustryPartner[] = [];

  for (const company of companies) {
    const [{ count: jobsCount }, { count: hiresCount }, { data: collabs }] = await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", company.id).eq("status", "open"),
      supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("jobs.company_id", company.id).eq("status", "accepted"),
      supabase.from("industry_collaborations").select("id").eq("company_id", company.id),
    ]);

    partners.push({
      id: company.id,
      name: company.name,
      collaborations: collabs?.length || 0,
      active_jobs: jobsCount || 0,
      hires: hiresCount || 0,
      last_activity: company.created_at,
    });
  }

  return partners.sort((a, b) => b.active_jobs - a.active_jobs);
}

export async function getPlacementFunnel(): Promise<PlacementFunnel[]> {
  const supabase = await createClient();

  const [{ count: applied }, { count: reviewed }, { count: interviewing }, { count: offered }, { count: accepted }] = await Promise.all([
    supabase.from("job_applications").select("*", { count: "exact", head: true }).in("status", ["applied", "under_review"]),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("status", "under_review"),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("status", "interviewing"),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("status", "offered"),
    supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("status", "accepted"),
  ]);

  const total = applied || 1;

  return [
    { stage: "Applied", count: applied || 0, conversion_rate: 100 },
    { stage: "Under Review", count: reviewed || 0, conversion_rate: Math.round(((reviewed || 0) / total) * 100) },
    { stage: "Interviewing", count: interviewing || 0, conversion_rate: Math.round(((interviewing || 0) / total) * 100) },
    { stage: "Offered", count: offered || 0, conversion_rate: Math.round(((offered || 0) / total) * 100) },
    { stage: "Accepted", count: accepted || 0, conversion_rate: Math.round(((accepted || 0) / total) * 100) },
  ];
}

export async function getStudentList(filters?: { department?: string; year?: number; readiness_min?: number; limit?: number }) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, major, graduation_year, cgpa, current_percentage, skill_tags, xp, level, current_streak_days, created_at")
    .eq("user_type", "student");

  if (filters?.department) {
    query = query.ilike("major", `%${filters.department}%`);
  }
  if (filters?.year) {
    query = query.eq("graduation_year", filters.year);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data: students } = await query.order("created_at", { ascending: false });

  if (!students) return [];

  const studentIds = students.map(s => s.id);

  const [{ data: readiness }, { data: roadmaps }, { data: applications }] = await Promise.all([
    supabase.from("career_readiness").select("user_id, overall, technical_skills, communication, projects, interview_readiness").in("user_id", studentIds),
    supabase.from("roadmaps").select("user_id, career_title, status, milestones(courses(status))").in("user_id", studentIds),
    supabase.from("job_applications").select("user_id, status").in("user_id", studentIds),
  ]);

  const readinessMap = new Map(readiness?.map(r => [r.user_id, r]) || []);
  const roadmapMap = new Map(roadmaps?.map(r => [r.user_id, r]) || []);
  const applicationsMap = new Map<string, any[]>();
  applications?.forEach(app => {
    if (!applicationsMap.has(app.user_id)) applicationsMap.set(app.user_id, []);
    applicationsMap.get(app.user_id)!.push(app);
  });

  return students.map(student => {
    const r = readinessMap.get(student.id);
    const rm = roadmapMap.get(student.id);
    const apps = applicationsMap.get(student.id) || [];

    let roadmapProgress = 0;
    if (rm?.milestones) {
      const milestones = rm.milestones as any[];
      const totalCourses = milestones.flatMap(m => m.courses || []).length;
      const completedCourses = milestones.flatMap(m => m.courses || []).filter(c => c.status === "completed").length;
      roadmapProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    }

    return {
      ...student,
      readiness: r?.overall || 0,
      technical_skills: r?.technical_skills || 0,
      communication: r?.communication || 0,
      projects: r?.projects || 0,
      interview_readiness: r?.interview_readiness || 0,
      career_title: rm?.career_title || "Not selected",
      roadmap_status: rm?.status || "none",
      roadmap_progress: roadmapProgress,
      applications_count: apps.length,
      pending_applications: apps.filter(a => ["applied", "under_review", "interviewing"].includes(a.status)).length,
      offers: apps.filter(a => a.status === "offered").length,
      accepted: apps.filter(a => a.status === "accepted").length,
    };
  }).filter(s => !filters?.readiness_min || s.readiness >= filters.readiness_min);
}