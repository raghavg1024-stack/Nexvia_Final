"use server";

import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { CAREERS } from "@/lib/data";
import type { Career } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

/* ── Types ── */

export type InterviewCategory =
  | "behavioral"
  | "technical"
  | "situational"
  | "career_specific";

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  text: string;
  followUp?: string;
  tips: string[];
  scoringCriteria: string[];
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  category: InterviewCategory;
  careerTitle: string | null;
  startedAt: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentIndex: number;
  isComplete: boolean;
  overallScore: number;
  summary: string;
  xpEarned: number;
}

export interface StartState {
  ok: boolean;
  error?: string;
  session?: {
    id: string;
    category: InterviewCategory;
    careerTitle: string | null;
    questionCount: number;
    timePerQuestion: number;
    firstQuestion: InterviewQuestion;
    currentIndex?: number;
  };
}

export interface SubmitAnswerState {
  ok: boolean;
  error?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  isComplete?: boolean;
  overallScore?: number;
  summary?: string;
  xpEarned?: number;
  nextQuestion?: InterviewQuestion;
  nextIndex?: number;
}

const MAX_INTERVIEW_ANSWER_LENGTH = 5_000;

async function enhanceInterviewFeedback(
  answer: string,
  question: InterviewQuestion,
  fallback: string
): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return fallback;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system:
        "You are an interview coach. Give one concise, constructive paragraph. Evaluate only the supplied answer against the supplied criteria. Do not invent facts, change the numeric score, make hiring promises, or use protected personal traits. Mention one specific strength and one specific next improvement.",
      prompt: `Question: ${question.text}\nCriteria: ${question.scoringCriteria.join("; ")}\nCandidate answer: ${answer}\nRule-based baseline: ${fallback}`,
      maxOutputTokens: 180,
      abortSignal: AbortSignal.timeout(12_000),
    });
    const feedback = text.trim();
    return feedback.length >= 20 ? feedback : fallback;
  } catch {
    return fallback;
  }
}

/* ── Question Bank ── */

const BEHAVIORAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: "beh_1",
    category: "behavioral",
    text: "Tell me about a time you had to work with a difficult team member. How did you handle it?",
    followUp: "What would you do differently next time?",
    tips: [
      "Use the STAR method: Situation, Task, Action, Result",
      "Focus on your actions, not the other person's behavior",
      "Show what you learned from the experience",
    ],
    scoringCriteria: [
      "Uses STAR structure",
      "Provides specific situation",
      "Focuses on own actions and growth",
      "Has a clear positive outcome",
    ],
  },
  {
    id: "beh_2",
    category: "behavioral",
    text: "Describe a situation where you had to learn something quickly. How did you approach it?",
    tips: [
      "Mention the specific skill or topic you learned",
      "Describe your learning strategy",
      "Share the result and impact",
    ],
    scoringCriteria: [
      "Shows adaptability",
      "Describes a concrete learning process",
      "Demonstrates measurable outcome",
    ],
  },
  {
    id: "beh_3",
    category: "behavioral",
    text: "Tell me about a project you are most proud of. What made it successful?",
    tips: [
      "Be specific about your role and contributions",
      "Mention the impact or result",
      "Explain what made it meaningful to you",
    ],
    scoringCriteria: [
      "Clear description of the project",
      "Specific personal contribution",
      "Quantifiable or tangible result",
    ],
  },
  {
    id: "beh_4",
    category: "behavioral",
    text: "Give an example of a time you failed. What did you learn from it?",
    tips: [
      "Be honest about the failure",
      "Focus on the lesson learned",
      "Show how you applied the lesson afterward",
    ],
    scoringCriteria: [
      "Honest about the failure",
      "Clear lesson learned",
      "Shows growth or change in approach",
    ],
  },
  {
    id: "beh_5",
    category: "behavioral",
    text: "Describe a time when you had to make a decision without enough information. What did you do?",
    tips: [
      "Explain the context and constraints",
      "Describe how you gathered what you could",
      "Share the outcome and what you would change",
    ],
    scoringCriteria: [
      "Shows decision-making under pressure",
      "Demonstrates resourcefulness",
      "Reflects on the outcome honestly",
    ],
  },
  {
    id: "beh_6",
    category: "behavioral",
    text: "Tell me about a time you went above and beyond what was expected of you.",
    tips: [
      "Describe the context and why you chose to do more",
      "Mention the impact on the team or project",
      "Show that you are proactive",
    ],
    scoringCriteria: [
      "Shows initiative and ownership",
      "Demonstrates positive impact",
      "Reflects genuine motivation",
    ],
  },
  {
    id: "beh_7",
    category: "behavioral",
    text: "How do you handle competing deadlines? Give me a specific example.",
    tips: [
      "Describe your prioritization process",
      "Mention tools or methods you use",
      "Share the outcome of managing multiple priorities",
    ],
    scoringCriteria: [
      "Clear prioritization strategy",
      "Practical tools or methods mentioned",
      "Successful outcome despite pressure",
    ],
  },
  {
    id: "beh_8",
    category: "behavioral",
    text: "Describe a time you received critical feedback. How did you respond?",
    tips: [
      "Show openness to feedback",
      "Describe specific actions you took in response",
      "Mention the improvement that resulted",
    ],
    scoringCriteria: [
      "Shows emotional maturity",
      "Takes action on the feedback",
      "Demonstrates measurable improvement",
    ],
  },
];

