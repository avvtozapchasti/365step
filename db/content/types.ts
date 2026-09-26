/**
 * Shapes for the seed content. Authoring happens in these plain objects; the
 * seed script is what turns them into rows.
 */

export interface SeedQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SeedResource {
  title: string;
  source: string;
  url: string;
  durationMin?: number;
  topic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface SeedLesson {
  slug: string;
  title: string;
  objective: string;
  estMinutes: number;
  xp?: number;
  /** Short. Two or three paragraphs at most — this is not a textbook. */
  theory: string;
  example?: string;
  takeaway?: string;
  questions: SeedQuestion[];
  resources?: SeedResource[];
}

export interface SeedCourse {
  slug: string;
  track: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  subjects: string[];
  audiences: ("school" | "university" | "graduate")[];
  goalSlugs: string[];
  accent: string;
  lessons: SeedLesson[];
}

export interface SeedOpportunity {
  slug: string;
  title: string;
  organization: string;
  type:
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
  summary: string;
  description: string;
  audiences: ("school" | "university" | "graduate")[];
  subjects: string[];
  goalSlugs: string[];
  tags: string[];
  eligibility: string[];
  country: string;
  location: string;
  format?: "in_person" | "remote" | "hybrid";
  /** Days from seed time. Keeps every countdown in the demo alive. */
  deadlineInDays: number | null;
  cost: string;
  minGrade?: number | null;
  maxGrade?: number | null;
  officialUrl: string;
  /**
   * `false` = a real, existing programme; `officialUrl` is its official page.
   * `true`  = an illustrative example invented for the demo, surfaced in the
   *           UI with a "Demo example" badge so it is never mistaken for real.
   */
  isDemo: boolean;
  sourceNote: string;
  /** 1–3, nudges ranking so flagship programmes are not buried. */
  prestige?: number;
}

export interface SeedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  metric: "steps" | "streak" | "lessons" | "saved" | "projects" | "applications" | "xp" | "research";
  threshold: number;
}
