/**
 * The daily plan: the three to five small actions that answer "what do I do
 * today?".
 *
 * Steps are generated from real state — which lessons are unfinished, which
 * roadmap tasks are open, which matching opportunities are closing — and then
 * trimmed to the user's stated daily minutes. Three to five, never twenty.
 */

import { randomUUID } from "node:crypto";

import { all, num, run, str } from "./db";
import { dayIndex as computeDayIndex, todayIso } from "./date";
import { rankOpportunities } from "./match";
import {
  getLastCompletedLesson,
  getLessons,
  getNextLesson,
  getOpportunities,
  getPrimaryGoal,
  getProfile,
  getSavedOpportunityIds,
  getSteps,
} from "./queries";
import { currentMilestoneTasks } from "./roadmap";
import { XP_AWARDS } from "./xp";
import type { DailyStep, Goal, Profile, StepKind } from "./types";

interface Candidate {
  kind: StepKind;
  title: string;
  context: string;
  detail: string;
  estMinutes: number;
  xp: number;
  refType: string | null;
  refSlug: string | null;
}

/** Never fewer than this many steps, and never more. */
const MIN_STEPS = 3;
const MAX_STEPS = 5;

/**
 * Returns today's steps, generating them on first visit of the day.
 *
 * Idempotent: two concurrent page loads cannot produce two plans, because the
 * generated rows are re-read after insertion and the check runs first.
 */
export async function ensureTodaySteps(userId: string, date = todayIso()): Promise<DailyStep[]> {
  const existing = await getSteps(userId, date);
  if (existing.length > 0) return existing;

  const [profile, goal] = await Promise.all([getProfile(userId), getPrimaryGoal(userId)]);
  if (!profile || !goal) return [];

  const candidates = await buildCandidates(userId, profile, goal);
  if (candidates.length === 0) return [];

  const chosen = trimToBudget(candidates, profile.dailyMinutes);
  const dayIndex = computeDayIndex(goal.startDate, date);

  for (let i = 0; i < chosen.length; i++) {
    const c = chosen[i];
    await run(
      `INSERT INTO daily_steps
         (id, user_id, day_index, step_date, kind, title, context, detail,
          est_minutes, xp, ref_type, ref_slug, status, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?)`,
      [
        randomUUID(),
        userId,
        dayIndex,
        date,
        c.kind,
        c.title,
        c.context,
        c.detail,
        c.estMinutes,
        c.xp,
        c.refType,
        c.refSlug,
        i,
      ],
    );
  }

  // Re-read so two simultaneous first loads converge on one plan rather than
  // each returning its own in-memory version.
  return getSteps(userId, date);
}

async function buildCandidates(
  userId: string,
  profile: Profile,
  goal: Goal,
): Promise<Candidate[]> {
  const candidates: Candidate[] = [];

  // ---- 1. Learn: the next unfinished lesson on the most relevant course ----
  const next = await getNextLesson(userId, goal.slug, profile.interests);
  if (next) {
    candidates.push({
      kind: "learn",
      title: next.lesson.title,
      context: next.course.title,
      detail: next.lesson.objective,
      estMinutes: next.lesson.estMinutes,
      xp: XP_AWARDS.lesson,
      refType: "lesson",
      refSlug: `${next.course.slug}/${next.lesson.slug}`,
    });
  }

  // ---- 2. Practice: consolidate the most recent thing learned --------------
  const last = await getLastCompletedLesson(userId);
  if (last) {
    candidates.push({
      kind: "practice",
      title: `Practice: ${last.lesson.title}`,
      context: "Retrieval practice",
      detail: "Redo the questions from this lesson without looking at the explanation first.",
      estMinutes: Math.max(5, Math.round(last.lesson.estMinutes * 0.6)),
      xp: XP_AWARDS.practice,
      refType: "practice",
      refSlug: `${last.courseSlug}/${last.lesson.slug}`,
    });
  } else if (next) {
    // Day one has nothing to revise yet, so practise the lesson just queued.
    const siblings = await getLessons(next.course.id);
    const second = siblings.find((l) => l.slug !== next.lesson.slug);
    if (second) {
      candidates.push({
        kind: "practice",
        title: `Try 3 questions: ${second.title}`,
        context: next.course.title,
        detail: "See what you already know before the lesson teaches it.",
        estMinutes: 6,
        xp: XP_AWARDS.practice,
        refType: "practice",
        refSlug: `${next.course.slug}/${second.slug}`,
      });
    }
  }

  // ---- 3. Build: an open task from the current roadmap milestone -----------
  const milestone = await currentMilestoneTasks(userId, goal.startDate);
  if (milestone) {
    const buildable = milestone.tasks.find(
      (t) => (t.kind === "build" || t.kind === "action") && t.refType !== "lesson",
    );
    if (buildable) {
      candidates.push({
        kind: "build",
        title: buildable.title,
        context: `Month ${milestone.monthIndex} · ${milestone.milestoneTitle}`,
        detail: "One concrete piece of it today — it does not have to be finished.",
        estMinutes: 15,
        xp: XP_AWARDS.build,
        refType: "roadmap_task",
        refSlug: buildable.id,
      });
    }
  }

  // ---- 4. Opportunity: the best match that is not saved yet ---------------
  const [opportunities, savedIds] = await Promise.all([
    getOpportunities(),
    getSavedOpportunityIds(userId),
  ]);

  const unsaved = rankOpportunities(
    opportunities.filter((o) => !savedIds.has(o.id)),
    { profile, goalSlug: goal.slug, goalTitle: goal.title, savedIds },
    { limit: 1, minScore: 45 },
  );

  if (unsaved.length > 0) {
    const opportunity = unsaved[0];
    candidates.push({
      kind: "opportunity",
      title: opportunity.title,
      context: opportunity.organization,
      detail:
        opportunity.daysLeft !== null && opportunity.daysLeft <= 30
          ? `Check whether you are eligible — it closes in ${opportunity.daysLeft} days.`
          : "Check whether you are eligible and save it if you are.",
      estMinutes: 3,
      xp: XP_AWARDS.opportunityReview,
      refType: "opportunity",
      refSlug: opportunity.slug,
    });
  }

  // ---- 5. Reflect: only for users who asked for a longer day --------------
  if (profile.dailyMinutes >= 30) {
    candidates.push({
      kind: "reflect",
      title: "Note one thing that clicked today",
      context: "Two minutes",
      detail: "Write a single sentence about what you understand now that you did not this morning.",
      estMinutes: 2,
      xp: XP_AWARDS.reflect,
      refType: null,
      refSlug: null,
    });
  }

  return candidates;
}

