export interface CareerJobSource {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  required_skills?: string[] | null;
}

interface CareerJobMatch {
  category: string;
  aliases: string[];
}

const CAREER_JOB_MATCHES: Record<string, CareerJobMatch> = {
  "Software Engineer": {
    category: "programming",
    aliases: ["software engineer", "software developer", "web developer", "full stack", "frontend", "backend", "devops", "programmer"],
  },
  "Data Scientist": {
    category: "data-science",
    aliases: ["data scientist", "data analyst", "machine learning", "analytics", "business intelligence"],
  },
  "UX/UI Designer": {
    category: "design",
    aliases: ["ux designer", "ui designer", "product designer", "interaction designer", "user experience", "user interface"],
  },
  "Product Manager": {
    category: "programming",
    aliases: ["product manager", "product owner", "program manager", "technical product"],
  },
  "Data Analyst": {
    category: "data-science",
    aliases: ["data analyst", "business analyst", "analytics", "business intelligence", "insights analyst"],
  },
  "Technical Writer": {
    category: "writing",
    aliases: ["technical writer", "documentation writer", "content writer", "technical editor"],
  },
  "Cybersecurity Analyst": {
    category: "programming",
    aliases: ["cybersecurity", "cyber security", "security analyst", "soc analyst", "information security", "infosec"],
  },
  "Entrepreneur / Startup Founder": {
    category: "sales",
    aliases: ["founder", "entrepreneur", "startup", "business development", "growth lead"],
  },
  "Graphic Designer": {
    category: "design",
    aliases: ["graphic designer", "visual designer", "brand designer", "creative designer", "illustrator"],
  },
  "Digital Marketer": {
    category: "marketing",
    aliases: ["digital marketer", "digital marketing", "seo", "content marketing", "growth marketing", "social media"],
  },
  "Project Manager": {
    category: "customer-support",
    aliases: ["project manager", "program manager", "project coordinator", "delivery manager"],
  },
  "Technical Project Manager": {
    category: "programming",
    aliases: ["technical project manager", "technical program manager", "engineering project manager"],
  },
  "Cloud Architect": {
    category: "programming",
    aliases: ["cloud architect", "solutions architect", "cloud engineer", "aws architect", "azure architect"],
  },
  "Product Designer": {
    category: "design",
    aliases: ["product designer", "ux designer", "ui designer", "interaction designer"],
  },
  "Financial Analyst": {
    category: "data-science",
    aliases: ["financial analyst", "finance analyst", "investment analyst", "fp&a", "risk analyst"],
  },
  "Operations Manager": {
    category: "customer-support",
    aliases: ["operations manager", "business operations", "operations lead", "operations coordinator"],
  },
  "Sales Manager": {
    category: "sales",
    aliases: ["sales manager", "account executive", "sales lead", "business development"],
  },
  "Data Journalist": {
    category: "writing",
    aliases: ["data journalist", "data reporter", "research journalist", "data writer"],
  },
  "Data Science Specialist": {
    category: "data-science",
    aliases: ["data scientist", "data science", "machine learning scientist", "analytics scientist"],
  },
  "AI/ML Engineer": {
    category: "data-science",
    aliases: ["machine learning engineer", "ai engineer", "ml engineer", "applied scientist", "artificial intelligence"],
  },
  "Quantitative Analyst": {
    category: "data-science",
    aliases: ["quantitative analyst", "quant analyst", "quantitative researcher", "risk analyst"],
  },
  "Registered Nurse": {
    category: "customer-support",
    aliases: ["registered nurse", "staff nurse", "clinical nurse", "telehealth nurse", "nurse case manager"],
  },
  Chef: {
    category: "customer-support",
    aliases: ["chef", "cook", "culinary", "kitchen", "pastry", "bakery", "food service", "restaurant", "catering"],
  },
  "Marketing Manager": {
    category: "marketing",
    aliases: ["marketing manager", "brand manager", "growth marketing", "product marketing"],
  },
  "Social Worker": {
    category: "customer-support",
    aliases: ["social worker", "case manager", "care coordinator", "community support"],
  },
};

const VALID_CATEGORIES = new Set(["programming", "design", "writing", "sales", "marketing", "customer-support", "data-science"]);
const GENERIC_WORDS = new Set(["and", "the", "specialist", "manager", "professional", "career"]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").replace(/\s+/g, " ").trim();
}

function containsTerm(value: string, term: string) {
  const normalizedValue = ` ${normalize(value)} `;
  const normalizedTerm = normalize(term);
  return normalizedTerm.length > 1 && normalizedValue.includes(` ${normalizedTerm} `);
}

export function getCareerJobMatch(careerTitle: string): CareerJobMatch {
  const normalizedCareer = normalize(careerTitle);
  for (const [career, match] of Object.entries(CAREER_JOB_MATCHES)) {
    const normalizedKnownCareer = normalize(career);
    if (normalizedCareer.includes(normalizedKnownCareer) || normalizedKnownCareer.includes(normalizedCareer)) return match;
  }

  const slug = normalizedCareer.replace(/\s+/g, "-");
  const usefulWords = normalizedCareer.split(" ").filter((word) => word.length > 2 && !GENERIC_WORDS.has(word));
  return {
    category: VALID_CATEGORIES.has(slug) ? slug : "customer-support",
    aliases: [careerTitle, ...usefulWords],
  };
}

export function isJobRelevantToCareer(careerTitle: string, job: CareerJobSource) {
  if (!careerTitle.trim() || !job.title?.trim()) return false;
  const { aliases } = getCareerJobMatch(careerTitle);

  // A role title must name the selected career or a closely related role. This
  // prevents broad category feeds from leaking unrelated jobs into the list.
  if (aliases.some((alias) => containsTerm(job.title ?? "", alias))) return true;

  // Some employers use generic titles such as "Associate". Keep those only
  // when at least two career signals appear in the role details.
  const details = `${job.description ?? ""} ${job.category ?? ""} ${(job.required_skills ?? []).join(" ")}`;
  let signals = 0;
  for (const alias of aliases) {
    if (containsTerm(details, alias)) signals += 1;
    if (signals >= 2) return true;
  }
  return false;
}
