/**
 * Read queries. Every page reads through this module, so row shape is mapped to
 * domain types in exactly one place.
 */

import { all, bool, json, num, one, scalar, str } from "./db";
import {
  addDays,
  dayIndex as computeDayIndex,
  daysBetween,
  daysUntil,
  lastNDays,
  todayIso,
  weekdayLabel,
} from "./date";
import { TOTAL_DAYS } from "./roadmap";
import { levelFor } from "./xp";
import type {
  Achievement,
  Course,
  DailyStep,
  Goal,
  GrowthSnapshot,
  Lesson,
  LessonProgress,
  Opportunity,
  OpportunityType,
  Profile,
  Project,
  Question,
  Resource,
  Role,
  SkillLevel,
  Streak,
  UserDeadline,
} from "./types";

type R = Record<string, unknown>;

// ------------------------------------------------------------------ mappers --

function toProfile(row: R): Profile {
  return {
    userId: str(row.user_id),
    role: str(row.role, "school") as Role,
    grade: row.grade === null ? null : str(row.grade),
    country: row.country === null ? null : str(row.country),
    dailyMinutes: num(row.daily_minutes, 20),
    skillLevel: str(row.skill_level, "beginner") as SkillLevel,
    interests: json<string[]>(row.interests, []),
    secondary: json<string[]>(row.secondary, []),
    onboardedAt: row.onboarded_at === null ? null : str(row.onboarded_at),
    timezone: str(row.timezone, "UTC"),
  };
}

function toGoal(row: R): Goal {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    slug: str(row.slug),
    title: str(row.title),
    category: str(row.category),
    startDate: str(row.start_date),
    targetDate: row.target_date === null ? null : str(row.target_date),
    status: str(row.status, "active") as Goal["status"],
    isPrimary: bool(row.is_primary),
  };
}

function toCourse(row: R): Course {
  return {
    id: str(row.id),
    slug: str(row.slug),
    track: str(row.track),
    title: str(row.title),
    subtitle: str(row.subtitle),
    description: str(row.description),
    difficulty: str(row.difficulty, "beginner") as SkillLevel,
    subjects: json<string[]>(row.subjects, []),
    audiences: json<Role[]>(row.audiences, []),
    goalSlugs: json<string[]>(row.goal_slugs, []),
    accent: str(row.accent, "indigo"),
    orderIndex: num(row.order_index),
  };
}

function toLesson(row: R): Lesson {
  return {
    id: str(row.id),
    courseId: str(row.course_id),
    slug: str(row.slug),
    title: str(row.title),
    objective: str(row.objective),
    estMinutes: num(row.est_minutes, 8),
    xp: num(row.xp, 20),
    theory: str(row.theory),
    example: row.example === null ? null : str(row.example),
    takeaway: row.takeaway === null ? null : str(row.takeaway),
    orderIndex: num(row.order_index),
  };
}

function toOpportunity(row: R): Opportunity {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    organization: str(row.organization),
    type: str(row.type) as OpportunityType,
    summary: str(row.summary),
    description: str(row.description),
    audiences: json<Role[]>(row.audiences, []),
    subjects: json<string[]>(row.subjects, []),
    goalSlugs: json<string[]>(row.goal_slugs, []),
    tags: json<string[]>(row.tags, []),
    eligibility: json<string[]>(row.eligibility, []),
    country: str(row.country),
    location: str(row.location),
    format: str(row.format, "in_person"),
    deadline: row.deadline === null ? null : str(row.deadline),
    cost: str(row.cost, "Free"),
    minGrade: row.min_grade === null ? null : num(row.min_grade),
    maxGrade: row.max_grade === null ? null : num(row.max_grade),
    officialUrl: str(row.official_url),
    isDemo: bool(row.is_demo),
    sourceNote: row.source_note === null ? null : str(row.source_note),
    prestige: num(row.prestige, 2),
  };
}

