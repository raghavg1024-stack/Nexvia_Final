export type MatchBreakdown = Record<string, number>;

export interface MatchingProfile {
  cgpa: number | null;
  current_percentage: number | null;
  twelfth_percentage?: number | null;
  major: string | null;
  education_level: string | null;
  skill_tags: string[];
  gender?: string | null;
  social_category?: string | null;
  disability_percentage?: number | null;
  annual_family_income?: number | null;
  domicile_state?: string | null;
}

const RELATED_TERM_GROUPS = [
  ["ai", "artificial intelligence", "machine learning", "ml", "deep learning"],
  ["python", "pandas", "numpy", "data science", "data analytics"],
  ["javascript", "typescript", "react", "frontend", "web development", "css", "html"],
  ["cybersecurity", "network security", "information security", "linux", "soc"],
  ["marketing", "digital marketing", "seo", "social media", "growth"],
  ["business", "management", "operations", "finance", "commerce"],
  ["computer science", "computer engineering", "information technology", "software engineering"],
  ["engineering", "technology", "technical", "btech", "be"],
  ["agriculture", "horticulture", "forestry", "fisheries"],
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

export function expandProfileTerms(values: string[]) {
  const terms = new Set<string>();
  for (const value of values) {
    const normalized = normalize(value);
    if (!normalized) continue;
    terms.add(normalized);
    for (const word of normalized.split(" ")) if (word.length > 1 && word !== "and" && word !== "or") terms.add(word);
  }
  return [...terms];
}

export function termsAreRelated(first: string, second: string) {
  const a = normalize(first);
  const b = normalize(second);
  if (!a || !b) return false;
  if (a === b || (a.length > 2 && b.includes(a)) || (b.length > 2 && a.includes(b))) return true;
  return RELATED_TERM_GROUPS.some((group) => group.some((term) => a === term || a.includes(term)) && group.some((term) => b === term || b.includes(term)));
}

function listMatchScore(studentTerms: string[], requiredTerms: string[], neutral = 68) {
  if (requiredTerms.length === 0) return neutral;
  const matched = requiredTerms.filter((required) => studentTerms.some((student) => termsAreRelated(student, required)));
  return Math.round((matched.length / requiredTerms.length) * 100);
}

function alternativeMatchScore(studentTerms: string[], allowedTerms: string[], neutral = 68) {
  if (allowedTerms.length === 0) return neutral;
  return allowedTerms.some((allowed) => studentTerms.some((student) => termsAreRelated(student, allowed))) ? 100 : 0;
}

function thresholdStrength(value: number | null | undefined, minimum: number | null | undefined, scale: number) {
  if (value === null || value === undefined) return minimum === null || minimum === undefined ? 55 : 35;
  if (minimum === null || minimum === undefined) return Math.round(Math.min(100, Math.max(0, (value / scale) * 100)));
  if (value < minimum) return 0;
  return Math.round(Math.min(100, 70 + ((value - minimum) / Math.max(scale * 0.2, 1)) * 30));
}

function weightedScore(parts: Array<[number, number]>) {
  return Math.round(parts.reduce((total, [score, weight]) => total + score * weight, 0));
}

export function calculateJobMatch(input: {
  profile: MatchingProfile;
  requiredSkills: string[];
  minimumCgpa: number | null;
  minimumPercentage: number | null;
  eligibleMajors: string[];
  title: string;
  careerTitle?: string | null;
}) {
  const studentSkills = expandProfileTerms(input.profile.skill_tags);
  const skillScore = listMatchScore(studentSkills, input.requiredSkills);
  const academicScore = Math.round((thresholdStrength(input.profile.cgpa, input.minimumCgpa, 10) + thresholdStrength(input.profile.current_percentage, input.minimumPercentage, 100)) / 2);
  const majorScore = alternativeMatchScore(expandProfileTerms([input.profile.major ?? ""]), input.eligibleMajors, 72);
  const careerScore = input.careerTitle ? alternativeMatchScore(expandProfileTerms([input.careerTitle]), [input.title, ...input.requiredSkills], 60) : 55;
  const matchedSkills = input.requiredSkills.filter((required) => studentSkills.some((student) => termsAreRelated(student, required)));
  return {
    matchScore: weightedScore([[skillScore, 0.45], [academicScore, 0.25], [majorScore, 0.15], [careerScore, 0.15]]),
    breakdown: { skills: skillScore, academics: academicScore, field: majorScore, career: careerScore },
    matchedSkills,
    missingSkills: input.requiredSkills.filter((required) => !matchedSkills.includes(required)),
  };
}

export function calculateScholarshipMatch(input: {
  profile: MatchingProfile;
  minimumCgpa: number | null;
  minimumPercentage: number | null;
  educationLevels: string[];
  eligibleMajors: string[];
  relevantSkills: string[];
  eligibleGenders: string[];
  eligibleCategories: string[];
  minimumDisabilityPercentage: number | null;
  maximumFamilyIncome: number | null;
  eligibleStates: string[];
}) {
  const marksValue = input.profile.twelfth_percentage ?? input.profile.current_percentage;
  const academicScore = Math.round((thresholdStrength(input.profile.cgpa, input.minimumCgpa, 10) + thresholdStrength(marksValue, input.minimumPercentage, 100)) / 2);
  const educationScore = alternativeMatchScore([input.profile.education_level ?? ""], input.educationLevels, 70);
  const fieldScore = alternativeMatchScore(expandProfileTerms([input.profile.major ?? ""]), input.eligibleMajors, 70);
  const relevanceScore = listMatchScore(expandProfileTerms(input.profile.skill_tags), input.relevantSkills, 70);
  const checks: Array<{ label: string; status: "pass" | "fail" | "unknown"; detail: string }> = [];
  const addListCheck = (label: string, profileValue: string | null | undefined, allowed: string[]) => {
    if (allowed.length === 0) return;
    if (!profileValue) checks.push({ label, status: "unknown", detail: "Add this detail to your profile" });
    else if (allowed.some((value) => termsAreRelated(profileValue, value))) checks.push({ label, status: "pass", detail: "Profile matches" });
    else checks.push({ label, status: "fail", detail: `Requires ${allowed.join(" / ")}` });
  };
  addListCheck("Gender", input.profile.gender, input.eligibleGenders);
  addListCheck("Category", input.profile.social_category, input.eligibleCategories);
  addListCheck("Domicile", input.profile.domicile_state, input.eligibleStates);
  if (input.minimumDisabilityPercentage !== null) {
    const value = input.profile.disability_percentage;
    checks.push(value === null || value === undefined ? { label: "Disability", status: "unknown", detail: "Add disability percentage to your profile" } : value >= input.minimumDisabilityPercentage ? { label: "Disability", status: "pass", detail: `${value}% meets the requirement` } : { label: "Disability", status: "fail", detail: `Requires at least ${input.minimumDisabilityPercentage}%` });
  }
  if (input.maximumFamilyIncome !== null) {
    const value = input.profile.annual_family_income;
    checks.push(value === null || value === undefined ? { label: "Family income", status: "unknown", detail: "Add annual family income to your profile" } : value <= input.maximumFamilyIncome ? { label: "Family income", status: "pass", detail: "Within the stated limit" } : { label: "Family income", status: "fail", detail: `Limit is ₹${input.maximumFamilyIncome.toLocaleString("en-IN")}` });
  }
  const criteriaScore = checks.length === 0 ? 70 : Math.round(checks.reduce((sum, check) => sum + (check.status === "pass" ? 100 : check.status === "unknown" ? 50 : 0), 0) / checks.length);
  return {
    matchScore: weightedScore([[academicScore, 0.35], [educationScore, 0.2], [fieldScore, 0.15], [relevanceScore, 0.1], [criteriaScore, 0.2]]),
    breakdown: { academics: academicScore, education: educationScore, field: fieldScore, criteria: criteriaScore },
    checks,
    eligibilityStatus: checks.some((check) => check.status === "fail") ? "unlikely" : checks.some((check) => check.status === "unknown") ? "needs_details" : "potential_match",
  } as const;
}
