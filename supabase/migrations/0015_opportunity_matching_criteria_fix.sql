-- Treat majors as alternative eligibility paths and keep scholarship skills neutral.
update public.jobs
set eligible_majors = '["Computer Science","Information Technology","Software Engineering","Engineering","Artificial Intelligence","Machine Learning","Data Science"]'::jsonb
where id in (
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
);

update public.scholarships
set required_skills = '[]'::jsonb
where source_name = 'National Scholarship Portal';