function toStep(row: R): DailyStep {
  return {
    id: str(row.id),
    dayIndex: num(row.day_index),
    stepDate: str(row.step_date),
    kind: str(row.kind, "learn") as DailyStep["kind"],
    title: str(row.title),
    context: str(row.context),
    detail: str(row.detail),
    estMinutes: num(row.est_minutes, 10),
    xp: num(row.xp, 15),
    refType: row.ref_type === null ? null : str(row.ref_type),
    refSlug: row.ref_slug === null ? null : str(row.ref_slug),
    status: str(row.status, "todo") as DailyStep["status"],
    completedAt: row.completed_at === null ? null : str(row.completed_at),
    orderIndex: num(row.order_index),
  };
}

function toProject(row: R): Project {
  return {
    id: str(row.id),
    name: str(row.name),
    description: str(row.description),
    category: str(row.category, "other"),
    skills: json<string[]>(row.skills, []),
    status: str(row.status, "idea") as Project["status"],
    link: row.link === null ? null : str(row.link),
    githubUrl: row.github_url === null ? null : str(row.github_url),
    demoUrl: row.demo_url === null ? null : str(row.demo_url),
    startedOn: row.started_on === null ? null : str(row.started_on),
    updatedAt: str(row.updated_at),
  };
}

// ------------------------------------------------------------------ profile --

export async function getProfile(userId: string): Promise<Profile | null> {
  const row = await one<R>("SELECT * FROM profiles WHERE user_id = ?", [userId]);
  return row ? toProfile(row) : null;
}

export async function getPrimaryGoal(userId: string): Promise<Goal | null> {
  const row = await one<R>(
    `SELECT * FROM goals WHERE user_id = ? AND status = 'active'
      ORDER BY is_primary DESC, created_at DESC`,
    [userId],
  );
  return row ? toGoal(row) : null;
}

export async function getStreak(userId: string): Promise<Streak> {
  const row = await one<R>("SELECT * FROM streaks WHERE user_id = ?", [userId]);
  if (!row) return { currentDays: 0, longestDays: 0, lastActiveDate: null };

  // A streak that was not continued yesterday or today is already broken; show
  // it as zero rather than waiting for the next write to correct it.
  const last = row.last_active_date === null ? null : str(row.last_active_date);
  const stale = last !== null && daysBetween(last, todayIso()) > 1;

  return {
    currentDays: stale ? 0 : num(row.current_days),
    longestDays: num(row.longest_days),
    lastActiveDate: last,
  };
}

export async function getTotalXp(userId: string): Promise<number> {
  return scalar("SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?", [userId]);
}

// ----------------------------------------------------------------- learning --

export async function getCourses(): Promise<Course[]> {
  const rows = await all<R>("SELECT * FROM courses ORDER BY order_index, title");
  return rows.map(toCourse);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const row = await one<R>("SELECT * FROM courses WHERE slug = ?", [slug]);
  return row ? toCourse(row) : null;
}

export async function getLessons(courseId: string): Promise<Lesson[]> {
  const rows = await all<R>("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index", [
    courseId,
  ]);
  return rows.map(toLesson);
}

export async function getLesson(courseSlug: string, lessonSlug: string): Promise<Lesson | null> {
  const row = await one<R>(
    `SELECT l.* FROM lessons l JOIN courses c ON c.id = l.course_id
      WHERE c.slug = ? AND l.slug = ?`,
    [courseSlug, lessonSlug],
  );
  return row ? toLesson(row) : null;
}

export async function getQuestions(lessonId: string): Promise<Question[]> {
  const rows = await all<R>("SELECT * FROM questions WHERE lesson_id = ? ORDER BY order_index", [
    lessonId,
  ]);
  return rows.map((row) => ({
    id: str(row.id),
    lessonId: str(row.lesson_id),
    prompt: str(row.prompt),
    options: json<string[]>(row.options, []),
    correctIndex: num(row.correct_index),
    explanation: str(row.explanation),
    orderIndex: num(row.order_index),
  }));
}

export async function getResources(lessonId: string): Promise<Resource[]> {
  const rows = await all<R>("SELECT * FROM resources WHERE lesson_id = ? ORDER BY order_index", [
    lessonId,
  ]);
  return rows.map((row) => ({
    id: str(row.id),
    title: str(row.title),
    source: str(row.source),
    url: str(row.url),
    durationMin: row.duration_min === null ? null : num(row.duration_min),
    topic: row.topic === null ? null : str(row.topic),
    difficulty: str(row.difficulty, "beginner"),
  }));
}

