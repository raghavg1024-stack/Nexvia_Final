import type { AssessmentQuestion, Badge, Career } from "./types";

export const XP_RULES = {
  assessment_completed: 50,
  career_selected: 20,
  course_started: 10,
  course_completed: 100,
  quiz_perfect_score: 40,
  quiz_passed: 20,
  project_submitted: 80,
  project_approved: 150,
  daily_check_in: 10,
  mentor_first_message: 15,
  milestone_completed: 200,
  roadmap_completed: 1000,
  certificate_earned: 300,
  quiz_completion: 30,
  profile_edited: 50,
  peer_insight_viewed: 15,
} as const;

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "interest_1",
    category: "interest",
    text: "How much do you enjoy solving puzzles or logic problems?",
    type: "rating",
    min: 1,
    max: 5,
    weight: 1,
  },
  {
    id: "interest_2",
    category: "interest",
    text: "How excited are you about creating things (apps, art, designs, content)?",
    type: "rating",
    min: 1,
    max: 5,
    weight: 1,
  },
  {
    id: "interest_3",
    category: "interest",
    text: "How much do you enjoy helping others learn or grow?",
    type: "rating",
    min: 1,
    max: 5,
    weight: 1,
  },
  {
    id: "interest_4",
    category: "interest",
    text: "How do you handle tight deadlines?",
    type: "choice",
    options: ["I plan ahead and work steadily", "I thrive under pressure and focus intensely", "I prefer to start early and avoid rushing", "I ask for help and redistribute tasks"],
    weight: 1,
  },
  {
    id: "interest_5",
    category: "interest",
    text: "What type of learning environment suits you best?",
    type: "choice",
    options: ["Structured lectures with clear objectives", "Hands-on projects and experiments", "Collaborative group work", "Independent study with freedom"],
    weight: 1,
  },
  {
    id: "skills_1",
    category: "skills",
    text: "Which of these best describes your current skill level?",
    type: "choice",
    options: ["Beginner", "Intermediate", "Advanced"],
    weight: 1,
  },
  {
    id: "skills_2",
    category: "skills",
    text: "Select the skills you already have:",
    type: "multiselect",
    options: [
      "Problem solving",
      "Programming",
      "Writing",
      "Public speaking",
      "Design",
      "Data analysis",
      "Teamwork",
      "Research",
    ],
    weight: 1,
  },
  {
    id: "personality_1",
    category: "personality",
    text: "In a team, you usually prefer to:",
    type: "choice",
    options: [
      "Lead and organize",
      "Analyze and plan",
      "Create and brainstorm",
      "Support and execute",
    ],
    weight: 1,
  },
  {
    id: "personality_2",
    category: "personality",
    text: "How comfortable are you working independently?",
    type: "rating",
    min: 1,
    max: 5,
    weight: 1,
  },
  {
    id: "goals_1",
    category: "goals",
    text: "What is your primary goal right now?",
    type: "choice",
    options: [
      "Get my first job",
      "Build my own business",
      "Learn a new skill",
      "Advance my career",
      "Change careers",
    ],
    weight: 1,
  },
  {
    id: "learning_style_1",
    category: "learning_style",
    text: "How do you learn best?",
    type: "choice",
    options: ["Watching videos", "Listening/audio", "Reading notes", "Hands-on practice"],
    weight: 1,
  },
  {
    id: "study_availability_1",
    category: "study_availability",
    text: "How many hours can you study per week?",
    type: "choice",
    options: ["Less than 3", "3-5", "5-10", "10-15", "15+"],
    weight: 1,
  },
  {
    id: "education_1",
    category: "education",
    text: "What is your current education level?",
    type: "choice",
    options: ["Undergraduate", "Graduate", "Self-taught"],
    weight: 1,
  },
];

