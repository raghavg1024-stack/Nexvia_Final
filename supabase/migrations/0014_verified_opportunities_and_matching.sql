-- Richer student eligibility data and verifiable opportunity sources.
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists social_category text;
alter table public.profiles add column if not exists disability_percentage numeric(5,2);
alter table public.profiles add column if not exists annual_family_income numeric(12,2);
alter table public.profiles add column if not exists domicile_state text;

alter table public.jobs add column if not exists source_name text;
alter table public.jobs add column if not exists source_url text;
alter table public.jobs add column if not exists verified_at date;

alter table public.scholarships add column if not exists eligible_majors jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists eligible_genders jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists eligible_categories jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists min_disability_percentage numeric(5,2);
alter table public.scholarships add column if not exists max_family_income numeric(12,2);
alter table public.scholarships add column if not exists eligible_states jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists eligibility_notes text;
alter table public.scholarships add column if not exists source_name text;
alter table public.scholarships add column if not exists source_url text;
alter table public.scholarships add column if not exists verified_at date;
alter table public.scholarships add column if not exists is_active boolean not null default true;

update public.companies
set name = 'AICTE National Internship Portal',
    description = 'Verified internship discovery portal operated by AICTE, Ministry of Education, Government of India.',
    website = 'https://internship.aicte-india.org/'
where id = '10000000-0000-0000-0000-000000000001';

update public.jobs
set status = 'closed'
where company_id = '10000000-0000-0000-0000-000000000001';

insert into public.jobs (id, company_id, title, role_type, description, required_skills, min_cgpa, min_percentage, eligible_majors, application_url, location, source_name, source_url, verified_at)
values
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'AI & Data Science Internship Opportunities', 'internship', 'Browse current AICTE-verified internships in artificial intelligence, machine learning and data science.', '["Python","Pandas","Machine Learning"]', 6.0, 60, '["Computer Science","Artificial Intelligence","Machine Learning","Data Science","Engineering"]', 'https://internship.aicte-india.org/internships.php', 'India · Remote / On-site', 'AICTE National Internship Portal', 'https://internship.aicte-india.org/', current_date),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Software & Web Development Internships', 'internship', 'Browse current verified software, frontend and web-development internships on the national portal.', '["JavaScript","React","TypeScript","Git"]', 6.0, 55, '["Computer Science","Information Technology","Software Engineering","Engineering"]', 'https://internship.aicte-india.org/internships.php', 'India · Remote / On-site', 'AICTE National Internship Portal', 'https://internship.aicte-india.org/', current_date),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Cybersecurity Internship Opportunities', 'internship', 'Browse verified internships in cybersecurity, network security and security operations.', '["Cybersecurity","Linux","Network Security","Python"]', 6.5, 60, '["Computer Science","Information Technology","Cybersecurity","Engineering"]', 'https://internship.aicte-india.org/internships.php', 'India · Remote / On-site', 'AICTE National Internship Portal', 'https://internship.aicte-india.org/', current_date),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Business, Marketing & Analytics Internships', 'internship', 'Browse verified internships across marketing, management, finance, operations and business analytics.', '["Communication","Marketing","Analytics"]', 5.5, 50, '["Business","Management","Commerce","Marketing","Finance"]', 'https://internship.aicte-india.org/internships.php', 'India · Remote / On-site', 'AICTE National Internship Portal', 'https://internship.aicte-india.org/', current_date)
on conflict (id) do update set
title = excluded.title, description = excluded.description, required_skills = excluded.required_skills,
min_cgpa = excluded.min_cgpa, min_percentage = excluded.min_percentage, eligible_majors = excluded.eligible_majors,
application_url = excluded.application_url, location = excluded.location, source_name = excluded.source_name,
source_url = excluded.source_url, verified_at = excluded.verified_at, status = 'open';

update public.scholarships
set is_active = false
where title in ('Future Builders Grant', 'Women in AI Scholarship');

