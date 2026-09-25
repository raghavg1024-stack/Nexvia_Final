import type { ParentDashboardData } from "@/lib/parent";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Sample-only dashboard data used to demonstrate the parent experience. */
export function createDemoParentDashboard(): ParentDashboardData {
  return {
    student: {
      id: "demo-student",
      name: "Aarav Sharma",
      level: 5,
      xp: 1_280,
      current_streak_days: 9,
      longest_streak_days: 14,
      last_active_day: daysAgo(1),
      study_hours_per_week: 8,
      learning_style: "visual",
    },
    assessment: { status: "completed", completed_at: daysAgo(18) },
    analysis: {
      strengths: ["Problem solving", "Data analysis", "Teamwork", "Research"],
      growth_areas: ["Public speaking", "Structured communication", "Portfolio storytelling"],
      summary:
        "Aarav is building a strong analytical foundation and is progressing consistently through practical, project-based learning.",
      learning_style: "visual",
      recommended_pace: "Balanced: three focused study sessions each week.",
      study_capacity_hours: 8,
    },
    recommendation: {
      career_title: "Data Analyst",
      description:
        "A practical pathway focused on turning data into clear, useful business insights.",
      match_percentage: 91,
      reasons: [
        "Strong interest in problem solving and analytical work",
        "Enjoys learning through hands-on projects",
        "Shows steady progress with structured tasks",
      ],
      existing_strengths: ["Problem solving", "Data analysis", "Research"],
      growth_opportunities: ["Data visualization", "SQL", "Presenting insights"],
      is_selected: true,
    },
    roadmap: {
      id: "demo-roadmap",
      career_title: "Data Analyst",
      status: "active",
      created_at: daysAgo(17),
      last_activity_at: daysAgo(1),
      milestones: [
        {
          id: "demo-milestone-1",
          title: "Data foundations",
          description: "Build confidence with spreadsheets and core data concepts.",
          order_index: 1,
          status: "completed",
          courses: [
            { id: "demo-course-1", title: "Spreadsheet essentials", status: "completed", duration_weeks: 2 },
            { id: "demo-course-2", title: "Data thinking", status: "completed", duration_weeks: 1 },
          ],
        },
        {
          id: "demo-milestone-2",
          title: "SQL and dashboards",
          description: "Query data and present a useful story.",
          order_index: 2,
          status: "in_progress",
          courses: [
            { id: "demo-course-3", title: "SQL basics", status: "completed", duration_weeks: 2 },
            { id: "demo-course-4", title: "Dashboard project", status: "in_progress", duration_weeks: 2 },
          ],
        },
        {
          id: "demo-milestone-3",
          title: "Portfolio and interview practice",
          description: "Package work and communicate it with confidence.",
          order_index: 3,
          status: "locked",
          courses: [
            { id: "demo-course-5", title: "Portfolio case study", status: "pending", duration_weeks: 2 },
          ],
        },
      ],
    },
    readiness: {
      overall: 76,
      technical_skills: 82,
      communication: 68,
      projects: 79,
      resume_quality: 71,
      interview_readiness: 73,
      suggestions: ["Practice presenting one project insight each week."],
      updated_at: daysAgo(1),
    },
    interviews: {
      completed_count: 3,
      average_score: 78,
      latest: {
        category: "Behavioral",
        career_title: "Data Analyst",
        overall_score: 81,
        summary: "Clear answers with a good structure; continue building confidence in examples.",
        completed_at: daysAgo(3),
      },
    },
    recent_activity: [
      { reason: "Completed SQL basics practice", amount: 60, created_at: daysAgo(1) },
      { reason: "Finished mock interview", amount: 45, created_at: daysAgo(3) },
      { reason: "Maintained a seven-day learning streak", amount: 25, created_at: daysAgo(5) },
    ],
    encouragements: [
      { id: "demo-note-1", message: "Proud of the steady work you are putting in this week.", created_at: daysAgo(2) },
    ],
  };
}