export const CAREERS: Career[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Software Engineer",
    description:
      "Design, build, and maintain software products from web apps to mobile apps.",
    category: "Technology",
    required_skills: ["Programming", "Problem solving", "Data analysis"],
    salary_range: "$70k - $150k",
    demand: "very_high",
    icon: "💻",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Data Scientist",
    description:
      "Analyze data to find patterns and help organizations make better decisions.",
    category: "Technology",
    required_skills: ["Data analysis", "Programming", "Problem solving"],
    salary_range: "$80k - $160k",
    demand: "very_high",
    icon: "📊",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "UX/UI Designer",
    description:
      "Design intuitive, beautiful, and accessible user experiences and interfaces.",
    category: "Design",
    required_skills: ["Design", "Problem solving", "Teamwork"],
    salary_range: "$60k - $130k",
    demand: "high",
    icon: "🎨",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "Product Manager",
    description:
      "Define the vision for a product and guide a team to ship it successfully.",
    category: "Business",
    required_skills: ["Teamwork", "Research", "Writing", "Public speaking"],
    salary_range: "$80k - $160k",
    demand: "high",
    icon: "📦",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    title: "Data Analyst",
    description:
      "Turn raw data into clear insights that guide everyday business decisions.",
    category: "Technology",
    required_skills: ["Data analysis", "Research", "Problem solving"],
    salary_range: "$55k - $110k",
    demand: "very_high",
    icon: "🔍",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    title: "Technical Writer",
    description:
      "Create clear documentation, tutorials, and content that make tech easy to understand.",
    category: "Communication",
    required_skills: ["Writing", "Research", "Public speaking"],
    salary_range: "$50k - $100k",
    demand: "medium",
    icon: "✍️",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    title: "Cybersecurity Analyst",
    description:
      "Protect organizations from cyber threats and keep systems and data safe.",
    category: "Technology",
    required_skills: ["Problem solving", "Programming", "Data analysis"],
    salary_range: "$70k - $140k",
    demand: "very_high",
    icon: "🛡️",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    title: "Entrepreneur / Startup Founder",
    description:
      "Spot problems, build products, and lead a team to bring an idea to life.",
    category: "Business",
    required_skills: ["Public speaking", "Teamwork", "Research", "Writing"],
    salary_range: "Variable",
    demand: "medium",
    icon: "🚀",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    title: "Graphic Designer",
    description:
      "Create visual concepts, using computer software, to communicate ideas that inspire and captivate consumers.",
    category: "Design",
    required_skills: ["Design", "Creativity", "Problem solving"],
    salary_range: "$45k - $95k",
    demand: "high",
    icon: "🖌️",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    title: "Digital Marketer",
    description:
      "Promote brands, products, or services using digital channels, including social media, SEO, email, and websites.",
    category: "Business",
    required_skills: ["Writing", "Public speaking", "Analytics", "Creativity"],
    salary_range: "$50k - $120k",
    demand: "high",
    icon: "📈",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    title: "Project Manager",
    description:
      "Plan, execute, and finalize projects according to strict deadlines and budget.",
    category: "Business",
    required_skills: ["Leadership", "Organization", "Communication", "Risk management"],
    salary_range: "$75k - $135k",
    demand: "high",
    icon: "📊",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    title: "Technical Project Manager",
    description:
      "Bridge the gap between technical teams and stakeholders, ensuring projects are delivered on time and within scope.",
    category: "Technology",
    required_skills: ["Leadership", "Technical understanding", "Communication", "Agile methodologies"],
    salary_range: "$85k - $150k",
    demand: "very_high",
    icon: "🔧",
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    title: "Cloud Architect",
    description:
      "Design and manage cloud computing strategies, including cloud adoption, migration, and governance.",
    category: "Technology",
    required_skills: ["AWS/Azure", "Networking", "Security", "Database management"],
    salary_range: "$110k - $180k",
    demand: "very_high",
    icon: "☁️",
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    title: "Product Designer",
    description:
      "Own the end-to-end design process from user research to pixel-perfect interfaces, ensuring products are both usable and beautiful.",
    category: "Design",
    required_skills: ["Design", "User research", "Prototyping", "Design systems"],
    salary_range: "$70k - $130k",
    demand: "high",
    icon: "🎯",
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    title: "Financial Analyst",
    description:
      "Analyze financial data to help businesses make investment decisions and manage risk.",
    category: "Business",
    required_skills: ["Analytical thinking", "Excel/Financial modeling", "Accounting", "Communication"],
    salary_range: "$60k - $120k",
    demand: "medium",
    icon: "💰",
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    title: "Operations Manager",
    description:
      "Oversee daily business operations, improve efficiency, and manage teams to ensure smooth workflows.",
    category: "Business",
    required_skills: ["Leadership", "Organization", "Communication", "Process management"],
    salary_range: "$65k - $130k",
    demand: "high",
    icon: "📋",
  },
  {
    id: "00000000-0000-0000-0000-000000000017",
    title: "Sales Manager",
    description:
      "Lead sales teams, develop strategies, and drive revenue growth for products or services.",
    category: "Business",
    required_skills: ["Leadership", "Public speaking", "Negotiation", "Customer relationship management"],
    salary_range: "$70k - $150k",
    demand: "high",
    icon: "💼",
  },
  {
    id: "00000000-0000-0000-0000-000000000018",
    title: "Technical Writer",
    description:
      "Create clear documentation, tutorials, and content that make tech easy to understand.",
    category: "Communication",
    required_skills: ["Writing", "Research", "Public speaking"],
    salary_range: "$50k - $100k",
    demand: "medium",
    icon: "✍️",
  },
  {
    id: "00000000-0000-0000-0000-000000000019",
    title: "Product Designer",
    description:
      "Own the end-to-end design process from user research to pixel-perfect interfaces, ensuring products are both usable and beautiful.",
    category: "Design",
    required_skills: ["Design", "User research", "Prototyping", "Design systems"],
    salary_range: "$70k - $130k",
    demand: "high",
    icon: "🎨",
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    title: "Data Journalist",
    description:
      "Investigate and story-tell data to find patterns and help organizations make data-driven decisions.",
    category: "Media",
    required_skills: ["Data analysis", "Writing", "Research"],
    salary_range: "$45k - $95k",
    demand: "medium",
    icon: "📰",
  },
{
    id: "00000000-0000-0000-0000-000000000026",
    title: "Data Science Specialist",
    description:
      "Analyze complex data to extract patterns and build predictive models for business decisions.",
    category: "Technology",
    required_skills: ["Python", "R", "SQL", "Statistical Analysis", "Machine Learning"],
    salary_range: "$85k - $160k",
    demand: "very_high",
    icon: "📈",
  },
  {
    id: "00000000-0000-0000-0000-000000000027",
    title: "AI/ML Engineer",
    description:
      "Design and implement machine learning models and AI systems for automated decision-making.",
    category: "Technology",
    required_skills: ["Python", "Machine Learning", "Deep Learning", "Data Engineering", "MLOps"],
    salary_range: "$95k - $180k",
    demand: "very_high",
    icon: "🤖",
  },
  {
    id: "00000000-0000-0000-0000-000000000028",
    title: "Quantitative Analyst",
    description:
      "Apply mathematical and statistical methods to financial and risk analysis problems.",
    category: "Finance",
    required_skills: ["Mathematics", "Statistical Analysis", "Python/R", "Financial Modeling"],
    salary_range: "$100k - $200k",
    demand: "very_high",
    icon: "💹",
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    title: "Registered Nurse",
    description:
      "Provide and coordinate patient care, educate patients and the public about various health conditions, and provide emotional support to patients and their families.",
    category: "Healthcare",
    required_skills: ["Compassion", "Clinical skills", "Attention to detail", "Communication"],
    salary_range: "$60k - $100k",
    demand: "very_high",
    icon: "🏥",
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    title: "Chef",
    description:
      "Plan and direct food preparation and cooking activities of a kitchen, create menus, and supervise staff.",
    category: "Hospitality",
    required_skills: ["Creativity", "Time management", "Food safety knowledge", "Leadership"],
    salary_range: "$45k - $100k",
    demand: "medium",
    icon: "👨‍🍳",
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    title: "Marketing Manager",
    description:
      "Develop strategic marketing campaigns, manage brand presence, and analyze market trends to drive customer acquisition and retention.",
    category: "Business",
    required_skills: ["Strategic thinking", "Analytics", "Creativity", "Leadership", "Communication"],
    salary_range: "$80k - $160k",
    demand: "high",
    icon: "📈",
  },
  {
    id: "00000000-0000-0000-0000-000000000025",
    title: "Social Worker",
    description:
      "Help individuals, families, and groups cope with problems and improve their social functioning.",
    category: "Social Services",
    required_skills: ["Compassion", "Active listening", "Case management", "Crisis intervention"],
    salary_range: "$45k - $75k",
    demand: "high",
    icon: "🤝",
  },
];