/** lessonId -> progress, for marking up course and lesson lists. */
export async function getLessonProgressMap(userId: string): Promise<Map<string, LessonProgress>> {
  const rows = await all<R>("SELECT * FROM lesson_progress WHERE user_id = ?", [userId]);
  return new Map(
    rows.map((row) => [
      str(row.lesson_id),
      {
        lessonId: str(row.lesson_id),
        status: str(row.status, "in_progress") as LessonProgress["status"],
        correct: num(row.correct),
        total: num(row.total),
        minutes: num(row.minutes),
        attempts: num(row.attempts, 1),
        completedAt: row.completed_at === null ? null : str(row.completed_at),
      },
    ]),
  );
}

export interface CourseWithProgress extends Course {
  lessonCount: number;
  completedCount: number;
  totalMinutes: number;
  progressPct: number;
  nextLessonSlug: string | null;
}

export async function getCoursesWithProgress(userId: string): Promise<CourseWithProgress[]> {
  const courses = await getCourses();
  const progress = await getLessonProgressMap(userId);
  const lessonRows = await all<R>(
    "SELECT id, course_id, slug, est_minutes, order_index FROM lessons ORDER BY order_index",
  );

  return courses.map((course) => {
    const lessons = lessonRows.filter((l) => str(l.course_id) === course.id);
    const completed = lessons.filter((l) => progress.get(str(l.id))?.status === "completed");
    const next = lessons.find((l) => progress.get(str(l.id))?.status !== "completed");

    return {
      ...course,
      lessonCount: lessons.length,
      completedCount: completed.length,
      totalMinutes: lessons.reduce((sum, l) => sum + num(l.est_minutes), 0),
      progressPct: lessons.length === 0 ? 0 : Math.round((completed.length / lessons.length) * 100),
      nextLessonSlug: next ? str(next.slug) : null,
    };
  });
}

/** The next unfinished lesson across the courses that serve this goal. */
export async function getNextLesson(
  userId: string,
  goalSlug: string | null,
  interests: string[],
): Promise<{ course: Course; lesson: Lesson } | null> {
  const courses = await getCourses();
  const progress = await getLessonProgressMap(userId);

  const relevance = (course: Course) => {
    let score = 0;
    if (goalSlug && course.goalSlugs.includes(goalSlug)) score += 10;
    score += course.subjects.filter((s) => interests.includes(s)).length * 3;
    return score;
  };

  const ordered = [...courses].sort((a, b) => relevance(b) - relevance(a) || a.orderIndex - b.orderIndex);

  for (const course of ordered) {
    const lessons = await getLessons(course.id);
    const next = lessons.find((l) => progress.get(l.id)?.status !== "completed");
    if (next) return { course, lesson: next };
  }
  return null;
}

/** The most recently completed lesson — what a practice step points back at. */
export async function getLastCompletedLesson(
  userId: string,
): Promise<{ courseSlug: string; lesson: Lesson } | null> {
  const row = await one<R>(
    `SELECT l.*, c.slug AS course_slug
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN courses c ON c.id = l.course_id
      WHERE lp.user_id = ? AND lp.status = 'completed'
      ORDER BY lp.completed_at DESC`,
    [userId],
  );
  return row ? { courseSlug: str(row.course_slug), lesson: toLesson(row) } : null;
}

// -------------------------------------------------------------- daily steps --

export async function getSteps(userId: string, date: string): Promise<DailyStep[]> {
  const rows = await all<R>(
    "SELECT * FROM daily_steps WHERE user_id = ? AND step_date = ? ORDER BY order_index",
    [userId, date],
  );
  return rows.map(toStep);
}

export async function getStepById(userId: string, stepId: string): Promise<DailyStep | null> {
  const row = await one<R>("SELECT * FROM daily_steps WHERE id = ? AND user_id = ?", [
    stepId,
    userId,
  ]);
  return row ? toStep(row) : null;
}

export async function countCompletedSteps(userId: string): Promise<number> {
  return scalar("SELECT COUNT(*) FROM daily_steps WHERE user_id = ? AND status = 'done'", [userId]);
}

// ------------------------------------------------------------ opportunities --

