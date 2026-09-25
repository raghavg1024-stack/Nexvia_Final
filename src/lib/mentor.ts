"use server";

import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateText, type ModelMessage } from "ai";
import { CAREERS } from "@/lib/data";
import type { Career, MentorMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export interface MentorContext {
  name: string;
  level: number;
  xp: number;
  studyHours: number | null;
  career: { title: string; completed: number; total: number } | null;
}

export interface MentorSendState {
  ok: boolean;
  error?: string;
  responseMode?: "ai" | "guided";
  userMessage?: MentorMessage;
  assistantMessage?: MentorMessage;
}

export interface MentorClearState {
  ok: boolean;
  error?: string;
}

const MAX_MENTOR_MESSAGE_LENGTH = 2_000;

export async function getChat(): Promise<MentorMessage[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("mentor_messages")
      .select("id, user_id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(100);

    return (data ?? []) as MentorMessage[];
  } catch {
    return [];
  }
}

export async function clearChat(
  _prevState: MentorClearState,
  _formData: FormData
): Promise<MentorClearState> {
  void _prevState;
  void _formData;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to clear the chat." };
    }

    await supabase.from("mentor_messages").delete().eq("user_id", user.id);
    revalidatePath("/mentor");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not clear the chat. Please try again." };
  }
}