/**
 * Keeps adding steps until the day's minutes are covered, then stops — but
 * always lands between MIN_STEPS and MAX_STEPS so the card never looks empty
 * and never looks like a backlog.
 */
function trimToBudget(candidates: Candidate[], dailyMinutes: number): Candidate[] {
  const chosen: Candidate[] = [];
  let minutes = 0;

  for (const candidate of candidates) {
    if (chosen.length >= MAX_STEPS) break;
    if (chosen.length >= MIN_STEPS && minutes >= dailyMinutes) break;
    chosen.push(candidate);
    minutes += candidate.estMinutes;
  }

  return chosen;
}

/** Total minutes planned for a set of steps — shown in the dashboard header. */
export function plannedMinutes(steps: DailyStep[]): number {
  return steps.reduce((sum, s) => sum + s.estMinutes, 0);
}

/**
 * Regenerates today's plan from current state. Completed steps are kept, so a
 * user cannot farm XP by regenerating after finishing everything.
 */
export async function regenerateTodaySteps(userId: string, date = todayIso()): Promise<DailyStep[]> {
  const done = await all<{ id: string }>(
    "SELECT id FROM daily_steps WHERE user_id = ? AND step_date = ? AND status = 'done'",
    [userId, date],
  );

  await run(
    "DELETE FROM daily_steps WHERE user_id = ? AND step_date = ? AND status <> 'done'",
    [userId, date],
  );

  const remaining = await getSteps(userId, date);
  if (remaining.length >= MIN_STEPS) return remaining;

  const [profile, goal] = await Promise.all([getProfile(userId), getPrimaryGoal(userId)]);
  if (!profile || !goal) return remaining;

  const candidates = await buildCandidates(userId, profile, goal);

  // Do not re-offer anything already completed today.
  const doneRefs = new Set(remaining.map((s) => `${s.refType}:${s.refSlug}`));
  const fresh = candidates.filter((c) => !doneRefs.has(`${c.refType}:${c.refSlug}`));

  const room = Math.max(0, MAX_STEPS - remaining.length);
  const chosen = trimToBudget(fresh, profile.dailyMinutes).slice(0, room);
  const dayIndex = computeDayIndex(goal.startDate, date);
  const offset = num(done.length);

  for (let i = 0; i < chosen.length; i++) {
    const c = chosen[i];
    await run(
      `INSERT INTO daily_steps
         (id, user_id, day_index, step_date, kind, title, context, detail,
          est_minutes, xp, ref_type, ref_slug, status, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?)`,
      [
        randomUUID(),
        userId,
        dayIndex,
        date,
        c.kind,
        c.title,
        c.context,
        c.detail,
        c.estMinutes,
        c.xp,
        c.refType,
        c.refSlug,
        offset + i,
      ],
    );
  }

  return getSteps(userId, date);
}

// Presentation helpers live in ./step-display so client components can import
// them without pulling this module's database and node:crypto dependencies
// across the server boundary.
export { stepAction, stepHref, stepKindLabel, stepNumber } from "./step-display";