export async function getOpportunities(): Promise<Opportunity[]> {
  const rows = await all<R>("SELECT * FROM opportunities ORDER BY order_index, title");
  return rows.map(toOpportunity);
}

export async function getOpportunityBySlug(slug: string): Promise<Opportunity | null> {
  const row = await one<R>("SELECT * FROM opportunities WHERE slug = ?", [slug]);
  return row ? toOpportunity(row) : null;
}

export async function getSavedOpportunityIds(userId: string): Promise<Set<string>> {
  const rows = await all<{ opportunity_id: string }>(
    "SELECT opportunity_id FROM saved_opportunities WHERE user_id = ?",
    [userId],
  );
  return new Set(rows.map((r) => str(r.opportunity_id)));
}

export async function getSavedOpportunities(userId: string): Promise<Opportunity[]> {
  const rows = await all<R>(
    `SELECT o.* FROM saved_opportunities s JOIN opportunities o ON o.id = s.opportunity_id
      WHERE s.user_id = ? ORDER BY s.created_at DESC`,
    [userId],
  );
  return rows.map(toOpportunity);
}

export async function getApplicationCount(userId: string): Promise<number> {
  return scalar("SELECT COUNT(*) FROM applications WHERE user_id = ?", [userId]);
}

export async function hasApplication(userId: string, opportunityId: string): Promise<boolean> {
  const row = await one<{ id: string }>(
    "SELECT id FROM applications WHERE user_id = ? AND opportunity_id = ?",
    [userId, opportunityId],
  );
  return row !== null;
}

// ----------------------------------------------------------------- deadlines --

export async function getDeadlines(userId: string, includeDone = false): Promise<UserDeadline[]> {
  const rows = await all<R>(
    `SELECT d.*, o.slug AS opportunity_slug
       FROM user_deadlines d
       LEFT JOIN opportunities o ON o.id = d.opportunity_id
      WHERE d.user_id = ?${includeDone ? "" : " AND d.done = 0"}
      ORDER BY d.due_date`,
    [userId],
  );

  return rows.map((row) => ({
    id: str(row.id),
    title: str(row.title),
    dueDate: str(row.due_date),
    kind: str(row.kind, "application"),
    done: bool(row.done),
    opportunityId: row.opportunity_id === null ? null : str(row.opportunity_id),
    opportunitySlug: row.opportunity_slug === null ? null : str(row.opportunity_slug),
    daysLeft: daysUntil(str(row.due_date)) ?? 0,
  }));
}

// ------------------------------------------------------------------ projects --

export async function getProjects(userId: string): Promise<Project[]> {
  const rows = await all<R>(
    "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
    [userId],
  );
  return rows.map(toProject);
}

export async function getProject(userId: string, id: string): Promise<Project | null> {
  const row = await one<R>("SELECT * FROM projects WHERE id = ? AND user_id = ?", [id, userId]);
  return row ? toProject(row) : null;
}

// -------------------------------------------------------------- achievements --

export async function getAchievements(userId: string): Promise<Achievement[]> {
  const rows = await all<R>(
    `SELECT a.*, ua.earned_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
      ORDER BY a.order_index`,
    [userId],
  );

  return rows.map((row) => ({
    id: str(row.id),
    code: str(row.code),
    title: str(row.title),
    description: str(row.description),
    icon: str(row.icon),
    xp: num(row.xp),
    metric: str(row.metric),
    threshold: num(row.threshold),
    earnedAt: row.earned_at === null || row.earned_at === undefined ? null : str(row.earned_at),
  }));
}

// ------------------------------------------------------------------ snapshot --

/**
 * The single aggregate the dashboard, progress page and AI assistant all read.
 * Computed from real rows, never stored, so it cannot drift from the truth.
 */