export async function sendMessage(
  _prevState: MentorSendState,
  formData: FormData
): Promise<MentorSendState> {
  void _prevState;
  const raw = formData.get("content");
  const content = typeof raw === "string" ? raw.trim() : "";
  if (!content) return { ok: false, error: "Please type a message first." };
  if (content.length > MAX_MENTOR_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Please keep your message under ${MAX_MENTOR_MESSAGE_LENGTH.toLocaleString()} characters.`,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You must be signed in to chat with your mentor." };
    }

    const context = await loadContext(user.id);
    const { data: recentRows } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);
    const history = (recentRows ?? [])
      .reverse()
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));
    const reply = await generateAccurateMentorReply(
      content,
      context,
      history
    );

    const { data: userMessage } = await supabase
      .from("mentor_messages")
      .insert({ user_id: user.id, role: "user", content })
      .select("id, user_id, role, content, created_at")
      .single();
    if (!userMessage) {
      return { ok: false, error: "Could not save your message. Please try again." };
    }

    const { data: assistantMessage } = await supabase
      .from("mentor_messages")
      .insert({ user_id: user.id, role: "assistant", content: reply.text })
      .select("id, user_id, role, content, created_at")
      .single();
    if (!assistantMessage) {
      return { ok: true, userMessage: userMessage as MentorMessage };
    }

    revalidatePath("/mentor");
    return {
      ok: true,
      responseMode: reply.mode,
      userMessage: userMessage as MentorMessage,
      assistantMessage: assistantMessage as MentorMessage,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

async function loadContext(userId: string): Promise<MentorContext> {
  const base: MentorContext = {
    name: "there",
    level: 1,
    xp: 0,
    studyHours: null,
    career: null,
  };

  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, xp, level, study_hours_per_week")
      .eq("id", userId)
      .maybeSingle();

    base.name =
      profile?.full_name?.trim().split(/\s+/)[0] ||
      profile?.email?.split("@")[0] ||
      "there";
    base.level = profile?.level ?? 1;
    base.xp = profile?.xp ?? 0;
    base.studyHours = profile?.study_hours_per_week ?? null;

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id, career_title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roadmap) {
      const { data: milestones } = await supabase
        .from("milestones")
        .select("status")
        .eq("roadmap_id", roadmap.id);
      const rows = milestones ?? [];
      base.career = {
        title: roadmap.career_title,
        total: rows.length,
        completed: rows.filter((m) => m.status === "completed").length,
      };
    }
  } catch {}

  return base;
}

const CAREER_KEYWORDS = [
  "what career",
  "which career",
  "career path",
  "career options",
  "career for me",
  "what job",
  "which job",
  "good fit",
  "best fit",
  "career fit",
  "should i become",
  "career should",
  "which field",
  "what field",
  "best career",
  "good career",
  "how do i choose",
  "how to choose a career",
];

const RESUME_KEYWORDS = ["resume", "cv", "cover letter", "curriculum vitae"];

const INTERVIEW_KEYWORDS = ["interview", "hiring process", "screening"];

const STUDY_KEYWORDS = [
  "how to learn",
  "how do i learn",
  "how to study",
  "study plan",
  "learn faster",
  "how to start",
  "where do i start",
  "where to start",
  "get started",
  "starting out",
  "beginner",
  "learning path",
  "learn ",
  "study ",
  "practice",
  "tutorial",
  "course",
  "resource",
  "teach myself",
  "self study",
  "study material",
];

const MOTIVATION_KEYWORDS = [
  "motivat",
  "discourag",
  "give up",
  "burnout",
  "burned out",
  "burn out",
  "tired",
  "stuck",
  "overwhelm",
  "hopeless",
  "frustrat",
  "procrastin",
  "lazy",
  "confiden",
  "feel like i",
  "can't do",
  "cant do",
  "so hard",
  "too hard",
];

const SCHOLARSHIP_KEYWORDS = [
  "scholarship",
  "financial aid",
  "funding",
  "tuition",
  "afford",
  "grant",
  "free course",
  "free resources",
  "cost",
  "fee",
];

const INTERNSHIP_KEYWORDS = ["internship", "intern role", "intern position"];

const PROJECT_KEYWORDS = [
  "project",
  "portfolio",
  "side project",
  "build something",
  "what to build",
  "make something",
  "build an app",
  "sample project",
];

const JOB_SEARCH_KEYWORDS = [
  "job search",
  "find a job",
  "get a job",
  "apply for",
  "job application",
  "linkedin",
  "networking",
  "referral",
  "salary",
  "job offer",
];

const SKILL_KEYWORDS = [
  "skills needed",
  "required skills",
  "skill gap",
  "improve my skills",
  "which skill",
  "what skill",
  "technical skills",
  "soft skills",
];

const TIME_KEYWORDS = [
  "time management",
  "manage my time",
  "daily routine",
  "weekly routine",
  "study schedule",
  "balance college",
  "balance work",
];

const EDUCATION_KEYWORDS = [
  "college",
  "university",
  "degree",
  "certification",
  "higher studies",
  "masters",
  "master's",
  "mba",
];

const NEXT_STEP_KEYWORDS = [
  "what should i do next",
  "what's next",
  "whats next",
  "what is next",
  "next step",
  "after this",
  "what now",
  "what do i do now",
  "where to go from here",
  "what should i focus on",
  "then what",
];

const EXPLAIN_KEYWORDS = [
  "explain",
  "what is",
  "what are",
  "what's a",
  "whats a",
  "how does",
  "how do",
  "define",
  "meaning",
  "tell me about",
  "difference between",
  "introduction to",
  "overview of",
];

const GREETING_WORDS = [
  "hi",
  "hello",
  "hey",
  "yo",
  "good morning",
  "good evening",
  "good afternoon",
];

function hasAny(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k));
}

function hasWord(q: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`).test(q);
}

function joinLines(lines: string[]): string {
  return lines.filter((l) => l.length > 0).join("\n");
}

function matchCareer(q: string): Career | null {
  for (const career of CAREERS) {
    const title = career.title.toLowerCase();
    if (q.includes(title)) return career;
    const tokens = title.split(/[\s/]+/).filter((t) => t.length >= 5);
    if (tokens.some((t) => hasWord(q, t))) return career;
  }
  return null;
}

function greet(context: MentorContext): string {
  return context.name && context.name !== "there" ? context.name : "friend";
}

function progressNote(context: MentorContext): string {
  if (context.career) {
    if (context.career.total === 0) {
      return `You are on the ${context.career.title} track. Take the first step on your roadmap and the rest will follow.`;
    }
    return `Your ${context.career.title} roadmap shows ${context.career.completed} of ${context.career.total} milestones complete — every one moves you forward.`;
  }
  return "Completing the career assessment will unlock a personalized roadmap with milestones built just for you.";
}

function levelNote(context: MentorContext): string {
  if (context.xp > 0) {
    return `At level ${context.level} with ${context.xp} XP, you have already shown real commitment.`;
  }
  return "";
}

