"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CAREERS, XP_RULES } from "@/lib/data";
import { awardCertificate } from "@/lib/certificates";
import { grantReward } from "@/lib/rewards";
import type {
  Course,
  Milestone,
  MilestoneStatus,
  Roadmap,
} from "@/lib/types";

export type ActionState = {
  ok: boolean;
  message?: string;
  updatedCourseId?: string;
  updatedCourseStatus?: Course["status"];
};

export type CareerSwitchState = {
  ok: boolean;
  message?: string;
  careerTitle?: string;
  roadmapId?: string;
};

type Supabase = Awaited<ReturnType<typeof createClient>>;

interface StarterCourse {
  title: string;
  description: string;
  duration_weeks: number;
}

interface StarterMilestone {
  title: string;
  description: string;
  courses: StarterCourse[];
}

type StarterPlan = StarterMilestone[];

function personalizePlan(
  plan: StarterPlan,
  growthOpportunities: string[],
  studyHours: number | null,
  learningStyle: string | null
): StarterPlan {
  const paceFactor = studyHours !== null && studyHours >= 15 ? 0.8 : studyHours !== null && studyHours <= 4 ? 1.5 : 1;
  const styleLabel: Record<string, string> = {
    visual: "Use diagrams, demonstrations, and visual notes.",
    auditory: "Use spoken explanations, discussions, and read-aloud review.",
    reading: "Use structured reading, written notes, and summaries.",
    kinesthetic: "Use hands-on exercises, prototypes, and practical repetition.",
  };
  const personalized = plan.map((milestone) => ({
    ...milestone,
    courses: milestone.courses.map((course) => ({
      ...course,
      duration_weeks: Math.max(1, Math.round(course.duration_weeks * paceFactor)),
      description: `${course.description}${learningStyle && styleLabel[learningStyle] ? ` ${styleLabel[learningStyle]}` : ""}`,
    })),
  }));

  if (growthOpportunities.length > 0 && personalized[1]) {
    personalized[1] = {
      ...personalized[1],
      courses: [
        {
          title: `Priority Skill Sprint: ${growthOpportunities[0]}`,
          description: `Close your highest-priority skill gap in ${growthOpportunities[0]} through focused practice and one piece of evidence for your portfolio.`,
          duration_weeks: Math.max(1, Math.round(2 * paceFactor)),
        },
        ...personalized[1].courses,
      ],
    };
  }

  return personalized;
}

const GENERIC_PLAN: StarterPlan = [
  {
    title: "Foundations",
    description:
      "Build the core knowledge, tools, and habits you need to succeed in this career.",
    courses: [
      {
        title: "Career Fundamentals",
        description:
          "Understand the role, the industry, and what employers expect from entry-level talent.",
        duration_weeks: 2,
      },
      {
        title: "Essential Tools & Workflows",
        description:
          "Get comfortable with the day-to-day tools professionals in this field use.",
        duration_weeks: 2,
      },
      {
        title: "Learning How to Learn",
        description:
          "Set up a study routine and learning resources for fast, focused skill-building.",
        duration_weeks: 1,
      },
    ],
  },
  {
    title: "Core Skills",
    description:
      "Master the key technical and professional skills at the heart of the role.",
    courses: [
      {
        title: "Core Skills I",
        description:
          "Learn the most important day-to-day skills of the career.",
        duration_weeks: 3,
      },
      {
        title: "Core Skills II",
        description:
          "Deepen your expertise with advanced techniques and best practices.",
        duration_weeks: 3,
      },
      {
        title: "Hands-On Practice",
        description:
          "Apply your new skills in guided, real-world practice exercises.",
        duration_weeks: 2,
      },
    ],
  },
  {
    title: "Build a Portfolio",
    description:
      "Create tangible proof of work that shows employers what you can do.",
    courses: [
      {
        title: "Portfolio Project Planning",
        description:
          "Scope a portfolio project and define what a successful outcome looks like.",
        duration_weeks: 1,
      },
      {
        title: "Build Your Signature Project",
        description:
          "Create a project that showcases your skills end to end.",
        duration_weeks: 4,
      },
      {
        title: "Portfolio Polish & Presentation",
        description:
          "Document, refine, and present your work in a professional portfolio.",
        duration_weeks: 1,
      },
    ],
  },
  {
    title: "Get Career Ready",
    description:
      "Turn your skills and portfolio into real job opportunities.",
    courses: [
      {
        title: "Resume & Profile Optimization",
        description:
          "Craft a resume and online profiles that get noticed by recruiters.",
        duration_weeks: 1,
      },
      {
        title: "Interview & Networking Prep",
        description:
          "Practice interviews and build a professional network in your field.",
        duration_weeks: 2,
      },
      {
        title: "Job Search Strategy",
        description:
          "Plan and execute an effective, organized job search.",
        duration_weeks: 2,
      },
    ],
  },
];

