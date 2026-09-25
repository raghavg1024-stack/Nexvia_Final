export type UUID = string;

export type EducationLevel =
  | "undergraduate"
  | "graduate"
  | "self_taught";

export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export type RoadmapStatus = "draft" | "active" | "completed" | "paused";

export type MilestoneStatus = "locked" | "in_progress" | "completed";

export interface Profile {
  id: UUID;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_type: "student" | "recruiter" | "academia" | "parent";
  cgpa: number | null;
  current_percentage: number | null;
  tenth_percentage: number | null;
  twelfth_percentage: number | null;
  skill_tags: string[];
  open_to_recruiters: boolean;
  gender: string | null;
  social_category: string | null;
  disability_percentage: number | null;
  annual_family_income: number | null;
  domicile_state: string | null;
  major: string | null;
  graduation_year: number | null;
  education_level: EducationLevel | null;
  study_hours_per_week: number | null;
  goals: string | null;
  learning_style: LearningStyle | null;
  xp: number;
  coins: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_day: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  category:
    | "interest"
    | "skills"
    | "personality"
    | "goals"
    | "learning_style"
    | "study_availability"
    | "education";
  text: string;
  type: "rating" | "choice" | "multiselect";
  options?: string[];
  min?: number;
  max?: number;
  weight?: number;
}

export interface AssessmentResponse {
  question_id: string;
  category: AssessmentQuestion["category"];
  answer: number | string | string[];
}

export type AssessmentStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface Assessment {
  id: UUID;
  user_id: UUID;
  status: AssessmentStatus;
  current_question_index: number;
  responses: AssessmentResponse[];
  started_at: string | null;
  completed_at: string | null;
}

export interface AnalysisReport {
  id: UUID;
  user_id: UUID;
  strengths: string[];
  growth_areas: string[];
  learning_style: LearningStyle;
  study_capacity_hours: number;
  recommended_pace: string;
  summary: string;
  created_at: string;
}

export interface Career {
  id: UUID;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  salary_range: string;
  demand: "low" | "medium" | "high" | "very_high";
  icon: string;
}

export interface CareerRecommendation {
  id: UUID;
  user_id: UUID;
  career_id: UUID;
  match_percentage: number;
  reasons: string[];
  required_skills: string[];
  existing_strengths: string[];
  growth_opportunities: string[];
  is_selected: boolean;
  created_at: string;
}

export interface Course {
  id: UUID;
  title: string;
  description: string;
  duration_weeks: number;
  order_index: number;
  status: "pending" | "in_progress" | "completed";
  started_at?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
}

export interface Milestone {
  id: UUID;
  title: string;
  description: string;
  order_index: number;
  status: MilestoneStatus;
  courses: Course[];
}

export interface Roadmap {
  id: UUID;
  user_id: UUID;
  career_id: UUID;
  career_title: string;
  status: RoadmapStatus;
  milestones: Milestone[];
  created_at: string;
  last_activity_at: string | null;
}

export interface Badge {
  id: UUID;
  key: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number | null;
  criteria: string | null;
}

export interface UserBadge {
  badge_key: string;
  earned_at: string;
}

export interface XpTransaction {
  id: UUID;
  user_id: UUID;
  amount: number;
  reason: string;
  created_at: string;
}

export type RewardType = "xp" | "coins";

export interface RewardGrant {
  type: RewardType;
  amount: number;
  reason: string;
}

export interface CareerReadiness {
  technical_skills: number;
  communication: number;
  projects: number;
  resume_quality: number;
  interview_readiness: number;
  overall: number;
  suggestions: string[];
}

export interface Certificate {
  id: UUID;
  user_id: UUID;
  roadmap_id: UUID;
  title: string;
  credential_id: string;
  issued_at: string;
}

export type MentorRole = "user" | "assistant";

export interface MentorMessage {
  id: UUID;
  user_id: UUID;
  role: MentorRole;
  content: string;
  created_at: string;
}

export interface StudyGroup {
  id: UUID;
  name: string;
  description: string | null;
  owner_id: UUID;
  created_at: string;
}

export interface StudyGroupMember {
  group_id: UUID;
  user_id: UUID;
  joined_at: string;
}

export interface StudyGroupMessage {
  id: UUID;
  group_id: UUID;
  user_id: UUID;
  user_name: string | null;
  content: string;
  created_at: string;
}

export interface CareerReadinessScore {
  id: UUID;
  user_id: UUID;
  technical_skills: number;
  communication: number;
  projects: number;
  resume_quality: number;
  interview_readiness: number;
  overall: number;
  suggestions: string[];
  updated_at: string;
}

export interface Company {
  id: UUID;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface CandidateProfile {
  user_id: UUID;
  display_name: string;
  cgpa: number | null;
  current_percentage: number | null;
  major: string | null;
  skill_tags: string[];
  open_to_recruiters: boolean;
  updated_at: string;
}

export interface Job {
  id: UUID;
  company_id: UUID;
  title: string;
  role_type: "internship" | "full_time" | "part_time";
  description: string;
  required_skills: string[];
  min_cgpa: number | null;
  min_percentage: number | null;
  eligible_majors: string[];
  application_url: string | null;
  location: string | null;
  source_name: string | null;
  source_url: string | null;
  verified_at: string | null;
  status: "open" | "closed";
  created_at: string;
}

export interface Scholarship {
  id: UUID;
  provider_name: string;
  title: string;
  description: string;
  min_cgpa: number | null;
  min_percentage: number | null;
  amount: string;
  deadline: string | null;
  eligible_education_levels: string[];
  required_skills: string[];
  application_url: string | null;
  eligible_majors: string[];
  eligible_genders: string[];
  eligible_categories: string[];
  min_disability_percentage: number | null;
  max_family_income: number | null;
  eligible_states: string[];
  eligibility_notes: string | null;
  source_name: string | null;
  source_url: string | null;
  verified_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface JobApplication {
  id: UUID;
  job_id: UUID;
  user_id: UUID;
  match_score: number | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  applied_at: string;
}