insert into public.scholarships (id, provider_name, title, description, min_cgpa, min_percentage, amount, deadline, eligible_education_levels, required_skills, application_url, eligible_majors, eligible_genders, eligible_categories, min_disability_percentage, max_family_income, eligible_states, eligibility_notes, source_name, source_url, verified_at, is_active)
values
('30000000-0000-0000-0000-000000000001', 'All India Council for Technical Education', 'AICTE Pragati Scholarship — Technical Degree', 'Government scholarship scheme for girl students pursuing an eligible technical degree.', null, null, 'See official scheme specification', '2026-10-31', '["undergraduate"]', '["Engineering","Technology"]', 'https://scholarships.gov.in/All-Scholarships', '["Engineering","Technology","Computer Science","Information Technology","Artificial Intelligence","Data Science"]', '["female"]', '[]', null, null, '[]', 'Institution, admission year, family-income and other official rules also apply.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true),
('30000000-0000-0000-0000-000000000002', 'All India Council for Technical Education', 'AICTE Saksham Scholarship — Technical Degree', 'Government scholarship scheme for specially-abled students pursuing an eligible technical degree.', null, null, 'See official scheme specification', '2026-10-31', '["undergraduate"]', '["Engineering","Technology"]', 'https://scholarships.gov.in/All-Scholarships', '["Engineering","Technology","Computer Science","Information Technology","Artificial Intelligence","Data Science"]', '[]', '[]', 40, null, '[]', 'Institution, admission year, disability certificate and other official rules also apply.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true),
('30000000-0000-0000-0000-000000000003', 'All India Council for Technical Education', 'AICTE Swanath Scholarship — Technical Degree', 'Government welfare scholarship for eligible orphan students, wards affected by COVID-19, or wards of personnel martyred in action.', null, null, 'See official scheme specification', '2026-10-31', '["undergraduate"]', '["Engineering","Technology"]', 'https://scholarships.gov.in/All-Scholarships', '["Engineering","Technology","Computer Science","Information Technology","Artificial Intelligence","Data Science"]', '[]', '[]', null, null, '[]', 'Special family-circumstance, institution, admission and income rules must be confirmed on NSP.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true),
('30000000-0000-0000-0000-000000000004', 'Department of Social Justice & Empowerment', 'PM YASASVI Top Class Education in College', 'Central-sector merit scholarship for eligible OBC, EBC and DNT students in notified institutions.', null, null, 'See official scheme specification', '2026-10-31', '["undergraduate"]', '[]', 'https://scholarships.gov.in/All-Scholarships', '[]', '[]', '["OBC","EBC","DNT"]', null, null, '[]', 'Category, institution, income and admission rules must be confirmed on NSP.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true),
('30000000-0000-0000-0000-000000000005', 'Ministry of Tribal Affairs', 'National Scholarship for Higher Education of ST Students', 'Top-class higher-education scholarship for eligible Scheduled Tribe students studying in notified institutions.', null, null, 'See official scheme specification', '2026-10-31', '["undergraduate"]', '[]', 'https://scholarships.gov.in/All-Scholarships', '[]', '[]', '["ST"]', null, null, '[]', 'Category, institution, family-income and course rules must be confirmed on NSP.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true),
('30000000-0000-0000-0000-000000000006', 'Department of Higher Education', 'PM-USP Central Sector Scholarship — Renewal', 'Renewal applications for the Central Sector Scheme of Scholarship for College and University Students for AY 2026–27.', null, null, 'See official scheme specification', '2026-09-30', '["undergraduate"]', '[]', 'https://scholarships.gov.in/All-Scholarships', '[]', '[]', '[]', null, 450000, '[]', 'The current window is for renewal applicants. Merit percentile, regular-course and other official rules apply.', 'National Scholarship Portal', 'https://scholarships.gov.in/All-Scholarships', current_date, true)
on conflict (id) do update set
provider_name = excluded.provider_name, title = excluded.title, description = excluded.description,
deadline = excluded.deadline, eligible_education_levels = excluded.eligible_education_levels,
required_skills = excluded.required_skills, application_url = excluded.application_url,
eligible_majors = excluded.eligible_majors, eligible_genders = excluded.eligible_genders,
eligible_categories = excluded.eligible_categories, min_disability_percentage = excluded.min_disability_percentage,
max_family_income = excluded.max_family_income, eligible_states = excluded.eligible_states,
eligibility_notes = excluded.eligibility_notes, source_name = excluded.source_name,
source_url = excluded.source_url, verified_at = excluded.verified_at, is_active = true;

create index if not exists scholarships_active_deadline_idx on public.scholarships(deadline) where is_active = true;