function studyHoursNote(context: MentorContext): string {
  if (context.studyHours && context.studyHours > 0) {
    return `With ${context.studyHours} hours a week available, aim for three short, focused sessions rather than one long marathon.`;
  }
  return "";
}

function careerReply(career: Career, q: string, context: MentorContext): string {
  const lines: string[] = [
    `${career.title} is a great path to explore, ${greet(context)}. ${career.description}`,
    "Here is what matters most for this track:",
  ];
  for (const skill of career.required_skills) {
    lines.push(`• Build ${skill.toLowerCase()} skills — they are core to the role.`);
  }
  if (hasAny(q, INTERVIEW_KEYWORDS)) {
    lines.push("• Practice explaining your projects and prepare for role-specific interview questions.");
  }
  if (hasAny(q, RESUME_KEYWORDS)) {
    lines.push(`• Tailor your resume around ${career.title} keywords and your best projects.`);
  }
  if (hasAny(q, PROJECT_KEYWORDS)) {
    lines.push("• Ship a small project that proves you can apply these skills end to end.");
  }
  if (hasAny(q, STUDY_KEYWORDS)) {
    lines.push("• Learn the fundamentals first, then apply each idea in a small exercise or project.");
  }
  lines.push(progressNote(context));
  lines.push("Pick one skill to practice today — small steps compound fast.");
  return joinLines(lines);
}

function careerHelpReply(context: MentorContext): string {
  const lines = [
    `Great, ${greet(context)} — let's find the direction that fits you.`,
    "Your best fit comes from a mix of your interests, skills, and goals.",
    "• Take the career assessment to get personalized matches and reasons.",
    "• Explore the careers that interest you and look at the skills each one needs.",
    "• Try a small project in a field you are curious about before committing.",
    progressNote(context),
    levelNote(context),
    "Start with the assessment — it turns guesswork into a plan.",
  ];
  return joinLines(lines);
}

function resumeReply(context: MentorContext): string {
  const lines = [
    `A resume's job is to earn you an interview, ${greet(context)} — make it easy to scan and tailored to the role.`,
    "• Match keywords from the job description, including skills from your chosen track.",
    "• Use action verbs and measurable results, like \"Built X, which improved Y by Z%\".",
    "• Keep it to one page for entry-level roles and add a Projects section.",
    "• Get one more pair of eyes before you send it.",
    progressNote(context),
    "Polish it once, then start applying — done beats perfect.",
  ];
  return joinLines(lines);
}

function interviewReply(context: MentorContext): string {
  const lines = [
    `Interviews are a skill you can practice, ${greet(context)} — every rep makes you calmer.`,
    "• Research the company and the role before you walk in.",
    "• Use the STAR method (Situation, Task, Action, Result) for behavioral answers.",
    "• Run a mock interview out loud and time your responses.",
    "• Prepare two or three thoughtful questions to ask the interviewer.",
    progressNote(context),
    "Rehearse once today and you will feel the difference on the day.",
  ];
  return joinLines(lines);
}

function studyReply(context: MentorContext): string {
  const lines = [
    `Learning sticks when you practice, not when you re-read, ${greet(context)}.`,
    "• Break big topics into 25-45 minute focused sessions.",
    "• Apply each new idea in a tiny exercise or project the same week.",
    "• Review past notes with spaced repetition instead of cramming.",
    studyHoursNote(context),
    progressNote(context),
    "Start with one topic today — momentum is built in small steps.",
  ];
  return joinLines(lines);
}

function motivationReply(context: MentorContext): string {
  const lines = [
    `Feeling stuck is a normal part of any career journey, ${greet(context)} — it does not mean you are failing.`,
    levelNote(context),
    "• Shrink your next step until it feels easy, like opening the course or writing three lines.",
    "• Track one small win each day to rebuild momentum.",
    "• Revisit why you started and picture where you want to be in six months.",
    progressNote(context),
    "Momentum beats motivation. Do the smallest useful thing today.",
  ];
  return joinLines(lines);
}

