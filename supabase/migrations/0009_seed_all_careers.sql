-- Keep the database career catalog aligned with src/lib/data.ts. Assessment
-- recommendations reference these rows through a foreign key.
insert into public.careers
  (id, title, description, category, required_skills, salary_range, demand, icon)
values
  ('00000000-0000-0000-0000-000000000009', 'Graphic Designer', 'Create visual concepts, using computer software, to communicate ideas that inspire and captivate consumers.', 'Design', '["Design", "Creativity", "Problem solving"]'::jsonb, '$45k - $95k', 'high', '🖌️'),
  ('00000000-0000-0000-0000-000000000010', 'Digital Marketer', 'Promote brands, products, or services using digital channels, including social media, SEO, email, and websites.', 'Business', '["Writing", "Public speaking", "Analytics", "Creativity"]'::jsonb, '$50k - $120k', 'high', '📈'),
  ('00000000-0000-0000-0000-000000000011', 'Project Manager', 'Plan, execute, and finalize projects according to strict deadlines and budget.', 'Business', '["Leadership", "Organization", "Communication", "Risk management"]'::jsonb, '$75k - $135k', 'high', '📊'),
  ('00000000-0000-0000-0000-000000000012', 'Technical Project Manager', 'Bridge the gap between technical teams and stakeholders, ensuring projects are delivered on time and within scope.', 'Technology', '["Leadership", "Technical understanding", "Communication", "Agile methodologies"]'::jsonb, '$85k - $150k', 'very_high', '🔧'),
  ('00000000-0000-0000-0000-000000000013', 'Cloud Architect', 'Design and manage cloud computing strategies, including cloud adoption, migration, and governance.', 'Technology', '["AWS/Azure", "Networking", "Security", "Database management"]'::jsonb, '$110k - $180k', 'very_high', '☁️'),
  ('00000000-0000-0000-0000-000000000014', 'Product Designer', 'Own the end-to-end design process from user research to pixel-perfect interfaces, ensuring products are both usable and beautiful.', 'Design', '["Design", "User research", "Prototyping", "Design systems"]'::jsonb, '$70k - $130k', 'high', '🎯'),
  ('00000000-0000-0000-0000-000000000015', 'Financial Analyst', 'Analyze financial data to help businesses make investment decisions and manage risk.', 'Business', '["Analytical thinking", "Excel/Financial modeling", "Accounting", "Communication"]'::jsonb, '$60k - $120k', 'medium', '💰'),
  ('00000000-0000-0000-0000-000000000016', 'Operations Manager', 'Oversee daily business operations, improve efficiency, and manage teams to ensure smooth workflows.', 'Business', '["Leadership", "Organization", "Communication", "Process management"]'::jsonb, '$65k - $130k', 'high', '📋'),
  ('00000000-0000-0000-0000-000000000017', 'Sales Manager', 'Lead sales teams, develop strategies, and drive revenue growth for products or services.', 'Business', '["Leadership", "Public speaking", "Negotiation", "Customer relationship management"]'::jsonb, '$70k - $150k', 'high', '💼'),
  ('00000000-0000-0000-0000-000000000018', 'Technical Writer', 'Create clear documentation, tutorials, and content that make tech easy to understand.', 'Communication', '["Writing", "Research", "Public speaking"]'::jsonb, '$50k - $100k', 'medium', '✍️'),
  ('00000000-0000-0000-0000-000000000019', 'Product Designer', 'Own the end-to-end design process from user research to pixel-perfect interfaces, ensuring products are both usable and beautiful.', 'Design', '["Design", "User research", "Prototyping", "Design systems"]'::jsonb, '$70k - $130k', 'high', '🎨'),
  ('00000000-0000-0000-0000-000000000020', 'Data Journalist', 'Investigate and story-tell data to find patterns and help organizations make data-driven decisions.', 'Media', '["Data analysis", "Writing", "Research"]'::jsonb, '$45k - $95k', 'medium', '📰'),
  ('00000000-0000-0000-0000-000000000026', 'Data Science Specialist', 'Analyze complex data to extract patterns and build predictive models for business decisions.', 'Technology', '["Python", "R", "SQL", "Statistical Analysis", "Machine Learning"]'::jsonb, '$85k - $160k', 'very_high', '📈'),
  ('00000000-0000-0000-0000-000000000027', 'AI/ML Engineer', 'Design and implement machine learning models and AI systems for automated decision-making.', 'Technology', '["Python", "Machine Learning", "Deep Learning", "Data Engineering", "MLOps"]'::jsonb, '$95k - $180k', 'very_high', '🤖'),
  ('00000000-0000-0000-0000-000000000028', 'Quantitative Analyst', 'Apply mathematical and statistical methods to financial and risk analysis problems.', 'Finance', '["Mathematics", "Statistical Analysis", "Python/R", "Financial Modeling"]'::jsonb, '$100k - $200k', 'very_high', '💹'),
  ('00000000-0000-0000-0000-000000000022', 'Registered Nurse', 'Provide and coordinate patient care, educate patients and the public about various health conditions, and provide emotional support to patients and their families.', 'Healthcare', '["Compassion", "Clinical skills", "Attention to detail", "Communication"]'::jsonb, '$60k - $100k', 'very_high', '🏥'),
  ('00000000-0000-0000-0000-000000000023', 'Chef', 'Plan and direct food preparation and cooking activities of a kitchen, create menus, and supervise staff.', 'Hospitality', '["Creativity", "Time management", "Food safety knowledge", "Leadership"]'::jsonb, '$45k - $100k', 'medium', '👨‍🍳'),
  ('00000000-0000-0000-0000-000000000024', 'Marketing Manager', 'Develop strategic marketing campaigns, manage brand presence, and analyze market trends to drive customer acquisition and retention.', 'Business', '["Strategic thinking", "Analytics", "Creativity", "Leadership", "Communication"]'::jsonb, '$80k - $160k', 'high', '📈'),
  ('00000000-0000-0000-0000-000000000025', 'Social Worker', 'Help individuals, families, and groups cope with problems and improve their social functioning.', 'Social Services', '["Compassion", "Active listening", "Case management", "Crisis intervention"]'::jsonb, '$45k - $75k', 'high', '🤝')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  required_skills = excluded.required_skills,
  salary_range = excluded.salary_range,
  demand = excluded.demand,
  icon = excluded.icon;
