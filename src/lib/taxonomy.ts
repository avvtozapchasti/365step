/**
 * The shared vocabulary of 365step.
 *
 * Onboarding renders from these lists, the opportunity matcher scores against
 * them, and the roadmap generator branches on the goal slug. Keeping them in
 * one file is what makes "your answers actually change the product" true rather
 * than aspirational — add a goal here and it flows through all three.
 */

import type { Role } from "./types";

export interface RoleOption {
  value: Role;
  label: string;
  blurb: string;
  gradeLabel: string;
  grades: { value: string; label: string }[];
}

export const ROLES: RoleOption[] = [
  {
    value: "school",
    label: "School student",
    blurb: "Admissions, exams, olympiads, first research and portfolio.",
    gradeLabel: "What grade are you in?",
    grades: [
      { value: "8", label: "Grade 8" },
      { value: "9", label: "Grade 9" },
      { value: "10", label: "Grade 10" },
      { value: "11", label: "Grade 11" },
      { value: "12", label: "Grade 12" },
    ],
  },
  {
    value: "university",
    label: "University student",
    blurb: "Internships, research positions, exchange and career skills.",
    gradeLabel: "Which year are you in?",
    grades: [
      { value: "year-1", label: "Year 1" },
      { value: "year-2", label: "Year 2" },
      { value: "year-3", label: "Year 3" },
      { value: "year-4", label: "Year 4+" },
      { value: "masters", label: "Master's" },
    ],
  },
  {
    value: "graduate",
    label: "Graduate / young professional",
    blurb: "Entry-level roles, fellowships, certifications and portfolio.",
    gradeLabel: "Where are you right now?",
    grades: [
      { value: "final-year", label: "Final year" },
      { value: "just-graduated", label: "Just graduated" },
      { value: "1-2-years", label: "1–2 years experience" },
      { value: "switching", label: "Switching fields" },
    ],
  },
];

export interface GoalOption {
  slug: string;
  title: string;
  /** The short version the dashboard headline uses. */
  headline: string;
  category: "admissions" | "exam" | "research" | "portfolio" | "career" | "competition";
  blurb: string;
  roles: Role[];
  icon: string;
}

export const GOALS: GoalOption[] = [
  {
    slug: "get-into-university",
    title: "Get into a top university",
    headline: "Get into a top university",
    category: "admissions",
    blurb: "Target list, tests, portfolio and applications — in the right order.",
    roles: ["school"],
    icon: "graduation-cap",
  },
  {
    slug: "improve-sat",
    title: "Raise my SAT score",
    headline: "Raise my SAT score",
    category: "exam",
    blurb: "Short daily Reading, Writing and Math work with instant feedback.",
    roles: ["school"],
    icon: "calculator",
  },
  {
    slug: "improve-ielts",
    title: "Improve my IELTS band",
    headline: "Improve my IELTS band",
    category: "exam",
    blurb: "All four skills, ten minutes at a time.",
    roles: ["school", "university", "graduate"],
    icon: "languages",
  },
  {
    slug: "start-research",
    title: "Start doing research",
    headline: "Start doing research",
    category: "research",
    blurb: "From no experience to a real research question and a mentor.",
    roles: ["school", "university"],
    icon: "microscope",
  },
  {
    slug: "build-portfolio",
    title: "Build a strong portfolio",
    headline: "Build a portfolio that stands out",
    category: "portfolio",
    blurb: "Ship small projects and document them properly.",
    roles: ["school", "university", "graduate"],
    icon: "layers",
  },
  {
    slug: "find-internship",
    title: "Find an internship",
    headline: "Land my first internship",
    category: "career",
    blurb: "CV, portfolio, applications and interview practice.",
    roles: ["university", "graduate"],
    icon: "briefcase",
  },
  {
    slug: "win-competitions",
    title: "Win olympiads and competitions",
    headline: "Win olympiads and competitions",
    category: "competition",
    blurb: "Problem-solving practice plus a calendar of real contests.",
    roles: ["school", "university"],
    icon: "trophy",
  },
  {
    slug: "career-skills",
    title: "Develop career skills",
    headline: "Develop career skills",
    category: "career",
    blurb: "The practical skills employers actually screen for.",
    roles: ["university", "graduate"],
    icon: "trending-up",
  },
];