const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: "tech_1",
    category: "technical",
    text: "Explain a technical concept you recently learned to someone who has no background in the field.",
    tips: [
      "Avoid jargon — use plain language",
      "Use an analogy or real-world example",
      "Structure your explanation step by step",
    ],
    scoringCriteria: [
      "Uses clear, jargon-free language",
      "Includes a helpful analogy or example",
      "Logical flow in explanation",
    ],
  },
  {
    id: "tech_2",
    category: "technical",
    text: "Walk me through how you would debug a problem you have never seen before.",
    tips: [
      "Describe your systematic approach",
      "Mention tools and resources you would use",
      "Show problem-solving methodology",
    ],
    scoringCriteria: [
      "Systematic debugging approach",
      "Mentions specific tools or resources",
      "Shows methodical problem decomposition",
    ],
  },
  {
    id: "tech_3",
    category: "technical",
    text: "What is the difference between an algorithm and a data structure? Give an example of when you would use each.",
    tips: [
      "Define both clearly with examples",
      "Connect to a real project or scenario",
      "Show understanding of trade-offs",
    ],
    scoringCriteria: [
      "Clear definitions",
      "Practical examples provided",
      "Shows understanding of when to use each",
    ],
  },
  {
    id: "tech_4",
    category: "technical",
    text: "How would you design a system to handle millions of users? What would you consider?",
    tips: [
      "Think about scalability, reliability, and performance",
      "Mention specific technologies or patterns",
      "Consider trade-offs and constraints",
    ],
    scoringCriteria: [
      "Considers scalability and performance",
      "Mentions relevant technologies or patterns",
      "Discusses trade-offs intelligently",
    ],
  },
  {
    id: "tech_5",
    category: "technical",
    text: "Describe a time you had to optimize code or improve performance. What was the approach?",
    tips: [
      "Explain the performance problem",
      "Describe the optimization technique",
      "Share the measurable improvement",
    ],
    scoringCriteria: [
      "Clear problem identification",
      "Specific optimization technique",
      "Measurable result achieved",
    ],
  },
  {
    id: "tech_6",
    category: "technical",
    text: "What testing strategies do you use? Why is testing important?",
    tips: [
      "Mention different types of testing",
      "Explain when to use each type",
      "Give a real example of catching a bug through testing",
    ],
    scoringCriteria: [
      "Knows multiple testing strategies",
      "Explains when to use each",
      "Practical example provided",
    ],
  },
  {
    id: "tech_7",
    category: "technical",
    text: "How do you stay current with new technologies and trends in your field?",
    tips: [
      "Mention specific resources you use",
      "Describe your learning habits",
      "Show how you apply what you learn",
    ],
    scoringCriteria: [
      "Specific resources and habits mentioned",
      "Shows continuous learning mindset",
      "Connects learning to practice",
    ],
  },
];

const SITUATIONAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: "sit_1",
    category: "situational",
    text: "If you were assigned a project with an impossible deadline, how would you handle it?",
    tips: [
      "Show you communicate early about risks",
      "Describe how you would prioritize",
      "Mention setting realistic expectations",
    ],
    scoringCriteria: [
      "Communicates proactively about constraints",
      "Demonstrates smart prioritization",
      "Shows realistic expectation-setting",
    ],
  },
  {
    id: "sit_2",
    category: "situational",
    text: "How would you handle a situation where you disagreed with your manager's technical decision?",
    tips: [
      "Show respect for the chain of command",
      "Describe how you would advocate for your position",
      "Mention being open to the other perspective",
    ],
    scoringCriteria: [
      "Shows professional maturity",
      "Communicates disagreement respectfully",
      "Balances advocacy with adaptability",
    ],
  },
  {
    id: "sit_3",
    category: "situational",
    text: "Your team is adopting a new tool or technology you are unfamiliar with. What is your approach?",
    tips: [
      "Show willingness to learn",
      "Describe a plan for getting up to speed",
      "Mention how you would contribute while learning",
    ],
    scoringCriteria: [
      "Demonstrates learning agility",
      "Has a concrete upskilling plan",
      "Shows team-first mentality",
    ],
  },
  {
    id: "sit_4",
    category: "situational",
    text: "What would you do if you found a critical bug in production on a Friday afternoon?",
    tips: [
      "Assess the severity and impact first",
      "Follow the incident process",
      "Communicate clearly with stakeholders",
    ],
    scoringCriteria: [
      "Prioritizes impact assessment",
      "Follows a clear incident process",
      "Communicates effectively under pressure",
    ],
  },
  {
    id: "sit_5",
    category: "situational",
    text: "How would you onboard yourself into a large, unfamiliar codebase?",
    tips: [
      "Start with documentation and architecture",
      "Run the tests and explore the code",
      "Ask questions and pair with teammates",
    ],
    scoringCriteria: [
      "Structured onboarding approach",
      "Mentions specific exploration steps",
      "Values collaboration and questions",
    ],
  },
];

function getCareerQuestions(career: Career): InterviewQuestion[] {
  return [
    {
      id: `cs_${career.id}_1`,
      category: "career_specific",
      text: `Why are you interested in becoming a ${career.title}? What draws you to this career?`,
      tips: [
        "Connect your interests and skills to the role",
        "Mention specific aspects that excite you",
        "Show you understand what the role involves",
      ],
      scoringCriteria: [
        "Genuine connection to the career",
        "Shows understanding of the role",
        "Personal motivation is clear",
      ],
    },
    {
      id: `cs_${career.id}_2`,
      category: "career_specific",
      text: `What skills do you think are most important for a ${career.title}? How have you developed them?`,
      tips: [
        `Reference the key skills: ${career.required_skills.join(", ")}`,
        "Give specific examples of developing these skills",
        "Be honest about areas you are still growing",
      ],
      scoringCriteria: [
        `References relevant skills: ${career.required_skills.join(", ")}`,
        "Provides concrete skill development examples",
        "Shows self-awareness about growth areas",
      ],
    },
    {
      id: `cs_${career.id}_3`,
      category: "career_specific",
      text: `Describe a project or experience that is relevant to ${career.title}. What did you learn?`,
      tips: [
        "Choose the most relevant experience you have",
        "Explain your specific contributions",
        "Connect the learning to this career path",
      ],
      scoringCriteria: [
        "Relevant project or experience described",
        "Clear personal contribution",
        "Learning connected to the career path",
      ],
    },
  ];
}

/* ── Scoring Engine ── */

