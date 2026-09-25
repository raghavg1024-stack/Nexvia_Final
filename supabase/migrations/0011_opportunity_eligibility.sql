-- Academic eligibility and two-way opportunity matching.
alter table public.profiles add column if not exists current_percentage numeric(5,2);
alter table public.profiles add column if not exists tenth_percentage numeric(5,2);
alter table public.profiles add column if not exists twelfth_percentage numeric(5,2);
alter table public.profiles add column if not exists skill_tags jsonb not null default '[]'::jsonb;

alter table public.jobs add column if not exists min_percentage numeric(5,2);
alter table public.jobs add column if not exists eligible_majors jsonb not null default '[]'::jsonb;
alter table public.jobs add column if not exists application_url text;
alter table public.jobs add column if not exists location text default 'Remote';

alter table public.scholarships add column if not exists min_percentage numeric(5,2);
alter table public.scholarships add column if not exists eligible_education_levels jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists required_skills jsonb not null default '[]'::jsonb;
alter table public.scholarships add column if not exists application_url text;

create index if not exists jobs_open_cgpa_idx on public.jobs (min_cgpa) where status = 'open';
create index if not exists scholarships_cgpa_idx on public.scholarships (min_cgpa);

insert into public.companies (id, name, description, website)
values ('10000000-0000-0000-0000-000000000001', 'Nexvia Demo Labs', 'A sample hiring partner using Nexvia matching.', 'https://nexvia.app')
on conflict (id) do nothing;

insert into public.jobs (company_id, title, role_type, description, required_skills, min_cgpa, min_percentage, application_url, location)
select '10000000-0000-0000-0000-000000000001', 'ML Intern', 'internship', 'Build practical machine-learning features with a product team.', '["Python", "Pandas", "Machine Learning"]'::jsonb, 7.0, 70, 'https://nexvia.app', 'Remote'
where not exists (select 1 from public.jobs where title = 'ML Intern' and company_id = '10000000-0000-0000-0000-000000000001');

insert into public.jobs (company_id, title, role_type, description, required_skills, min_cgpa, min_percentage, application_url, location)
select '10000000-0000-0000-0000-000000000001', 'Frontend Developer Intern', 'internship', 'Ship accessible interfaces and learn from senior product engineers.', '["React", "TypeScript", "CSS"]'::jsonb, 6.5, 65, 'https://nexvia.app', 'Hybrid'
where not exists (select 1 from public.jobs where title = 'Frontend Developer Intern' and company_id = '10000000-0000-0000-0000-000000000001');

insert into public.scholarships (provider_name, title, description, min_cgpa, min_percentage, amount, deadline, eligible_education_levels, required_skills, application_url)
select 'Nexvia Education Fund', 'Future Builders Grant', 'Support for students building a verified career roadmap and portfolio.', 7.0, 70, '₹50,000', '2027-03-31', '["undergraduate", "graduate"]'::jsonb, '[]'::jsonb, 'https://nexvia.app'
where not exists (select 1 from public.scholarships where title = 'Future Builders Grant');

insert into public.scholarships (provider_name, title, description, min_cgpa, min_percentage, amount, deadline, eligible_education_levels, required_skills, application_url)
select 'TechPath Foundation', 'Women in AI Scholarship', 'Tuition support for learners pursuing data, AI, or software careers.', 7.5, 75, '₹75,000', '2027-05-15', '["undergraduate", "graduate"]'::jsonb, '["Python", "Machine Learning"]'::jsonb, 'https://nexvia.app'
where not exists (select 1 from public.scholarships where title = 'Women in AI Scholarship');