export function goalBySlug(slug: string): GoalOption | undefined {
  return GOALS.find((g) => g.slug === slug);
}

export function goalsForRole(role: Role): GoalOption[] {
  return GOALS.filter((g) => g.roles.includes(role));
}

export interface SubjectOption {
  slug: string;
  label: string;
  emoji: string;
}

export const SUBJECTS: SubjectOption[] = [
  { slug: "engineering", label: "Engineering", emoji: "⚙️" },
  { slug: "physics", label: "Physics", emoji: "🔭" },
  { slug: "math", label: "Mathematics", emoji: "📐" },
  { slug: "cs", label: "Computer science", emoji: "💻" },
  { slug: "biology", label: "Biology", emoji: "🧬" },
  { slug: "chemistry", label: "Chemistry", emoji: "⚗️" },
  { slug: "medicine", label: "Medicine & health", emoji: "🩺" },
  { slug: "economics", label: "Economics", emoji: "📈" },
  { slug: "business", label: "Business", emoji: "💼" },
  { slug: "data-science", label: "Data science & AI", emoji: "🤖" },
  { slug: "environment", label: "Environment & climate", emoji: "🌍" },
  { slug: "social-sciences", label: "Social sciences", emoji: "🏛️" },
  { slug: "humanities", label: "Humanities", emoji: "📚" },
  { slug: "arts", label: "Arts & design", emoji: "🎨" },
];

export function subjectLabel(slug: string): string {
  return SUBJECTS.find((s) => s.slug === slug)?.label ?? slug;
}

export const DAILY_MINUTES = [
  { value: 10, label: "10 min", blurb: "One small step a day" },
  { value: 20, label: "20 min", blurb: "The sweet spot" },
  { value: 30, label: "30 min", blurb: "Serious pace" },
  { value: 45, label: "45+ min", blurb: "All in" },
];

export const SKILL_LEVELS: { value: "beginner" | "intermediate" | "advanced"; label: string; blurb: string }[] = [
  { value: "beginner", label: "Just starting", blurb: "New to this — show me the basics." },
  { value: "intermediate", label: "Some experience", blurb: "I know the fundamentals." },
  { value: "advanced", label: "Confident", blurb: "I want the harder material." },
];

/** Extra goals a user can stack on top of the primary one. */
export const SECONDARY_GOALS = [
  { slug: "english", label: "Improve my English" },
  { slug: "research", label: "Do research" },
  { slug: "portfolio", label: "Build a portfolio" },
  { slug: "olympiad", label: "Compete in olympiads" },
  { slug: "scholarship", label: "Win a scholarship" },
  { slug: "internship", label: "Get work experience" },
  { slug: "network", label: "Meet people in my field" },
  { slug: "public-speaking", label: "Get better at presenting" },
];

export const OPPORTUNITY_TYPES: { value: string; label: string }[] = [
  { value: "olympiad", label: "Olympiads" },
  { value: "research", label: "Research" },
  { value: "summer_program", label: "Summer programs" },
  { value: "scholarship", label: "Scholarships" },
  { value: "competition", label: "Competitions" },
  { value: "internship", label: "Internships" },
  { value: "fellowship", label: "Fellowships" },
  { value: "exchange", label: "Exchange" },
  { value: "certification", label: "Certifications" },
  { value: "conference", label: "Conferences" },
  { value: "volunteer", label: "Volunteering" },
];

export function opportunityTypeLabel(type: string): string {
  return OPPORTUNITY_TYPES.find((t) => t.value === type)?.label.replace(/s$/, "") ?? type;
}

export const PROJECT_CATEGORIES = [
  "engineering",
  "software",
  "research",
  "science",
  "social impact",
  "business",
  "design",
  "writing",
  "other",
];