export async function getSnapshot(userId: string, goal: Goal | null): Promise<GrowthSnapshot> {
  const startDate = goal?.startDate ?? todayIso();

  const [
    totalXp,
    streak,
    stepsCompleted,
    lessonsCompleted,
    learningMinutes,
    savedCount,
    applicationCount,
    projectCount,
  ] = await Promise.all([
    getTotalXp(userId),
    getStreak(userId),
    countCompletedSteps(userId),
    scalar("SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND status = 'completed'", [
      userId,
    ]),
    scalar("SELECT COALESCE(SUM(minutes), 0) FROM lesson_progress WHERE user_id = ?", [userId]),
    scalar("SELECT COUNT(*) FROM saved_opportunities WHERE user_id = ?", [userId]),
    getApplicationCount(userId),
    scalar("SELECT COUNT(*) FROM projects WHERE user_id = ?", [userId]),
  ]);

  const level = levelFor(totalXp);
  const days = lastNDays(7);

  const xpRows = await all<R>(
    `SELECT day_date, COALESCE(SUM(amount), 0) AS xp
       FROM xp_events WHERE user_id = ? AND day_date >= ?
      GROUP BY day_date`,
    [userId, days[0]],
  );
  const stepRows = await all<R>(
    `SELECT step_date, COUNT(*) AS n
       FROM daily_steps WHERE user_id = ? AND status = 'done' AND step_date >= ?
      GROUP BY step_date`,
    [userId, days[0]],
  );

  const xpByDay = new Map(xpRows.map((r) => [str(r.day_date), num(r.xp)]));
  const stepsByDay = new Map(stepRows.map((r) => [str(r.step_date), num(r.n)]));

  const dayIndex = Math.min(TOTAL_DAYS, computeDayIndex(startDate));

  return {
    totalXp,
    level: level.level,
    levelTitle: level.title,
    levelFloor: level.floor,
    levelCeiling: level.ceiling,
    streak,
    dayIndex,
    totalDays: TOTAL_DAYS,
    stepsCompleted,
    lessonsCompleted,
    learningMinutes,
    savedCount,
    applicationCount,
    projectCount,
    weeklyActivity: days.map((date) => ({
      date,
      label: weekdayLabel(date),
      xp: xpByDay.get(date) ?? 0,
      steps: stepsByDay.get(date) ?? 0,
    })),
    goalProgressPct: Math.min(100, Math.round((dayIndex / TOTAL_DAYS) * 100)),
  };
}

/** Longer activity history for the Progress page chart. */
export async function getActivityHistory(
  userId: string,
  days = 28,
): Promise<{ date: string; label: string; xp: number; steps: number; minutes: number }[]> {
  const window = lastNDays(days);

  const xpRows = await all<R>(
    `SELECT day_date, COALESCE(SUM(amount), 0) AS xp
       FROM xp_events WHERE user_id = ? AND day_date >= ? GROUP BY day_date`,
    [userId, window[0]],
  );
  const stepRows = await all<R>(
    `SELECT step_date, COUNT(*) AS n, COALESCE(SUM(est_minutes), 0) AS mins
       FROM daily_steps WHERE user_id = ? AND status = 'done' AND step_date >= ?
      GROUP BY step_date`,
    [userId, window[0]],
  );

  const xpByDay = new Map(xpRows.map((r) => [str(r.day_date), num(r.xp)]));
  const stepsByDay = new Map(stepRows.map((r) => [str(r.step_date), num(r.n)]));
  const minsByDay = new Map(stepRows.map((r) => [str(r.step_date), num(r.mins)]));

  return window.map((date) => ({
    date,
    label: weekdayLabel(date),
    xp: xpByDay.get(date) ?? 0,
    steps: stepsByDay.get(date) ?? 0,
    minutes: minsByDay.get(date) ?? 0,
  }));
}

/** Per-track learning breakdown, for the Progress page. */
export async function getTrackProgress(
  userId: string,
): Promise<{ track: string; completed: number; total: number; pct: number }[]> {
  const rows = await all<R>(
    `SELECT c.track AS track,
            COUNT(l.id) AS total,
            SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM courses c
       JOIN lessons l ON l.course_id = c.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
      GROUP BY c.track
      ORDER BY c.track`,
    [userId],
  );

  return rows.map((row) => {
    const total = num(row.total);
    const completed = num(row.completed);
    return {
      track: str(row.track),
      completed,
      total,
      pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

/** Used by the seed script's date maths and by the dashboard header. */
export function projectedEndDate(startDate: string): string {
  return addDays(startDate, TOTAL_DAYS - 1);
}