function buildTailoredPlan(careerTitle: string): StarterPlan {
  const career = CAREERS.find((item) => item.title === careerTitle);
  if (!career) return GENERIC_PLAN;

  const skills = career.required_skills;
  const skill = (index: number) => skills[index] ?? skills[0] ?? "professional skills";
  return [
    {
      title: `${career.title} Foundations`,
      description: `Understand what ${career.title} professionals do and build the first core skills for the role.`,
      courses: [
        {
          title: `Inside the ${career.title} Role`,
          description: `Learn the responsibilities, common workflows, ethics, and entry-level expectations for ${career.title}.`,
          duration_weeks: 1,
        },
        {
          title: `${skill(0)} Fundamentals`,
          description: `Build a practical foundation in ${skill(0)}, one of the key capabilities for this path.`,
          duration_weeks: 2,
        },
        {
          title: `${skill(1)} Fundamentals`,
          description: `Practice the essential concepts and workflows behind ${skill(1)}.`,
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Role-Specific Skills",
      description: `Develop the capabilities employers and clients expect from a strong ${career.title}.`,
      courses: [
        {
          title: `Applied ${skill(2)}`,
          description: `Use ${skill(2)} in realistic exercises tied to ${career.title} work.`,
          duration_weeks: 3,
        },
        {
          title: `Advanced ${skill(0)}`,
          description: `Move beyond the basics with trade-offs, quality checks, and professional best practices.`,
          duration_weeks: 3,
        },
        {
          title: `${skill(3)} in Practice`,
          description: `Strengthen ${skill(3)} through a guided scenario and reflective review.`,
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Proof of Work",
      description: `Create credible evidence that you can perform ${career.title} work, not just describe it.`,
      courses: [
        {
          title: "Choose a Realistic Brief",
          description: `Define a small project, case study, simulation, or supervised experience relevant to ${career.title}.`,
          duration_weeks: 1,
        },
        {
          title: `${career.title} Capstone`,
          description: `Complete an end-to-end piece of work that demonstrates ${skills.slice(0, 3).join(", ")}.`,
          duration_weeks: 4,
        },
        {
          title: "Document Results and Decisions",
          description: "Explain your process, evidence, outcomes, limitations, and what you would improve next.",
          duration_weeks: 1,
        },
      ],
    },
    {
      title: "Career Launch",
      description: `Turn your new skills and proof of work into credible ${career.title} opportunities.`,
      courses: [
        {
          title: "Role-Focused Resume and Profile",
          description: `Translate your skills and proof of work into clear, truthful achievements tailored to ${career.title} roles.`,
          duration_weeks: 1,
        },
        {
          title: `${career.title} Interview Practice`,
          description: "Practice role-specific, behavioral, and situational answers with concrete evidence.",
          duration_weeks: 2,
        },
        {
          title: "Targeted Opportunity Search",
          description: `Identify suitable entry points, verify requirements, and track focused applications or networking conversations.`,
          duration_weeks: 2,
        },
      ],
    },
  ];
}

const CAREER_PLANS: Record<string, StarterPlan> = {
  "Software Engineer": [
    {
      title: "Foundations",
      description:
        "Build the programming fundamentals and developer toolkit you will use every day.",
      courses: [
        {
          title: "Programming Fundamentals",
          description:
            "Learn core programming concepts: variables, control flow, functions, and data structures.",
          duration_weeks: 4,
        },
        {
          title: "Version Control with Git & GitHub",
          description:
            "Master Git basics, branching, and collaborating on GitHub.",
          duration_weeks: 2,
        },
        {
          title: "Dev Environment Setup",
          description:
            "Set up your editor, terminal, and toolchain like a professional developer.",
          duration_weeks: 1,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the technical skills that define software engineering work.",
      courses: [
        {
          title: "Data Structures & Algorithms",
          description:
            "Build problem-solving skills with arrays, lists, trees, graphs, and algorithms.",
          duration_weeks: 4,
        },
        {
          title: "Object-Oriented Programming",
          description:
            "Learn classes, design patterns, and clean code principles.",
          duration_weeks: 3,
        },
        {
          title: "Databases & SQL",
          description:
            "Design schemas and write queries against relational databases.",
          duration_weeks: 3,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Create projects that prove you can build real software.",
      courses: [
        {
          title: "Build a Web Application",
          description:
            "Plan, build, and ship a full web application with a real user flow.",
          duration_weeks: 5,
        },
        {
          title: "Testing & Code Quality",
          description:
            "Write automated tests and practice code review and refactoring.",
          duration_weeks: 2,
        },
        {
          title: "Deploy & Share Your Project",
          description:
            "Deploy your app, write a great README, and showcase it in your portfolio.",
          duration_weeks: 1,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to land and succeed in your first software engineering role.",
      courses: [
        {
          title: "Resume & GitHub Optimization",
          description:
            "Tune your resume and GitHub profile to highlight your projects.",
          duration_weeks: 1,
        },
        {
          title: "Technical Interview Prep",
          description:
            "Practice coding interviews, system design basics, and problem-solving under pressure.",
          duration_weeks: 3,
        },
        {
          title: "Networking & Job Search",
          description:
            "Connect with engineers, target companies, and run an effective search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Data Scientist": [
    {
      title: "Foundations",
      description:
        "Build the math, programming, and tooling foundations of data science.",
      courses: [
        {
          title: "Python for Data Science",
          description:
            "Learn Python with NumPy and pandas for data manipulation.",
          duration_weeks: 4,
        },
        {
          title: "Statistics & Probability Refresher",
          description:
            "Review the statistical concepts that power data analysis.",
          duration_weeks: 3,
        },
        {
          title: "Notebooks & SQL Basics",
          description:
            "Get productive with Jupyter notebooks and structured query language.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the data science workflow from raw data to insights.",
      courses: [
        {
          title: "Data Wrangling & Cleaning",
          description:
            "Collect, clean, and transform messy datasets into analysis-ready form.",
          duration_weeks: 3,
        },
        {
          title: "Machine Learning Essentials",
          description:
            "Learn supervised and unsupervised learning with scikit-learn.",
          duration_weeks: 4,
        },
        {
          title: "Data Visualization",
          description:
            "Tell clear stories with matplotlib, seaborn, and dashboards.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Showcase real data projects that demonstrate your analytical skills.",
      courses: [
        {
          title: "End-to-End Data Analysis Project",
          description:
            "Run a full analysis on a real dataset from question to insight.",
          duration_weeks: 4,
        },
        {
          title: "Build a Model Pipeline",
          description:
            "Train, evaluate, and document a predictive model for your portfolio.",
          duration_weeks: 3,
        },
        {
          title: "Publish Insights & Dashboards",
          description:
            "Package your findings into a shareable dashboard and write-up.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Turn your skills and portfolio into data science interviews.",
      courses: [
        {
          title: "Resume & GitHub Portfolio Polish",
          description:
            "Present your projects and skills clearly to recruiters.",
          duration_weeks: 1,
        },
        {
          title: "Data Science Interview Prep",
          description:
            "Practice statistical, coding, and case-study interview questions.",
          duration_weeks: 3,
        },
        {
          title: "Networking & Job Search",
          description:
            "Connect with the data community and run an organized job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "UX/UI Designer": [
    {
      title: "Foundations",
      description:
        "Build the design principles, tools, and research basics you need to start.",
      courses: [
        {
          title: "Design Fundamentals & Principles",
          description:
            "Learn typography, color, layout, and visual hierarchy.",
          duration_weeks: 3,
        },
        {
          title: "Figma: Tools & Workflow",
          description:
            "Master Figma for wireframing, design, and handoff.",
          duration_weeks: 2,
        },
        {
          title: "UX Research Basics",
          description:
            "Understand user research methods: interviews, surveys, and personas.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the core design and prototyping skills of the profession.",
      courses: [
        {
          title: "Wireframing & Prototyping",
          description:
            "Turn ideas into low-fidelity wireframes and interactive prototypes.",
          duration_weeks: 3,
        },
        {
          title: "Visual & Interaction Design",
          description:
            "Design polished interfaces with strong interaction and motion design.",
          duration_weeks: 3,
        },
        {
          title: "Usability Testing & Iteration",
          description:
            "Run usability tests and iterate on designs based on feedback.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Create case studies that show how you design and solve problems.",
      courses: [
        {
          title: "Mobile App Case Study",
          description:
            "Design a mobile app end to end and document the process.",
          duration_weeks: 4,
        },
        {
          title: "Web Product Case Study",
          description:
            "Redesign a real product and document your research and decisions.",
          duration_weeks: 3,
        },
        {
          title: "Craft Your Portfolio Site",
          description:
            "Build a portfolio website that showcases your case studies.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to present your work and land a design role.",
      courses: [
        {
          title: "Resume & LinkedIn Optimization",
          description:
            "Position your design experience and skills for recruiters.",
          duration_weeks: 1,
        },
        {
          title: "Portfolio Presentation & Critique",
          description:
            "Practice presenting your work and giving and receiving critique.",
          duration_weeks: 2,
        },
        {
          title: "Networking & Job Search",
          description:
            "Build your design network and plan your job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Product Manager": [
    {
      title: "Foundations",
      description:
        "Learn what product managers do and the core skills they rely on.",
      courses: [
        {
          title: "Product Management Fundamentals",
          description:
            "Understand the product lifecycle and the PM role end to end.",
          duration_weeks: 3,
        },
        {
          title: "Market Research & User Insights",
          description:
            "Research markets, customers, and competitors to inform decisions.",
          duration_weeks: 3,
        },
        {
          title: "Agile & Scrum Basics",
          description:
            "Learn how product teams plan, ship, and iterate with Agile.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the strategic and execution skills of great product managers.",
      courses: [
        {
          title: "Product Strategy & Roadmapping",
          description:
            "Set a product vision, strategy, and a prioritized roadmap.",
          duration_weeks: 3,
        },
        {
          title: "Writing PRDs & Requirements",
          description:
            "Write clear product documents and requirements engineers can build from.",
          duration_weeks: 2,
        },
        {
          title: "Data-Informed Decision Making",
          description:
            "Use metrics, experiments, and analytics to guide product decisions.",
          duration_weeks: 3,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Show employers you can think like a product manager.",
      courses: [
        {
          title: "Product Teardown & Analysis",
          description:
            "Deep-dive an existing product and critique its strategy.",
          duration_weeks: 2,
        },
        {
          title: "Launch a Feature Idea to Ship",
          description:
            "Take a feature concept from idea through discovery to launch plan.",
          duration_weeks: 4,
        },
        {
          title: "Build a Product Portfolio",
          description:
            "Compile your case studies and product thinking into a portfolio.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to interview and land a product manager role.",
      courses: [
        {
          title: "Resume & LinkedIn Optimization",
          description:
            "Present your product experience and impact clearly.",
          duration_weeks: 1,
        },
        {
          title: "Product Manager Interview Prep",
          description:
            "Practice product sense, execution, and behavioral interview questions.",
          duration_weeks: 3,
        },
        {
          title: "Networking & Job Search",
          description:
            "Build your PM network and run an effective job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Data Analyst": [
    {
      title: "Foundations",
      description:
        "Build the spreadsheet, SQL, and tooling skills every analyst needs.",
      courses: [
        {
          title: "Excel & Spreadsheets for Analysts",
          description:
            "Master formulas, pivot tables, and spreadsheet best practices.",
          duration_weeks: 3,
        },
        {
          title: "SQL Fundamentals",
          description:
            "Write queries to extract, filter, and aggregate data from databases.",
          duration_weeks: 3,
        },
        {
          title: "Intro to Analysis Tools",
          description:
            "Get comfortable with BI tools and analytics notebooks.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the analysis workflow from data to decision-ready insights.",
      courses: [
        {
          title: "Data Cleaning & Wrangling",
          description:
            "Transform raw data into accurate, analysis-ready datasets.",
          duration_weeks: 3,
        },
        {
          title: "Statistical Analysis & Hypothesis Testing",
          description:
            "Use statistics to draw trustworthy conclusions from data.",
          duration_weeks: 3,
        },
        {
          title: "Data Visualization & Storytelling",
          description:
            "Build clear charts and reports that drive decisions.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Create analysis projects that demonstrate real business impact.",
      courses: [
        {
          title: "End-to-End Analysis Project",
          description:
            "Answer a business question with a full analysis from data to recommendation.",
          duration_weeks: 4,
        },
        {
          title: "Build Interactive Dashboards",
          description:
            "Design dashboards stakeholders actually use.",
          duration_weeks: 2,
        },
        {
          title: "Document Insights & Recommendations",
          description:
            "Write a clear findings report that spells out next steps.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to interview and land an analyst role.",
      courses: [
        {
          title: "Resume & Portfolio Polish",
          description:
            "Highlight your analysis projects and measurable impact.",
          duration_weeks: 1,
        },
        {
          title: "Analyst Interview & Case Prep",
          description:
            "Practice SQL tests, Excel challenges, and business case interviews.",
          duration_weeks: 3,
        },
        {
          title: "Networking & Job Search",
          description:
            "Connect with analysts and plan your job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Technical Writer": [
    {
      title: "Foundations",
      description:
        "Build the writing craft and tooling foundations of technical communication.",
      courses: [
        {
          title: "Technical Writing Fundamentals",
          description:
            "Learn how to explain complex topics clearly and concisely.",
          duration_weeks: 3,
        },
        {
          title: "Grammar, Style & Editing",
          description:
            "Hone your writing style and editing skills for professional docs.",
          duration_weeks: 2,
        },
        {
          title: "Developer Docs & Tools",
          description:
            "Get comfortable with Markdown, Git, and docs platforms.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the documentation types and workflows of the profession.",
      courses: [
        {
          title: "API Documentation & Markdown",
          description:
            "Write clear reference docs, examples, and guides for developers.",
          duration_weeks: 3,
        },
        {
          title: "User Guides & Tutorials",
          description:
            "Create task-based guides and tutorials readers can follow.",
          duration_weeks: 3,
        },
        {
          title: "Documentation Strategy & Style Guides",
          description:
            "Build documentation plans and consistent style systems.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Create writing samples that prove you can document anything.",
      courses: [
        {
          title: "Write Docs for a Real Project",
          description:
            "Document an open-source project or product and publish your work.",
          duration_weeks: 3,
        },
        {
          title: "Create a Tutorial Series",
          description:
            "Plan and write a multi-part tutorial that teaches a skill.",
          duration_weeks: 3,
        },
        {
          title: "Build a Writing Portfolio Site",
          description:
            "Publish your best samples in a clean, professional portfolio.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Turn your portfolio into a technical writing career.",
      courses: [
        {
          title: "Resume & LinkedIn Optimization",
          description:
            "Position your writing experience and portfolio effectively.",
          duration_weeks: 1,
        },
        {
          title: "Portfolio Review & Interview Prep",
          description:
            "Practice writing tests and interviews for technical roles.",
          duration_weeks: 2,
        },
        {
          title: "Freelance & Job Search Strategy",
          description:
            "Find clients or roles and run a focused job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Cybersecurity Analyst": [
    {
      title: "Foundations",
      description:
        "Build the networking, systems, and security fundamentals you need to start.",
      courses: [
        {
          title: "Cybersecurity Fundamentals",
          description:
            "Learn core security concepts, threat models, and controls.",
          duration_weeks: 3,
        },
        {
          title: "Networking & System Basics",
          description:
            "Understand networks, operating systems, and how attacks move through them.",
          duration_weeks: 3,
        },
        {
          title: "Security Tools & Lab Setup",
          description:
            "Set up a safe home lab and learn essential security tooling.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the hands-on skills of a security operations analyst.",
      courses: [
        {
          title: "Threat Detection & Incident Response",
          description:
            "Detect, triage, and respond to security incidents.",
          duration_weeks: 3,
        },
        {
          title: "Vulnerability Assessment",
          description:
            "Scan, analyze, and report on vulnerabilities in systems and apps.",
          duration_weeks: 3,
        },
        {
          title: "Security Operations & Monitoring",
          description:
            "Learn SIEM workflows, log analysis, and alerting best practices.",
          duration_weeks: 3,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Demonstrate your hands-on security skills with practical projects.",
      courses: [
        {
          title: "Run a Home Security Lab",
          description:
            "Set up VMs, networking, and monitoring in a personal lab environment.",
          duration_weeks: 3,
        },
        {
          title: "Capture-the-Flag & Challenges",
          description:
            "Build and solve hands-on challenges across common attack types.",
          duration_weeks: 3,
        },
        {
          title: "Document Security Case Studies",
          description:
            "Write up incident and vulnerability reports for your portfolio.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to interview and land a security analyst role.",
      courses: [
        {
          title: "Resume & LinkedIn Optimization",
          description:
            "Present your labs, challenges, and security knowledge clearly.",
          duration_weeks: 1,
        },
        {
          title: "Security Interview & Certification Prep",
          description:
            "Practice security interviews and plan foundational certifications.",
          duration_weeks: 3,
        },
        {
          title: "Networking & Job Search",
          description:
            "Connect with the security community and run your job search.",
          duration_weeks: 2,
        },
      ],
    },
  ],
  "Entrepreneur / Startup Founder": [
    {
      title: "Foundations",
      description:
        "Build the mindset and methodology for starting a venture.",
      courses: [
        {
          title: "Entrepreneurship Fundamentals",
          description:
            "Learn what it takes to build a startup and the founder mindset.",
          duration_weeks: 3,
        },
        {
          title: "Idea Validation & Customer Discovery",
          description:
            "Test your idea by talking to real customers early.",
          duration_weeks: 3,
        },
        {
          title: "Lean Startup & MVP Thinking",
          description:
            "Learn how to build quickly, measure, and iterate.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Core Skills",
      description:
        "Master the business, pitching, and growth skills founders need.",
      courses: [
        {
          title: "Building a Business Model",
          description:
            "Design revenue, pricing, and a sustainable business model.",
          duration_weeks: 3,
        },
        {
          title: "Pitching & Storytelling",
          description:
            "Craft a compelling pitch for customers, partners, and investors.",
          duration_weeks: 2,
        },
        {
          title: "Marketing & Growth Basics",
          description:
            "Learn acquisition channels and how to grow your first users.",
          duration_weeks: 3,
        },
      ],
    },
    {
      title: "Build a Portfolio",
      description:
        "Turn your idea into something real you can show the world.",
      courses: [
        {
          title: "Launch a Minimal Viable Product",
          description:
            "Build and launch the smallest version of your product that delivers value.",
          duration_weeks: 4,
        },
        {
          title: "Develop a Go-to-Market Plan",
          description:
            "Define your market, positioning, and launch plan.",
          duration_weeks: 2,
        },
        {
          title: "Build Your Founder Portfolio",
          description:
            "Document your journey, traction, and lessons learned.",
          duration_weeks: 2,
        },
      ],
    },
    {
      title: "Get Career Ready",
      description:
        "Prepare to pitch, fundraise, and grow your venture.",
      courses: [
        {
          title: "Pitch Deck & Investor Readiness",
          description:
            "Build a pitch deck and get ready for investor conversations.",
          duration_weeks: 2,
        },
        {
          title: "Networking & Building a Team",
          description:
            "Build your network, co-founders, and first hires.",
          duration_weeks: 2,
        },
        {
          title: "Fundraising & Launch Strategy",
          description:
            "Plan your funding path and execute a successful launch.",
          duration_weeks: 2,
        },
      ],
    },
  ],
};

const VALID_COURSE_STATUS: readonly Course["status"][] = [
  "pending",
  "in_progress",
  "completed",
];

const VALID_MILESTONE_STATUS: readonly MilestoneStatus[] = [
  "locked",
  "in_progress",
  "completed",
];

async function loadRoadmap(
  supabase: Supabase,
  roadmapId: string
): Promise<Roadmap | null> {
  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .single();

  if (!roadmap) return null;

  const { data: milestoneRows } = await supabase
    .from("milestones")
    .select("*")
    .eq("roadmap_id", roadmapId)
    .order("order_index", { ascending: true });

  const milestoneIds = (milestoneRows ?? []).map((m) => m.id);
  const { data: courseRows } =
    milestoneIds.length > 0
      ? await supabase
          .from("courses")
          .select("*")
          .in("milestone_id", milestoneIds)
          .order("order_index", { ascending: true })
      : { data: [] as Course[] };

  const milestones: Milestone[] = (milestoneRows ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    order_index: m.order_index,
    status: m.status as MilestoneStatus,
    courses: (courseRows ?? []).filter((c) => c.milestone_id === m.id),
  }));

  return {
    id: roadmap.id,
    user_id: roadmap.user_id,
    career_id: roadmap.career_id,
    career_title: roadmap.career_title,
    status: roadmap.status,
    created_at: roadmap.created_at,
    last_activity_at: roadmap.last_activity_at ?? roadmap.created_at,
    milestones,
  };
}

export async function getRoadmap(): Promise<Roadmap | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!roadmap) return null;

  return loadRoadmap(supabase, roadmap.id);
}

export async function createCareerRoadmap(
  careerId: string,
  recommendationId?: string,
): Promise<CareerSwitchState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Please sign in again to change your career." };

  const career = CAREERS.find((item) => item.id === careerId);
  if (!career) return { ok: false, message: "Please choose a valid career." };

  const { data: currentRoadmap, error: currentError } = await supabase
    .from("roadmaps")
    .select("id, career_id, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentError) return { ok: false, message: currentError.message };
  if (currentRoadmap?.career_id === career.id) {
    return {
      ok: true,
      message: `${career.title} is already your active career roadmap.`,
      careerTitle: career.title,
      roadmapId: currentRoadmap.id,
    };
  }

  const now = new Date().toISOString();
  const { data: newRoadmap, error: insertError } = await supabase
    .from("roadmaps")
    .insert({
      user_id: user.id,
      career_id: career.id,
      career_title: career.title,
      status: "draft",
      last_activity_at: now,
    })
    .select("id")
    .single();

  if (insertError || !newRoadmap) {
    return { ok: false, message: insertError?.message ?? "Could not create the new roadmap." };
  }

  const generatedRoadmap = await ensureMilestones(newRoadmap.id);
  if (!generatedRoadmap || generatedRoadmap.milestones.length === 0) {
    await supabase.from("roadmaps").delete().eq("id", newRoadmap.id).eq("user_id", user.id);
    return { ok: false, message: "The new roadmap could not be generated. Your current roadmap was not changed." };
  }

  if (currentRoadmap && currentRoadmap.status !== "completed") {
    const { error: pauseError } = await supabase
      .from("roadmaps")
      .update({ status: "paused", last_activity_at: now })
      .eq("id", currentRoadmap.id)
      .eq("user_id", user.id);

    if (pauseError) {
      await supabase.from("roadmaps").delete().eq("id", newRoadmap.id).eq("user_id", user.id);
      return { ok: false, message: "Your current roadmap could not be saved before switching. Please try again." };
    }
  }

  await supabase
    .from("career_recommendations")
    .update({ is_selected: false })
    .eq("user_id", user.id);

  if (recommendationId) {
    await supabase
      .from("career_recommendations")
      .update({ is_selected: true })
      .eq("id", recommendationId)
      .eq("career_id", career.id)
      .eq("user_id", user.id);
  } else {
    const { data: matchingRecommendation } = await supabase
      .from("career_recommendations")
      .select("id")
      .eq("user_id", user.id)
      .eq("career_id", career.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (matchingRecommendation) {
      await supabase
        .from("career_recommendations")
        .update({ is_selected: true })
        .eq("id", matchingRecommendation.id)
        .eq("user_id", user.id);
    }
  }

  for (const path of [
    "/roadmap",
    "/dashboard",
    "/mentor",
    "/jobs",
    "/readiness",
    "/recommendations",
  ]) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: `Your ${career.title} roadmap is ready.`,
    careerTitle: career.title,
    roadmapId: newRoadmap.id,
  };
}

export async function changeRoadmapCareer(
  _prevState: CareerSwitchState,
  formData: FormData,
): Promise<CareerSwitchState> {
  const rawCareerId = formData.get("careerId");
  const careerId = typeof rawCareerId === "string" ? rawCareerId : "";
  return createCareerRoadmap(careerId);
}

export async function ensureMilestones(
  roadmapId: string
): Promise<Roadmap | null> {
  const supabase = await createClient();

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .single();

  if (!roadmap) return null;

  const { data: existing } = await supabase
    .from("milestones")
    .select("id, order_index")
    .eq("roadmap_id", roadmapId);

  const existingIndexes = new Set(
    (existing ?? []).map((m) => m.order_index as number)
  );

  const careerTitle = roadmap.career_title as string;
  const [{ data: recommendation }, { data: profile }] = await Promise.all([
    supabase
      .from("career_recommendations")
      .select("growth_opportunities")
      .eq("user_id", roadmap.user_id)
      .eq("career_id", roadmap.career_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("study_hours_per_week, learning_style")
      .eq("id", roadmap.user_id)
      .maybeSingle(),
  ]);
  const growthOpportunities = Array.isArray(recommendation?.growth_opportunities)
    ? recommendation.growth_opportunities.filter((value): value is string => typeof value === "string")
    : [];
  const basePlan = CAREER_PLANS[careerTitle] ?? buildTailoredPlan(careerTitle);
  const plan = personalizePlan(
    basePlan,
    growthOpportunities,
    profile?.study_hours_per_week ?? null,
    profile?.learning_style ?? null
  );

  for (let i = 0; i < plan.length; i++) {
    if (existingIndexes.has(i)) continue;

    const starter = plan[i];

    const { data: milestone } = await supabase
      .from("milestones")
      .insert({
        roadmap_id: roadmapId,
        title: starter.title,
        description: starter.description,
        order_index: i,
        status: i === 0 ? "in_progress" : "locked",
      })
      .select("id")
      .single();

    if (!milestone) continue;

    await supabase.from("courses").insert(
      starter.courses.map((course, courseIndex) => ({
        milestone_id: milestone.id,
        title: course.title,
        description: course.description,
        duration_weeks: course.duration_weeks,
        order_index: courseIndex,
        status: "pending",
      }))
    );
  }

  const sequencedRoadmap = await loadRoadmap(supabase, roadmapId);
  if (!sequencedRoadmap) return null;

  const firstIncompleteIndex = sequencedRoadmap.milestones.findIndex(
    (milestone) => milestone.status !== "completed",
  );
  await Promise.all(
    sequencedRoadmap.milestones.map(async (milestone, index) => {
      if (milestone.status === "completed") return;
      const expectedStatus: MilestoneStatus = index === firstIncompleteIndex ? "in_progress" : "locked";
      if (milestone.status === expectedStatus) return;
      await supabase.from("milestones").update({ status: expectedStatus }).eq("id", milestone.id);
    }),
  );

  return loadRoadmap(supabase, roadmapId);
}

async function milestoneOwnedBy(
  supabase: Supabase,
  milestoneId: string,
  userId: string
): Promise<boolean> {
  const { data: milestone } = await supabase
    .from("milestones")
    .select("roadmap_id")
    .eq("id", milestoneId)
    .single();

  if (!milestone) return false;

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("user_id")
    .eq("id", milestone.roadmap_id)
    .single();

  return roadmap?.user_id === userId;
}

async function siblingMilestone(
  supabase: Supabase,
  roadmapId: string,
  orderIndex: number,
  direction: "prev" | "next"
): Promise<{ id: string; status: string } | null> {
  const isPrev = direction === "prev";
  const { data } = await supabase
    .from("milestones")
    .select("id, status")
    .eq("roadmap_id", roadmapId)
    .filter("order_index", isPrev ? "lt" : "gt", orderIndex)
    .order("order_index", { ascending: isPrev ? false : true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

async function touchRoadmap(supabase: Supabase, roadmapId: string) {
  await supabase
    .from("roadmaps")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", roadmapId);
}

async function finishMilestoneAndAdvance(
  supabase: Supabase,
  milestone: { id: string; roadmap_id: string; order_index: number },
): Promise<boolean> {
  const { data: completedMilestone, error } = await supabase
    .from("milestones")
    .update({ status: "completed" })
    .eq("id", milestone.id)
    .eq("status", "in_progress")
    .select("id")
    .maybeSingle();
  if (error || !completedMilestone) return false;

  await touchRoadmap(supabase, milestone.roadmap_id);
  try {
    await grantReward("xp", XP_RULES.milestone_completed, "Milestone completed");
  } catch {}

  const next = await siblingMilestone(
    supabase,
    milestone.roadmap_id,
    milestone.order_index,
    "next",
  );
  if (next && next.status !== "completed") {
    await supabase
      .from("milestones")
      .update({ status: "in_progress" })
      .eq("id", next.id);
  }

  const { data: remaining } = await supabase
    .from("milestones")
    .select("id")
    .eq("roadmap_id", milestone.roadmap_id)
    .neq("status", "completed");

  if (remaining !== null && remaining.length === 0) {
    const roadmapId = milestone.roadmap_id;
    await supabase.from("roadmaps").update({ status: "completed" }).eq("id", roadmapId);
    try {
      await grantReward("xp", XP_RULES.roadmap_completed, "Roadmap completed");
    } catch {}
    try {
      const { data: completedRoadmap } = await supabase
        .from("roadmaps")
        .select("career_title")
        .eq("id", roadmapId)
        .single();
      if (completedRoadmap?.career_title) {
        await awardCertificate(roadmapId, completedRoadmap.career_title);
      }
    } catch {}
  }

  return true;
}

export async function updateMilestoneStatus(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not authenticated" };

  const rawId = formData.get("milestoneId");
  const rawStatus = formData.get("status");
  const milestoneId = typeof rawId === "string" ? rawId : "";
  const target =
    typeof rawStatus === "string" &&
    (VALID_MILESTONE_STATUS as readonly string[]).includes(rawStatus)
      ? (rawStatus as MilestoneStatus)
      : null;

  if (!milestoneId || !target) {
    return { ok: false, message: "Invalid request" };
  }

  const { data: milestone } = await supabase
    .from("milestones")
    .select("id, roadmap_id, order_index, status")
    .eq("id", milestoneId)
    .single();

  if (!milestone) return { ok: false, message: "Milestone not found" };
  if (!(await milestoneOwnedBy(supabase, milestone.id, user.id))) {
    return { ok: false, message: "Not authorized" };
  }

  const current = milestone.status as MilestoneStatus;
  if (current !== "in_progress" || target !== "completed") {
    return {
      ok: false,
      message:
        current === "completed" ? "Completed milestones can't be changed" : "This milestone is still locked",
    };
  }
  const { data: courses } = await supabase
    .from("courses")
    .select("status")
    .eq("milestone_id", milestone.id);
  if (courses?.some((course) => course.status !== "completed")) {
    return { ok: false, message: "Complete all courses first" };
  }
  if (!(await finishMilestoneAndAdvance(supabase, milestone))) {
    return { ok: false, message: "Milestone could not be completed. Refresh and try again." };
  }

  revalidatePath("/roadmap");
  return { ok: true };
}

export async function updateCourseStatus(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not authenticated" };

  const rawId = formData.get("courseId");
  const rawStatus = formData.get("status");
  const courseId = typeof rawId === "string" ? rawId : "";
  const target =
    typeof rawStatus === "string" &&
    (VALID_COURSE_STATUS as readonly string[]).includes(rawStatus)
      ? (rawStatus as Course["status"])
      : null;

  if (!courseId || !target) {
    return { ok: false, message: "Invalid request" };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, milestone_id, order_index, status, duration_weeks")
    .eq("id", courseId)
    .single();

  if (!course) return { ok: false, message: "Course not found" };

  if (!(await milestoneOwnedBy(supabase, course.milestone_id, user.id))) {
    return { ok: false, message: "Not authorized" };
  }

  const current = course.status as Course["status"];
  const validTransition =
    (current === "pending" && target === "in_progress") ||
    (current === "in_progress" && target === "completed");
  if (!validTransition) {
    return {
      ok: false,
      message:
        current === "completed"
          ? "This activity is already completed"
          : "The activity changed on another device. Refresh and try again.",
    };
  }

  const { data: courseMilestone, error: milestoneError } = await supabase
    .from("milestones")
    .select("id, roadmap_id, order_index, status")
    .eq("id", course.milestone_id)
    .maybeSingle();
  if (milestoneError || !courseMilestone) {
    return { ok: false, message: "This roadmap step could not be loaded. Refresh and try again." };
  }
  if (courseMilestone.status === "completed") {
    return { ok: false, message: "This roadmap step is already completed" };
  }
  const { data: parentRoadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .select("status")
    .eq("id", courseMilestone.roadmap_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (roadmapError || !parentRoadmap) {
    return { ok: false, message: "This roadmap could not be loaded. Refresh and try again." };
  }
  if (parentRoadmap.status === "paused" || parentRoadmap.status === "completed") {
    return { ok: false, message: "This is no longer your active roadmap. Refresh to open your current career path." };
  }
  const { data: blockedByEarlierStep, error: sequenceError } = await supabase
    .from("milestones")
    .select("id")
    .eq("roadmap_id", courseMilestone.roadmap_id)
    .lt("order_index", courseMilestone.order_index)
    .neq("status", "completed")
    .limit(1);
  if (sequenceError) {
    return { ok: false, message: "Roadmap order could not be verified. Refresh and try again." };
  }
  if (blockedByEarlierStep?.length) {
    return { ok: false, message: "Complete the previous milestone first" };
  }

  const { data: blockedByEarlierCourse, error: courseSequenceError } = await supabase
    .from("courses")
    .select("id")
    .eq("milestone_id", courseMilestone.id)
    .lt("order_index", course.order_index)
    .neq("status", "completed")
    .limit(1);
  if (courseSequenceError) {
    return { ok: false, message: "Activity order could not be verified. Refresh and try again." };
  }
  if (blockedByEarlierCourse?.length) {
    return { ok: false, message: "Complete the previous activity first" };
  }

  // Repair older roadmaps whose first unfinished milestone was left locked.
  // The ownership and sequence checks above ensure only the correct next step
  // can be activated.
  if (courseMilestone.status !== "in_progress") {
    const { data: activatedMilestone, error: activationError } = await supabase
      .from("milestones")
      .update({ status: "in_progress" })
      .eq("id", courseMilestone.id)
      .neq("status", "completed")
      .select("id")
      .maybeSingle();
    if (activationError || !activatedMilestone) {
      return { ok: false, message: "This roadmap step could not be activated. Refresh and try again." };
    }
  }

  const now = new Date();
  const timestampUpdate = target === "in_progress"
    ? {
        status: target,
        started_at: now.toISOString(),
        due_at: new Date(now.getTime() + Math.max(1, course.duration_weeks || 1) * 7 * 86_400_000).toISOString(),
        completed_at: null,
      }
    : {
        status: target,
        completed_at: now.toISOString(),
      };
  const { data: updatedCourse, error } = await supabase
    .from("courses")
    .update(timestampUpdate)
    .eq("id", course.id)
    .eq("status", current)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!updatedCourse) return { ok: false, message: "This activity was already updated. Refreshing your roadmap." };

  if (target === "in_progress") {
    const { error: startRoadmapError } = await supabase
      .from("roadmaps")
      .update({
        status: "active",
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", courseMilestone.roadmap_id)
      .eq("user_id", user.id)
      .in("status", ["draft", "active"]);
    if (startRoadmapError) {
      return { ok: false, message: "The task started, but the roadmap could not be activated. Refresh and try again." };
    }
  } else {
    await touchRoadmap(supabase, courseMilestone.roadmap_id);
  }

  if (target === "in_progress") {
    try {
      await grantReward("xp", XP_RULES.course_started, "Course started");
    } catch {}
  } else {
    try {
      await grantReward("xp", XP_RULES.course_completed, "Course completed");
    } catch {}
  }

  if (target === "completed") {
    const { data: unfinishedCourses } = await supabase
      .from("courses")
      .select("id")
      .eq("milestone_id", courseMilestone.id)
      .neq("status", "completed")
      .limit(1);
    if (unfinishedCourses !== null && unfinishedCourses.length === 0) {
      await finishMilestoneAndAdvance(supabase, courseMilestone);
    }
  }

  revalidatePath("/roadmap");
  return {
    ok: true,
    updatedCourseId: course.id,
    updatedCourseStatus: target,
  };
}