const QUESTION_FOCUS: Record<string, string[][]> = {
  beh_1: [["team", "colleague", "member", "conflict"], ["listen", "discuss", "communicat", "resolve"], ["result", "outcome", "learn", "improv"]],
  beh_2: [["learn", "skill", "topic"], ["plan", "practice", "resource", "course"], ["result", "outcome", "deliver", "improv"]],
  beh_3: [["project", "built", "created", "delivered"], ["role", "contribution", "responsib", "implemented"], ["result", "impact", "user", "improv"]],
  beh_4: [["fail", "mistake", "wrong", "missed"], ["learn", "lesson", "feedback"], ["changed", "improv", "applied", "next"]],
  beh_5: [["decision", "uncertain", "information", "constraint"], ["research", "ask", "risk", "option"], ["result", "outcome", "reflect", "change"]],
  beh_6: [["expected", "initiative", "volunteer", "extra"], ["action", "built", "helped", "led"], ["impact", "result", "team", "customer"]],
  beh_7: [["deadline", "priority", "competing", "urgent"], ["plan", "calendar", "list", "communicat"], ["delivered", "result", "completed", "outcome"]],
  beh_8: [["feedback", "criticism", "review"], ["listen", "accept", "action", "changed"], ["improv", "result", "learn"]],
  tech_1: [["example", "analogy", "like"], ["means", "works", "because"], ["step", "first", "then"]],
  tech_2: [["reproduce", "observe", "logs", "error"], ["isolate", "hypothesis", "debug", "test"], ["fix", "verify", "monitor", "regression"]],
  tech_3: [["algorithm"], ["data structure", "array", "list", "tree", "map", "stack"], ["steps", "procedure", "store", "organize"], ["example", "search", "sort"]],
  tech_4: [["scale", "load", "traffic", "million"], ["cache", "database", "queue", "server"], ["reliable", "failure", "monitor", "availability"], ["trade-off", "latency", "cost", "constraint"]],
  tech_5: [["performance", "slow", "bottleneck", "profile"], ["optimiz", "cache", "query", "algorithm"], ["faster", "reduced", "improved", "%", "milliseconds"]],
  tech_6: [["unit", "integration", "end-to-end", "e2e"], ["test", "coverage", "assert"], ["bug", "regression", "quality", "confidence"]],
  tech_7: [["documentation", "newsletter", "course", "community", "conference"], ["practice", "project", "experiment"], ["weekly", "daily", "routine", "habit"]],
  sit_1: [["deadline", "scope", "constraint"], ["priorit", "minimum", "phase"], ["communicat", "stakeholder", "risk"]],
  sit_2: [["manager", "disagree", "decision"], ["evidence", "trade-off", "alternative"], ["respect", "listen", "commit"]],
  sit_3: [["learn", "documentation", "training"], ["practice", "prototype", "course"], ["team", "ask", "pair", "contribute"]],
  sit_4: [["impact", "severity", "customer"], ["incident", "rollback", "mitigate", "fix"], ["communicat", "stakeholder", "monitor", "postmortem"]],
  sit_5: [["documentation", "architecture", "readme"], ["run", "test", "debug", "trace"], ["ask", "pair", "team", "small change"]],
};

function relevanceScore(answer: string, question: InterviewQuestion): number {
  const lower = answer.toLowerCase();
  let groups = QUESTION_FOCUS[question.id];
  if (!groups && question.id.startsWith("cs_")) {
    if (question.id.endsWith("_1")) {
      groups = [["interest", "draw", "motivat", "enjoy"], ["role", "work", "responsib"], ["skill", "experience", "goal"]];
    } else if (question.id.endsWith("_2")) {
      const roleSkills = question.scoringCriteria[0]
        .replace(/^.*?:\s*/, "")
        .split(",")
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean);
      groups = [roleSkills, ["learn", "course", "project", "practice", "experience"], ["improv", "develop", "growing", "next"]];
    } else {
      groups = [["project", "experience", "work"], ["built", "created", "contribution", "responsib"], ["learn", "result", "outcome", "impact"]];
    }
  }
  if (!groups || groups.length === 0) return 60;
  const matched = groups.filter((terms) => terms.some((term) => lower.includes(term))).length;
  return Math.round(25 + (matched / groups.length) * 75);
}