function scholarshipReply(context: MentorContext): string {
  const lines = [
    `Good news, ${greet(context)}: there are more funding paths than most people realize.`,
    "• Start with government and university scholarship portals.",
    "• Apply widely and early — many scholarships go unawarded simply for lack of applicants.",
    "• Use free or low-cost resources, open courses, and community programs while you plan.",
    "• Ask a mentor or professor to review your applications before you submit.",
    progressNote(context),
    "Funded or not, keep building skills — that is what opens the real doors.",
  ];
  return joinLines(lines);
}

function internshipReply(context: MentorContext): string {
  const lines = [
    `Internships reward readiness over perfection, ${greet(context)}.`,
    "• Build one solid project you can talk about before applying.",
    "• Tailor your resume to each posting and mention relevant coursework.",
    "• Apply broadly, then follow up politely after about a week.",
    "• Use your career center, LinkedIn, and career fairs to find openings.",
    progressNote(context),
    "Treat every application as practice — each one gets you closer.",
  ];
  return joinLines(lines);
}

function projectReply(context: MentorContext): string {
  const lines = [
    `Projects are the fastest way to prove your skills, ${greet(context)}.`,
    "• Pick something small enough to finish in two to four weeks but big enough to show real ability.",
    "• Choose a problem you actually care about so the work feels motivated.",
    "• Document your process and the decisions you made along the way.",
    "• Share it in your portfolio and on LinkedIn once it is done.",
    progressNote(context),
    "A finished small project beats an unfinished big one. Start today.",
  ];
  return joinLines(lines);
}

function jobSearchReply(q: string, context: MentorContext): string {
  const career = context.career?.title ?? "your target role";
  if (q.includes("salary")) {
    return joinLines([
      `Salary for ${career} depends on location, experience, company, and the exact responsibilities, so I should not invent one number.`,
      "• Compare several current listings for the same role and location.",
      "• Separate base pay from bonuses, benefits, equity, and learning opportunity.",
      "• Use your projects and demonstrated skills to justify the stronger end of a range.",
      "Next step: collect five comparable listings and write down the range they actually show.",
    ]);
  }
  return joinLines([
    `For a ${career} job search, focus on proof of ability and targeted applications rather than sending the same profile everywhere.`,
    "• Pick roles where you match most core requirements, even if you do not match every optional one.",
    "• Tailor your resume headline, skills, and strongest project to each role.",
    "• Ask classmates, alumni, mentors, and relevant communities for specific advice or referrals.",
    "• Track applications, follow-ups, interviews, and what each rejection teaches you.",
    "Next step: choose one suitable opening and tailor your resume for it today.",
  ]);
}

function skillsReply(context: MentorContext): string {
  if (context.career) {
    return joinLines([
      `For your ${context.career.title} path, prioritize one foundational skill, one job-specific skill, and one communication skill at a time.`,
      "• Compare your current abilities with the requirements in several real role descriptions.",
      "• Learn the highest-frequency missing skill, then prove it through a small project.",
      "• Practice explaining what you built, the decisions you made, and the result.",
      progressNote(context),
      "Next step: open three relevant job descriptions and write down the skill that appears most often.",
    ]);
  }
  return joinLines([
    "The right skills depend on the role you want, so choose the direction before collecting random certificates.",
    "• Complete the career assessment and shortlist two roles.",
    "• Compare their common requirements.",
    "• Learn one shared foundational skill and apply it in a small project.",
    "Next step: pick the two careers you are most curious about and compare their required skills.",
  ]);
}

function timeReply(context: MentorContext): string {
  const weekly = context.studyHours && context.studyHours > 0
    ? `You have about ${context.studyHours} study hours each week.`
    : "Start with a schedule you can repeat even during a busy week.";
  return joinLines([
    weekly,
    "• Reserve three to five focused sessions instead of relying on one long session.",
    "• Give each session one visible outcome, such as finishing a lesson or improving one project feature.",
    "• Keep one buffer session for missed work and review progress every weekend.",
    "• Reduce the plan when life gets busy; do not abandon it completely.",
    "Next step: place your next three focused sessions on your calendar now.",
  ]);
}

