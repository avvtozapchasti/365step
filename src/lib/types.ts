export type Role = "school" | "university" | "graduate";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type StepKind = "learn" | "practice" | "build" | "opportunity" | "reflect";
export type StepStatus = "todo" | "done" | "skipped";
export type ProjectStatus = "idea" | "in_progress" | "shipped" | "paused";
export type MilestoneStatus = "done" | "current" | "upcoming";
export type TaskStatus = "done" | "todo" | "locked";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  role: Role;
  grade: string | null;
  country: string | null;
  dailyMinutes: number;
  skillLevel: SkillLevel;
  interests: string[];
  secondary: string[];
  onboardedAt: string | null;
  timezone: string;
}

export interface Goal {
  id: string;
  userId: string;
  slug: string;
  title: string;
  category: string;
  startDate: string;
  targetDate: string | null;
  status: "active" | "achieved" | "paused" | "archived";
  isPrimary: boolean;
}

export interface Course {
  id: string;
  slug: string;
  track: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: SkillLevel;
  subjects: string[];
  audiences: Role[];
  goalSlugs: string[];
  accent: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  objective: string;
  estMinutes: number;
  xp: number;
  theory: string;
  example: string | null;
  takeaway: string | null;
  orderIndex: number;
}

export interface Question {
  id: string;
  lessonId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  orderIndex: number;
}

export interface Resource {
  id: string;
  title: string;
  source: string;
  url: string;
  durationMin: number | null;
  topic: string | null;
  difficulty: string;
}

export interface LessonProgress {
  lessonId: string;
  status: "in_progress" | "completed";
  correct: number;
  total: number;
  minutes: number;
  attempts: number;
  completedAt: string | null;
}

export interface DailyStep {
  id: string;
  dayIndex: number;
  stepDate: string;
  kind: StepKind;
  title: string;
  context: string;
  detail: string;
  estMinutes: number;
  xp: number;
  refType: string | null;
  refSlug: string | null;
  status: StepStatus;
  completedAt: string | null;
  orderIndex: number;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization: string;
  type: OpportunityType;
  summary: string;
  description: string;
  audiences: Role[];
  subjects: string[];
  goalSlugs: string[];
  tags: string[];
  eligibility: string[];
  country: string;
  location: string;
  format: string;
  deadline: string | null;
  cost: string;
  minGrade: number | null;
  maxGrade: number | null;
  officialUrl: string;
  isDemo: boolean;
  sourceNote: string | null;
  prestige: number;
}

export type OpportunityType =
  | "olympiad"
  | "research"
  | "scholarship"
  | "summer_program"
  | "internship"
  | "competition"
  | "fellowship"
  | "certification"
  | "conference"
  | "volunteer"
  | "exchange";

/** An opportunity plus why it surfaced for this particular user. */
export interface MatchedOpportunity extends Opportunity {
  score: number;
  reasons: string[];
  matchLabel: string;
  saved: boolean;
  daysLeft: number | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  status: ProjectStatus;
  link: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  startedOn: string | null;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  metric: string;
  threshold: number;
  earnedAt: string | null;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastActiveDate: string | null;
}

export interface Milestone {
  id: string;
  monthIndex: number;
  title: string;
  focus: string;
  status: MilestoneStatus;
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  kind: "learn" | "practice" | "build" | "apply" | "action";
  refType: string | null;
  refSlug: string | null;
  status: TaskStatus;
}

export interface UserDeadline {
  id: string;
  title: string;
  dueDate: string;
  kind: string;
  done: boolean;
  opportunityId: string | null;
  opportunitySlug: string | null;
  daysLeft: number;
}

// -------------------------------------------------------------- competitive --
// Shared by the daily SAT challenge and friend battles: both are "answer N
// questions, submit once" flows built on the same quiz shape.

/**
 * A question as shown before it has been answered — no correct index, no
 * explanation. Withheld until submission so a competitive quiz cannot be
 * solved by reading the page source or the network payload.
 */
export interface PublicQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
}

/** Per-question grading, returned only in the response to the submission that earned it. */
export interface QuizBreakdownItem {
  questionId: string;
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

/** Everything the dashboard, progress page and AI layer read from. */
export interface GrowthSnapshot {
  totalXp: number;
  level: number;
  levelTitle: string;
  levelFloor: number;
  levelCeiling: number;
  streak: Streak;
  dayIndex: number;
  totalDays: number;
  stepsCompleted: number;
  lessonsCompleted: number;
  learningMinutes: number;
  savedCount: number;
  applicationCount: number;
  projectCount: number;
  weeklyActivity: { date: string; label: string; xp: number; steps: number }[];
  goalProgressPct: number;
}