function scoreAnswer(
  answer: string,
  question: InterviewQuestion
): {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
} {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (!trimmed || wordCount < 3) {
    return {
      score: 5,
      feedback: "This response is too short to evaluate fairly.",
      strengths: [],
      improvements: ["Give a direct answer with a specific example, your actions, and the result or reasoning."],
    };
  }

  // Length scoring
  let lengthScore = 0;
  if (wordCount < 20) {
    lengthScore = 20;
    improvements.push("Your answer is quite brief. Aim for 50-150 words with specific examples.");
  } else if (wordCount < 50) {
    lengthScore = 60;
    improvements.push("Consider adding more specific details or a concrete example.");
  } else if (wordCount <= 150) {
    lengthScore = 90;
    strengths.push("Good level of detail — concise yet thorough.");
  } else {
    lengthScore = 80;
    strengths.push("You provided extensive detail.");
    improvements.push("Try to be more concise — interviewers appreciate focused answers.");
  }

  // STAR method detection (for behavioral)
  let structureScore = 70;
  if (question.category === "behavioral") {
    const lower = trimmed.toLowerCase();
    const hasSituation =
      lower.includes("when") ||
      lower.includes("during") ||
      lower.includes("in a project") ||
      lower.includes("at my") ||
      lower.includes("while working");
    const hasAction =
      lower.includes("i decided") ||
      lower.includes("i implemented") ||
      lower.includes("i built") ||
      lower.includes("i created") ||
      lower.includes("i led") ||
      lower.includes("i took") ||
      lower.includes("i set up") ||
      lower.includes("i organized") ||
      lower.includes("my approach") ||
      lower.includes("i chose to") ||
      lower.includes("i reached out");
    const hasResult =
      lower.includes("as a result") ||
      lower.includes("the result") ||
      lower.includes("we achieved") ||
      lower.includes("it improved") ||
      lower.includes("it reduced") ||
      lower.includes("which led to") ||
      lower.includes("this resulted") ||
      lower.includes("we delivered") ||
      lower.includes("the outcome") ||
      lower.includes("we were able");

    if (hasSituation && hasAction && hasResult) {
      structureScore = 100;
      strengths.push("Excellent STAR structure — clear situation, action, and result.");
    } else if (hasSituation && hasAction) {
      structureScore = 75;
      improvements.push("Try to include the outcome or result of your actions.");
    } else if (hasSituation || hasAction) {
      structureScore = 55;
      improvements.push("Use the STAR method: describe the Situation, your Task/Action, and the Result.");
    } else {
      structureScore = 40;
      improvements.push("Structure your answer using the STAR method for clarity.");
    }
  }

  // Specificity scoring
  let specificityScore = 60;
  const hasNumbers = /\d+%|\d+ (users|people|days|weeks|hours|minutes|projects|teams|features)/i.test(trimmed);
  const hasProperNouns = /[A-Z][a-z]+ (was|is|has|had|did|can|will)/.test(trimmed);
  const hasFirstPerson = /\bI\b/.test(trimmed);

  if (hasNumbers) {
    specificityScore += 20;
    strengths.push("Great use of specific metrics and numbers.");
  }
  if (hasProperNouns) {
    specificityScore += 10;
  }
  if (hasFirstPerson) {
    specificityScore += 10;
    strengths.push("Good personal ownership — you spoke in the first person.");
  } else {
    improvements.push("Speak in the first person — interviewers want to know what YOU did.");
  }
  specificityScore = Math.min(100, specificityScore);

  // Clarity and professionalism
  let professionalismScore = 80;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("um ") ||
    lower.includes("like ") ||
    lower.includes("you know") ||
    lower.includes("basically")
  ) {
    professionalismScore -= 15;
    improvements.push("Reduce filler words like 'um', 'like', and 'basically'.");
  }
  if (lower.includes("i don't know") || lower.includes("i have no idea")) {
    professionalismScore -= 20;
    improvements.push("Instead of saying you don't know, explain how you would find the answer.");
  }

  const relevance = relevanceScore(trimmed, question);
  if (relevance >= 80) {
    strengths.push("Your response addresses the main points in the question.");
  } else if (relevance < 55) {
    improvements.push(`Address the question more directly: ${question.scoringCriteria[0]}.`);
  } else {
    improvements.push(`Strengthen this criterion: ${question.scoringCriteria.find((criterion) => !trimmed.toLowerCase().includes(criterion.split(" ")[0].toLowerCase())) ?? question.scoringCriteria[0]}.`);
  }

  // Overall score
  const weights = {
    length: 0.15,
    structure: 0.2,
    specificity: 0.2,
    professionalism: 0.15,
    relevance: 0.3,
  };

  const rawScore =
    lengthScore * weights.length +
    structureScore * weights.structure +
    specificityScore * weights.specificity +
    professionalismScore * weights.professionalism +
    relevance * weights.relevance;

  const shortAnswerCap = wordCount < 10 ? 35 : wordCount < 20 ? 55 : 100;
  const score = Math.round(Math.max(10, Math.min(shortAnswerCap, rawScore)));

  // Generate feedback
  let feedback = "";
  if (score >= 85) {
    feedback = "Excellent answer! You demonstrated strong communication skills and provided a well-structured, specific response.";
  } else if (score >= 70) {
    feedback = "Good answer with solid content. A few improvements could make it even stronger.";
  } else if (score >= 50) {
    feedback = "Decent answer, but there is room for improvement in structure and specificity.";
  } else {
    feedback = "This answer needs more work. Focus on structure, specific examples, and clear outcomes.";
  }

  if (strengths.length === 0) {
    strengths.push("You answered the question directly.");
  }
  if (improvements.length === 0) {
    improvements.push("Keep practicing to maintain this level of quality.");
  }

  return { score, feedback, strengths, improvements };
}

/* ── Session Management ── */

