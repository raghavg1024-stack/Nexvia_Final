-- Details confirmed from the official NSP scheme specification PDFs.
update public.scholarships
set amount = '₹50,000 per year',
    max_family_income = 800000,
    source_url = 'https://scholarships.gov.in/public/schemeGuidelines/AICTE/AICTE_2010_G.pdf',
    eligibility_notes = 'For girl students admitted to first year of an eligible technical degree, or second year through lateral entry, in an AICTE-approved institution. Maximum two girl children per family; annual family income must not exceed ₹8 lakh. Confirm current rules on NSP.'
where id = '30000000-0000-0000-0000-000000000001';

update public.scholarships
set amount = '₹50,000 per year',
    max_family_income = 800000,
    source_url = 'https://scholarships.gov.in/public/schemeGuidelines/AICTE/AICTE_2012_G.pdf',
    eligibility_notes = 'For students with at least 40% disability admitted to first year of an eligible technical degree, or second year through lateral entry, in an AICTE-approved institution. Annual family income must not exceed ₹8 lakh. Confirm current rules on NSP.'
where id = '30000000-0000-0000-0000-000000000002';

update public.scholarships
set amount = '₹50,000 per year',
    max_family_income = 800000,
    source_url = 'https://scholarships.gov.in/public/schemeGuidelines/AICTE/AICTE_3039_G.pdf',
    eligibility_notes = 'For eligible orphans, students whose parent(s) died due to COVID-19, wards of personnel martyred in action, or other specified family circumstances, studying in an AICTE-approved course. Annual family income must not exceed ₹8 lakh. Confirm all documentary rules on NSP.'
where id = '30000000-0000-0000-0000-000000000003';

update public.scholarships
set source_url = 'https://scholarships.gov.in/public/schemeGuidelines/ApprovedmodifieddraftofTopClassCollege.pdf'
where id = '30000000-0000-0000-0000-000000000004';

update public.scholarships
set source_url = 'https://scholarships.gov.in/public/schemeGuidelines/tribalfellowshipguideline.pdf'
where id = '30000000-0000-0000-0000-000000000005';

update public.scholarships
set source_url = 'https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf'
where id = '30000000-0000-0000-0000-000000000006';
