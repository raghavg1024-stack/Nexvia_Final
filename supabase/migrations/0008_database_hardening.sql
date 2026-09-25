-- Remove API execution from a trigger-only security-definer function.
-- PostgreSQL triggers continue to invoke their trigger function normally.
revoke all on function public.auto_confirm_email() from public, anon, authenticated;

-- Cover existing foreign keys used by user, roadmap, and community lookups.
create index if not exists analysis_reports_user_id_idx
  on public.analysis_reports (user_id);
create index if not exists career_recommendations_career_id_idx
  on public.career_recommendations (career_id);
create index if not exists career_recommendations_user_id_idx
  on public.career_recommendations (user_id);
create index if not exists certificates_roadmap_id_idx
  on public.certificates (roadmap_id);
create index if not exists certificates_user_id_idx
  on public.certificates (user_id);
create index if not exists courses_milestone_id_idx
  on public.courses (milestone_id);
create index if not exists roadmaps_career_id_idx
  on public.roadmaps (career_id);
create index if not exists roadmaps_user_id_idx
  on public.roadmaps (user_id);
create index if not exists study_group_members_user_id_idx
  on public.study_group_members (user_id);
create index if not exists study_group_messages_user_id_idx
  on public.study_group_messages (user_id);
create index if not exists study_groups_owner_id_idx
  on public.study_groups (owner_id);
create index if not exists user_badges_badge_key_idx
  on public.user_badges (badge_key);