function pickQuestions(
  category: InterviewCategory,
  career: Career | null,
  count: number
): InterviewQuestion[] {
  let pool: InterviewQuestion[] = [];

  switch (category) {
    case "behavioral":
      pool = [...BEHAVIORAL_QUESTIONS];
      break;
    case "technical":
      pool = [...TECHNICAL_QUESTIONS];
      break;
    case "situational":
      pool = [...SITUATIONAL_QUESTIONS];
      break;
    case "career_specific":
      pool = career ? getCareerQuestions(career) : [...BEHAVIORAL_QUESTIONS];
      break;
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

function generateSummary(
  answers: InterviewAnswer[],
  category: InterviewCategory,
  careerTitle: string | null
): string {
  if (answers.length === 0) return "No answers were provided.";

  const avgScore = Math.round(
    answers.reduce((sum, a) => sum + a.score, 0) / answers.length
  );

  const allStrengths = answers.flatMap((a) => a.strengths);
  const allImprovements = answers.flatMap((a) => a.improvements);

  const topStrength = allStrengths[0] || "Direct communication";
  const topImprovement = allImprovements[0] || "Continue practicing";

  const label = careerTitle || category.replace(/_/g, " ");

  if (avgScore >= 85) {
    return `Outstanding performance on your ${label} interview! You scored ${avgScore}/100 on average. Your strongest area was: ${topStrength}. Keep honing your skills — you are interview-ready.`;
  }
  if (avgScore >= 70) {
    return `Solid performance on your ${label} interview with an average score of ${avgScore}/100. Strength: ${topStrength}. Focus area: ${topImprovement}. A few more practice rounds will get you to the top tier.`;
  }
  if (avgScore >= 50) {
    return `Good effort on your ${label} interview — you scored ${avgScore}/100 on average. Your main strength: ${topStrength}. Priority improvement: ${topImprovement}. Practice more mock interviews to build confidence.`;
  }
  return `You scored ${avgScore}/100 on your ${label} interview. This is a starting point — everyone improves with practice. Focus on: ${topImprovement}. Try the behavioral or situational categories next to build your range.`;
}

/* ── Server Actions ── */

export async function startInterview(
  _prevState: StartState,
  formData: FormData
): Promise<StartState> {
  void _prevState;

  const rawCategory = formData.get("category");
  const category = typeof rawCategory === "string" ? rawCategory : "";
  const validCategories: InterviewCategory[] = [
    "behavioral",
    "technical",
    "situational",
    "career_specific",
  ];
  if (!validCategories.includes(category as InterviewCategory)) {
    return { ok: false, error: "Please select an interview category." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to start an interview." };
    }

    // Load career context
    let career: Career | null = null;
    let careerTitle: string | null = null;
    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("career_id, career_title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roadmap) {
      careerTitle = roadmap.career_title;
      career = CAREERS.find((c) => c.id === roadmap.career_id) ?? null;
    }

    const questionCount = 5;
    const questions = pickQuestions(
      category as InterviewCategory,
      career,
      questionCount
    );

    // Store session in Supabase
    const { data: session, error } = await supabase
      .from("mock_interviews")
      .insert({
        user_id: user.id,
        category: category,
        career_title: careerTitle,
        questions: questions as unknown as Record<string, unknown>[],
        answers: [],
        current_index: 0,
        is_complete: false,
        overall_score: 0,
        summary: "",
        xp_earned: 0,
      })
      .select("id")
      .single();

    if (error || !session) {
      return { ok: false, error: "Could not start the interview. Please try again." };
    }

    revalidatePath("/mock-interview");
    return {
      ok: true,
      session: {
        id: session.id,
        category: category as InterviewCategory,
        careerTitle,
        questionCount: questions.length,
        timePerQuestion: 120,
        firstQuestion: questions[0],
      },
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitAnswer(
  _prevState: SubmitAnswerState,
  formData: FormData
): Promise<SubmitAnswerState> {
  void _prevState;

  const rawSessionId = formData.get("sessionId");
  const rawAnswer = formData.get("answer");
  const rawIndex = formData.get("currentIndex");
  const rawQuestionId = formData.get("questionId");

  const sessionId = typeof rawSessionId === "string" ? rawSessionId : "";
  const answer = typeof rawAnswer === "string" ? rawAnswer.trim() : "";
  const currentIndex = typeof rawIndex === "string" ? parseInt(rawIndex, 10) : 0;
  const questionId = typeof rawQuestionId === "string" ? rawQuestionId : "";

  if (!sessionId) return { ok: false, error: "No interview session found." };
  if (!answer) return { ok: false, error: "Please provide an answer before submitting." };
  if (answer.length > MAX_INTERVIEW_ANSWER_LENGTH) {
    return { ok: false, error: "Please keep your answer under 5,000 characters." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You must be signed in." };
    }

    const { data: session } = await supabase
      .from("mock_interviews")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return { ok: false, error: "Interview session not found." };
    }
    if (session.is_complete) {
      return { ok: false, error: "This interview has already been completed." };
    }
    if (currentIndex !== session.current_index) {
      return { ok: false, error: "This answer is out of sequence. Refresh and continue from your saved question." };
    }

    const questions = session.questions as unknown as InterviewQuestion[];
    const existingAnswers = (session.answers ?? []) as unknown as InterviewAnswer[];

    const question = questions.find((q) => q.id === questionId) ?? questions[currentIndex];
    if (!question) {
      return { ok: false, error: "Question not found." };
    }

    // Score the answer
    const result = scoreAnswer(answer, question);
    const feedback = await enhanceInterviewFeedback(answer, question, result.feedback);

    const newAnswer: InterviewAnswer = {
      questionId: question.id,
      answer,
      score: result.score,
      feedback,
      strengths: result.strengths,
      improvements: result.improvements,
    };

    const allAnswers = [...existingAnswers, newAnswer];
    const nextIndex = currentIndex + 1;
    const isComplete = nextIndex >= questions.length;

    let overallScore = 0;
    let summary = "";
    let xpEarned = 0;

    if (isComplete) {
      overallScore = Math.round(
        allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length
      );
      summary = generateSummary(
        allAnswers,
        session.category as InterviewCategory,
        session.career_title
      );
      xpEarned = Math.round(20 + overallScore * 0.8); // 20-100 XP based on score

      // Grant XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const newXp = profile.xp + xpEarned;
        const newLevel = Math.floor(newXp / 250) + 1;
        await supabase
          .from("profiles")
          .update({ xp: newXp, level: newLevel })
          .eq("id", user.id);

        await supabase.from("xp_transactions").insert({
          user_id: user.id,
          amount: xpEarned,
          reason: `Mock interview completed (${session.category.replace(/_/g, " ")})`,
        });
      }
    }

    // Update session
    await supabase
      .from("mock_interviews")
      .update({
        answers: allAnswers as unknown as Record<string, unknown>[],
        current_index: nextIndex,
        is_complete: isComplete,
        overall_score: overallScore,
        summary,
        xp_earned: xpEarned,
      })
      .eq("id", sessionId);

    const nextQuestion = isComplete ? undefined : questions[nextIndex];

    revalidatePath("/mock-interview");
    revalidatePath("/dashboard");
    revalidatePath("/rewards");

    return {
      ok: true,
      score: result.score,
      feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      isComplete,
      overallScore: isComplete ? overallScore : undefined,
      summary: isComplete ? summary : undefined,
      xpEarned: isComplete ? xpEarned : undefined,
      nextQuestion,
      nextIndex: isComplete ? undefined : nextIndex,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function getSession(
  sessionId: string
): Promise<InterviewSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("mock_interviews")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      category: data.category as InterviewCategory,
      careerTitle: data.career_title,
      startedAt: data.created_at,
      questions: (data.questions ?? []) as unknown as InterviewQuestion[],
      answers: (data.answers ?? []) as unknown as InterviewAnswer[],
      currentIndex: data.current_index,
      isComplete: data.is_complete,
      overallScore: data.overall_score,
      summary: data.summary,
      xpEarned: data.xp_earned,
    };
  } catch {
    return null;
  }
}

export async function getActiveInterview(): Promise<StartState["session"] | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("mock_interviews")
      .select("id, category, career_title, questions, current_index")
      .eq("user_id", user.id)
      .eq("is_complete", false)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;

    const questions = (data.questions ?? []) as unknown as InterviewQuestion[];
    const currentIndex = Math.max(0, Math.min(data.current_index ?? 0, questions.length - 1));
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    return {
      id: data.id,
      category: data.category as InterviewCategory,
      careerTitle: data.career_title,
      questionCount: questions.length,
      timePerQuestion: 120,
      firstQuestion: currentQuestion,
      currentIndex,
    };
  } catch {
    return null;
  }
}