function educationReply(q: string, context: MentorContext): string {
  const goal = context.career?.title ?? "your target career";
  const asksCertification = q.includes("certification");
  return joinLines([
    `${asksCertification ? "A certification" : "A degree or further study"} is useful for ${goal} when it is required by employers, builds a genuine skill gap, or provides access to projects and networks you cannot get more efficiently elsewhere.`,
    "• Check actual role requirements before paying for a program.",
    "• Compare curriculum, practical work, alumni outcomes, time, and total cost.",
    "• Prefer programs that produce demonstrable work rather than only a credential.",
    "• Avoid enrolling only because you feel uncertain about your next step.",
    "Next step: compare one program with a lower-cost project-based learning route against the same career goal.",
  ]);
}

function nextStepReply(context: MentorContext): string {
  const lines: string[] = [`Let's make your next step concrete, ${greet(context)}.`];
  if (context.career) {
    if (context.career.total > 0) {
      lines.push(
        `You are on the ${context.career.title} track with ${context.career.completed} of ${context.career.total} milestones complete. Finish the current milestone's courses to keep the roadmap moving.`
      );
    } else {
      lines.push(
        `You are on the ${context.career.title} track — your first milestone is waiting to be started.`
      );
    }
    lines.push("• Open your roadmap and pick the single most useful course to start now.");
    lines.push("• Schedule a short daily study slot for it.");
    lines.push("• Complete one lesson today and mark it done.");
  } else {
    lines.push("Your best next step is to complete the career assessment and get a personalized roadmap.");
    lines.push("• Take the assessment to discover your strengths and best-fit careers.");
    lines.push("• Once you have a roadmap, start milestone one with a small daily study slot.");
    lines.push("• Check in daily so your progress and streak keep building.");
  }
  lines.push(levelNote(context));
  lines.push("One clear next step is all you need. What will it be?");
  return joinLines(lines);
}

function extractConcept(q: string): string {
  const patterns: RegExp[] = [
    /explain (.+)/,
    /what is an?\s+(.+)/,
    /what is the?\s+(.+)/,
    /what are (.+)/,
    /how does (.+)/,
    /how do (.+)/,
    /define (.+)/,
    /difference between (.+)/,
    /tell me about (.+)/,
    /overview of (.+)/,
    /introduction to (.+)/,
  ];
  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match && match[1]) {
      const concept = match[1].trim().replace(/[?.,!]+$/, "");
      if (concept.length > 0 && concept.length <= 60) {
        return concept.charAt(0).toUpperCase() + concept.slice(1);
      }
    }
  }
  return "";
}