export const BADGES: Badge[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    key: "onboarded",
    name: "Welcome Aboard",
    description: "Complete your profile setup",
    icon: "👋",
    xp_required: 10,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    key: "assessment_complete",
    name: "Self-Discoverer",
    description: "Complete the AI career assessment",
    icon: "🧭",
    xp_required: 50,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    key: "career_chosen",
    name: "Direction Set",
    description: "Choose your career path",
    icon: "🎯",
    xp_required: 20,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000104",
    key: "streak_3",
    name: "On Fire",
    description: "Reach a 3-day learning streak",
    icon: "🔥",
    xp_required: null,
    criteria: "streak_days >= 3",
  },
  {
    id: "00000000-0000-0000-0000-000000000105",
    key: "streak_7",
    name: "Week Warrior",
    description: "Reach a 7-day learning streak",
    icon: "⚡",
    xp_required: null,
    criteria: "streak_days >= 7",
  },
  {
    id: "00000000-0000-0000-0000-000000000106",
    key: "milestone_done",
    name: "Milestone Maker",
    description: "Complete your first roadmap milestone",
    icon: "🏁",
    xp_required: 200,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000107",
    key: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "🌟",
    xp_required: 500,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000108",
    key: "roadmap_done",
    name: "Career Graduate",
    description: "Complete your entire roadmap",
    icon: "🎓",
    xp_required: 1000,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000109",
    key: "quiz_champion",
    name: "Quiz Champion",
    description: "Score perfect on all assessment questions",
    icon: "💯",
    xp_required: 40,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000110",
    key: "profile_editor",
    name: "Profile Editor",
    description: "Edit your career profile",
    icon: "✏️",
    xp_required: 50,
    criteria: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000111",
    key: "peer_inspector",
    name: "Peer Inspector",
    description: "View peer comparison stats",
    icon: "👥",
    xp_required: 15,
    criteria: null,
  },
];

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * 250;
}