const CONCEPT_GUIDES: Array<{
  terms: string[];
  definition: string;
  example: string;
  next: string;
}> = [
  {
    terms: ["artificial intelligence", "ai"],
    definition: "Artificial intelligence is the broad field of building computer systems that perform tasks associated with human intelligence, such as understanding language, recognizing patterns, planning, or making predictions.",
    example: "A support tool that classifies a customer's question and suggests a relevant answer is an AI system.",
    next: "Start with Python, basic statistics, and one small classification project.",
  },
  {
    terms: ["machine learning", "ml"],
    definition: "Machine learning is a part of AI where a model learns patterns from examples instead of being given a fixed rule for every case.",
    example: "A spam filter learns from messages labeled spam or not spam, then predicts the label of a new message.",
    next: "Learn training data, features, labels, validation, and overfitting, then build a small classifier.",
  },
  {
    terms: ["data science"],
    definition: "Data science combines statistics, programming, and domain knowledge to answer questions and build predictive or decision-support systems from data.",
    example: "A data scientist might study customer behavior, test which factors predict churn, and validate a model before it is used.",
    next: "Begin with spreadsheets or SQL, descriptive statistics, and a clearly explained analysis project.",
  },
  {
    terms: ["data analysis", "data analytics"],
    definition: "Data analysis is the process of cleaning, exploring, and interpreting data to answer a specific question and support a decision.",
    example: "Comparing monthly sales by product and region to explain why revenue changed is data analysis.",
    next: "Practice with spreadsheets and SQL, then present one finding with a chart and a clear recommendation.",
  },
  {
    terms: ["algorithm"],
    definition: "An algorithm is a finite sequence of steps for solving a problem; a data structure is the way information is organized so those steps can use it efficiently.",
    example: "Binary search is an algorithm, while a sorted array is a data structure it can search efficiently.",
    next: "Implement a search or sorting algorithm and compare its behavior on small and large inputs.",
  },
  {
    terms: ["cloud computing", "cloud"],
    definition: "Cloud computing provides servers, storage, databases, and other computing resources over a network so teams can use and scale them without owning all the hardware.",
    example: "A web app can run on managed cloud servers and store uploads in object storage, increasing capacity as traffic grows.",
    next: "Deploy one small app and learn identity, networking, monitoring, cost, and security basics.",
  },
  {
    terms: ["cybersecurity", "cyber security"],
    definition: "Cybersecurity is the practice of protecting systems, networks, applications, and data from unauthorized access, disruption, or damage.",
    example: "Requiring strong authentication, fixing vulnerable software, monitoring alerts, and testing recovery all reduce security risk.",
    next: "Learn networking, operating-system basics, access control, and defensive labs in a legal practice environment.",
  },
  {
    terms: ["ux", "user experience", "ui design", "user interface"],
    definition: "UX focuses on how well a product solves a user's problem across the whole experience; UI focuses on the visual and interactive interface through which the user completes tasks.",
    example: "Researching why checkout is confusing is UX work; redesigning its layout, controls, and visual states is UI work.",
    next: "Choose one everyday flow, interview a few users, sketch alternatives, and test a simple prototype.",
  },
  {
    terms: ["product management", "product manager"],
    definition: "Product management decides which user and business problems a team should solve, why they matter, and how success will be measured while coordinating delivery with design and engineering.",
    example: "A product manager may validate a customer problem, prioritize a smaller first release, and track whether it improves activation.",
    next: "Write a one-page product brief with the user, problem, evidence, scope, trade-offs, and success metric.",
  },
  {
    terms: ["digital marketing"],
    definition: "Digital marketing uses channels such as search, social media, content, email, and paid advertising to attract, convert, and retain an audience.",
    example: "A marketer can publish a landing page, run a small campaign, and compare conversion rates by message and audience.",
    next: "Pick one audience and goal, create a measurable campaign, then review reach, conversion, cost, and learning.",
  },
];

function conceptGuide(q: string) {
  return CONCEPT_GUIDES.find((guide) =>
    guide.terms.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q))
  );
}

function explainReply(q: string, context: MentorContext): string {
  const concept = extractConcept(q);
  const guide = conceptGuide(q);
  if (guide) {
    return joinLines([
      guide.definition,
      `Example: ${guide.example}`,
      context.career
        ? `For your ${context.career.title} path, focus on where this concept appears in real work rather than memorizing the definition.`
        : "Connect the idea to a small real-world task so you can see how it works.",
      `Next step: ${guide.next}`,
    ]);
  }
  const lines: string[] = [];
  if (concept) {
    lines.push(
      `I want to answer "${concept}" accurately, ${greet(context)}, but I need the field or context you mean because the term can have different meanings.`
    );
  } else {
    lines.push(
      `I want to answer accurately, ${greet(context)}. Tell me the exact concept and the field or course where you saw it.`
    );
  }
  lines.push("Once you give me that context, I can explain it in plain language, show an example, and connect it to your career path.");
  if (context.career && concept) {
    lines.push(`Look for how "${concept}" shows up in the ${context.career.title} track — that connection makes it stick.`);
  }
  lines.push("Work through it step by step, and come back to ask me again if a piece is still fuzzy.");
  return joinLines(lines);
}

function greetingReply(context: MentorContext): string {
  const lines = [
    `Hey ${greet(context)}, welcome to your AI mentor space. I am here to help you grow.`,
    progressNote(context),
    levelNote(context),
    "You can ask me about careers, resumes, interviews, projects, scholarships, or internships.",
    "Or tell me what you are working on and I will help you pick the next step.",
  ];
  return joinLines(lines);
}

function defaultReply(question: string, context: MentorContext): string {
  const topic = question.trim().replace(/\s+/g, " ").replace(/[?!.]+$/, "").slice(0, 120);
  return joinLines([
    `You asked about “${topic}”. I want to respond to that exact situation without guessing missing details.`,
    context.career
      ? `I can connect it to your ${context.career.title} path, but I need to know whether your goal is to learn it, use it in a project, or prepare for a job.`
      : "Tell me whether your goal is to choose a career, learn a skill, build a project, or prepare for a job.",
    "Add the result you want and your current level in one sentence. I will then give you a direct explanation and a concrete next step.",
  ]);
}

function mentorSystemPrompt(context: MentorContext): string {
  const career = context.career
    ? `${context.career.title}; ${context.career.completed} of ${context.career.total} roadmap milestones completed`
    : "not selected yet";
  const weeklyTime = context.studyHours
    ? `${context.studyHours} hours per week`
    : "not provided";

  return `You are Nexvia's practical career mentor for a learner named ${greet(context)}.

Known learner context:
- Career path: ${career}
- Study availability: ${weeklyTime}
- Progress: level ${context.level}, ${context.xp} XP

Answer the learner's actual career or education question directly before giving advice. Be warm, concrete, and concise (normally 100-220 words). Personalize recommendations only from the known context. If key details are missing, state the assumption or ask one focused follow-up question. For unrelated requests, briefly explain that you are a career mentor and redirect toward careers, learning, applications, or interview preparation. Do not invent employers, qualifications, salaries, job openings, statistics, links, or user achievements. Do not claim certainty about career fit; explain trade-offs. Never use gender, caste, disability, family income, college prestige, religion, ethnicity, or other protected traits to judge career suitability. For medical, legal, financial, dangerous, or crisis topics, give only general safety-focused guidance and recommend an appropriate qualified professional or local emergency support when urgent. Use short paragraphs or bullets where useful. End with one realistic next action, not generic motivation.`;
}

async function generateAccurateMentorReply(
  question: string,
  context: MentorContext,
  history: ModelMessage[]
): Promise<{ text: string; mode: "ai" | "guided" }> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: mentorSystemPrompt(context),
      messages: [...history, { role: "user", content: question }],
      maxOutputTokens: 450,
      abortSignal: AbortSignal.timeout(15_000),
    });

    const reply = text.trim();
    if (reply.length >= 20) return { text: reply, mode: "ai" };
  } catch {
    // Keep the mentor useful when the gateway is disabled, rate-limited, or offline.
  }

  return { text: generateMentorReply(question, context), mode: "guided" };
}

function generateMentorReply(question: string, context: MentorContext): string {
  const q = question.toLowerCase();

  const career = matchCareer(q);
  if (career) return careerReply(career, q, context);

  if (hasAny(q, CAREER_KEYWORDS)) return careerHelpReply(context);
  if (hasAny(q, RESUME_KEYWORDS)) return resumeReply(context);
  if (hasAny(q, INTERVIEW_KEYWORDS)) return interviewReply(context);
  if (hasAny(q, SCHOLARSHIP_KEYWORDS)) return scholarshipReply(context);
  if (hasAny(q, INTERNSHIP_KEYWORDS) || hasWord(q, "intern")) {
    return internshipReply(context);
  }
  if (hasAny(q, JOB_SEARCH_KEYWORDS)) return jobSearchReply(q, context);
  if (hasAny(q, SKILL_KEYWORDS)) return skillsReply(context);
  if (hasAny(q, TIME_KEYWORDS)) return timeReply(context);
  if (hasAny(q, EDUCATION_KEYWORDS)) return educationReply(q, context);
  if (hasAny(q, MOTIVATION_KEYWORDS)) return motivationReply(context);
  if (hasAny(q, STUDY_KEYWORDS)) return studyReply(context);
  if (hasAny(q, PROJECT_KEYWORDS)) return projectReply(context);
  if (hasAny(q, NEXT_STEP_KEYWORDS)) return nextStepReply(context);
  if (hasAny(q, EXPLAIN_KEYWORDS)) return explainReply(q, context);
  if (GREETING_WORDS.some((w) => hasWord(q, w))) return greetingReply(context);

  return defaultReply(question, context);
}