export function matchCareers(
  responses: { question_id: string; answer: number | string | string[] }[]
): Array<{ career: Career; score: number; match: number; reasons: string[] }> {
  const answer = (id: string) =>
    responses.find((response) => response.question_id === id)?.answer;
  const rating = (id: string) => {
    const value = answer(id);
    return typeof value === "number" ? Math.max(1, Math.min(5, value)) : 3;
  };
  const selectedSkills = Array.isArray(answer("skills_2"))
    ? (answer("skills_2") as string[])
    : [];
  const personality = String(answer("personality_1") ?? "");
  const goal = String(answer("goals_1") ?? "");
  const interests = {
    analytical: rating("interest_1"),
    creative: rating("interest_2"),
    helping: rating("interest_3"),
  };

  const categoryInterests: Record<string, Array<keyof typeof interests>> = {
    Technology: ["analytical", "creative"],
    Finance: ["analytical"],
    Design: ["creative", "helping"],
    Media: ["creative", "helping"],
    Communication: ["creative", "helping"],
    Business: ["analytical", "creative"],
    Healthcare: ["helping", "analytical"],
    Hospitality: ["creative", "helping"],
    "Social Services": ["helping"],
  };
  const personalityCategories: Record<string, string[]> = {
    "Lead and organize": ["Business", "Healthcare", "Hospitality"],
    "Analyze and plan": ["Technology", "Finance", "Business"],
    "Create and brainstorm": ["Design", "Media", "Communication", "Technology"],
    "Support and execute": ["Healthcare", "Social Services", "Hospitality"],
  };

  const seenTitles = new Set<string>();
  return CAREERS.filter((career) => {
    if (seenTitles.has(career.title)) return false;
    seenTitles.add(career.title);
    return true;
  })
    .map((career) => {
      let score = 38;
      const reasons: string[] = [];
      const relevantInterests = categoryInterests[career.category] ?? ["analytical"];
      const interestAverage =
        relevantInterests.reduce((sum, key) => sum + interests[key], 0) /
        relevantInterests.length;
      score += interestAverage * 5;

      const strongestInterest = relevantInterests
        .map((key) => ({ key, value: interests[key] }))
        .sort((a, b) => b.value - a.value)[0];
      if (strongestInterest?.value >= 4) {
        const labels = {
          analytical: "problem solving and analytical work",
          creative: "creating and building things",
          helping: "helping people learn and grow",
        };
        reasons.push(`You showed strong interest in ${labels[strongestInterest.key]}`);
      }

      const matchingSkills = career.required_skills.filter((required) =>
        selectedSkills.some((selected) => skillsAreRelated(selected, required))
      );
      score += Math.min(18, matchingSkills.length * 6);
      if (matchingSkills.length > 0) {
        reasons.push(`Your ${matchingSkills.slice(0, 2).join(" and ")} experience transfers to this role`);
      }

      if ((personalityCategories[personality] ?? []).includes(career.category)) {
        score += 10;
        reasons.push(`${personality.toLowerCase()} matches how this work is often approached`);
      }

      if (goal === "Build my own business" &&
          ["Entrepreneur / Startup Founder", "Product Manager", "Digital Marketer", "Marketing Manager", "Sales Manager"].includes(career.title)) {
        score += 12;
        reasons.push("This path supports your goal of building a business");
      } else if (goal === "Learn a new skill" && ["Technology", "Design", "Media"].includes(career.category)) {
        score += 6;
        reasons.push("This path offers a clear progression of practical skills to learn");
      } else if (goal === "Advance my career" && career.title.includes("Manager")) {
        score += 8;
        reasons.push("The leadership focus aligns with your advancement goal");
      }

      if (reasons.length === 0) {
        reasons.push(`Your overall answers show potential for ${career.category.toLowerCase()} work`);
      }

      return {
        career,
        score,
        match: Math.max(45, Math.min(96, Math.round(score))),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score || a.career.title.localeCompare(b.career.title))
    .slice(0, 4);
}

const SKILL_GROUPS = [
  ["problem solving", "analytical thinking", "strategic thinking", "risk management"],
  ["programming", "python", "python/r", "machine learning", "deep learning", "mlops", "technical understanding"],
  ["data analysis", "analytics", "statistical analysis", "mathematics", "financial modeling", "excel/financial modeling"],
  ["writing", "communication", "active listening", "customer relationship management", "negotiation"],
  ["public speaking", "communication"],
  ["design", "creativity", "user research", "prototyping", "design systems"],
  ["teamwork", "collaboration"],
  ["research", "user research", "strategic thinking"],
];

export function skillsAreRelated(selected: string, required: string): boolean {
  const left = selected.trim().toLowerCase();
  const right = required.trim().toLowerCase();
  if (left === right || left.includes(right) || right.includes(left)) return true;
  return SKILL_GROUPS.some((group) => group.includes(left) && group.includes(right));
}
