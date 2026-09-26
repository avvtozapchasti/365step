/**
 * XP, streaks and achievements — the write side.
 *
 * Every award here is triggered by something the user actually finished, and
 * each one is idempotent where it needs to be: completing an already-completed
 * step awards nothing, and an achievement can only be earned once. That is what
 * keeps the progress page meaningful.
 */

import { randomUUID } from "node:crypto";

import { all, num, one, run, scalar, str, transaction } from "./db";
import { daysBetween, nowIso, todayIso } from "./date";
import { markRoadmapTaskForLesson } from "./roadmap";
import { XP_AWARDS } from "./xp";
import type { DailyStep } from "./types";

export interface AwardedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
}

export interface ActionResult {
  xpAwarded: number;
  newAchievements: AwardedAchievement[];
  streakDays: number;
  dailyPlanComplete: boolean;
  levelledUp: boolean;
}

// ---------------------------------------------------------------------- XP ---

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  refType: string | null = null,
  refId: string | null = null,
  date = todayIso(),
): Promise<void> {
  if (amount <= 0) return;

  await run(
    `INSERT INTO xp_events (id, user_id, amount, reason, ref_type, ref_id, created_at, day_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), userId, amount, reason, refType, refId, nowIso(), date],
  );
}

// ------------------------------------------------------------------ streak ---

/**
 * Records activity for `date` and returns the resulting streak length.
 *
 * Same day    -> unchanged (activity is not double-counted)
 * Yesterday   -> +1
 * Longer gap  -> reset to 1
 */
export async function touchStreak(userId: string, date = todayIso()): Promise<number> {
  const row = await one<Record<string, unknown>>("SELECT * FROM streaks WHERE user_id = ?", [
    userId,
  ]);

  if (!row) {
    await run(
      `INSERT INTO streaks (user_id, current_days, longest_days, last_active_date, updated_at)
       VALUES (?, 1, 1, ?, ?)`,
      [userId, date, nowIso()],
    );
    return 1;
  }

  const last = row.last_active_date === null ? null : str(row.last_active_date);
  const current = num(row.current_days);
  const longest = num(row.longest_days);

  if (last === date) return current;

  const gap = last === null ? Infinity : daysBetween(last, date);
  const next = gap === 1 ? current + 1 : 1;

  await run(
    `UPDATE streaks SET current_days = ?, longest_days = ?, last_active_date = ?, updated_at = ?
      WHERE user_id = ?`,
    [next, Math.max(longest, next), date, nowIso(), userId],
  );

  return next;
}

// ----------------------------------------------------------- daily progress ---

export async function recordDailyProgress(userId: string, date = todayIso()): Promise<void> {
  const totals = await one<Record<string, unknown>>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'done' THEN est_minutes ELSE 0 END) AS minutes
       FROM daily_steps WHERE user_id = ? AND step_date = ?`,
    [userId, date],
  );

  const xp = await scalar(
    "SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ? AND day_date = ?",
    [userId, date],
  );

  const total = num(totals?.total);
  const completed = num(totals?.completed);
  const minutes = num(totals?.minutes);

  const existing = await one<{ id: string }>(
    "SELECT id FROM daily_progress WHERE user_id = ? AND day_date = ?",
    [userId, date],
  );

  if (existing) {
    await run(
      `UPDATE daily_progress SET steps_total = ?, steps_completed = ?, xp_earned = ?, minutes = ?
        WHERE id = ?`,
      [total, completed, xp, minutes, str(existing.id)],
    );
  } else {
    await run(
      `INSERT INTO daily_progress (id, user_id, day_date, steps_total, steps_completed, xp_earned, minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), userId, date, total, completed, xp, minutes],
    );
  }
}

// ------------------------------------------------------------ achievements ---

/** Current value of every metric achievements can be measured against. */
async function metricValues(userId: string): Promise<Record<string, number>> {
  const [steps, streak, lessons, saved, projects, applications, xp, research] = await Promise.all([
    scalar("SELECT COUNT(*) FROM daily_steps WHERE user_id = ? AND status = 'done'", [userId]),
    scalar("SELECT COALESCE(MAX(current_days), 0) FROM streaks WHERE user_id = ?", [userId]),
    scalar("SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND status = 'completed'", [
      userId,
    ]),
    scalar("SELECT COUNT(*) FROM saved_opportunities WHERE user_id = ?", [userId]),
    scalar("SELECT COUNT(*) FROM projects WHERE user_id = ?", [userId]),
    scalar("SELECT COUNT(*) FROM applications WHERE user_id = ?", [userId]),
    scalar("SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?", [userId]),
    scalar(
      `SELECT COUNT(*) FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN courses c ON c.id = l.course_id
        WHERE lp.user_id = ? AND lp.status = 'completed' AND c.track = 'Research'`,
      [userId],
    ),
  ]);

  return { steps, streak, lessons, saved, projects, applications, xp, research };
}

/**
 * Grants any achievement whose threshold is now met. Returns only the ones
 * newly earned, so the UI can celebrate them exactly once.
 */
export async function checkAchievements(userId: string): Promise<AwardedAchievement[]> {
  const values = await metricValues(userId);

  const pending = await all<Record<string, unknown>>(
    `SELECT a.id, a.code, a.title, a.description, a.icon, a.xp, a.metric, a.threshold
       FROM achievements a
      WHERE NOT EXISTS (
        SELECT 1 FROM user_achievements ua
         WHERE ua.achievement_id = a.id AND ua.user_id = ?
      )`,
    [userId],
  );

  const earned: AwardedAchievement[] = [];

  for (const row of pending) {
    const metric = str(row.metric);
    const threshold = num(row.threshold);
    if ((values[metric] ?? 0) < threshold) continue;

    await run(
      `INSERT INTO user_achievements (id, user_id, achievement_id, earned_at) VALUES (?, ?, ?, ?)`,
      [randomUUID(), userId, str(row.id), nowIso()],
    );

    const xp = num(row.xp);
    if (xp > 0) await awardXp(userId, xp, `Achievement: ${str(row.title)}`, "achievement", str(row.id));

    earned.push({
      code: str(row.code),
      title: str(row.title),
      description: str(row.description),
      icon: str(row.icon),
      xp,
    });
  }

  return earned;
}

// ------------------------------------------------------------ step actions ---

/**
 * Completes a daily step: marks it done, awards its XP, extends the streak,
 * adds the all-steps-done bonus, and grants any achievement that unlocks.
 *
 * Returns what happened so the UI can show the XP and any new badge. Completing
 * a step that is already done is a no-op.
 */
export async function completeStep(userId: string, stepId: string): Promise<ActionResult | null> {
  const step = await one<Record<string, unknown>>(
    "SELECT * FROM daily_steps WHERE id = ? AND user_id = ?",
    [stepId, userId],
  );
  if (!step) return null;
  if (str(step.status) === "done") {
    return {
      xpAwarded: 0,
      newAchievements: [],
      streakDays: await scalar("SELECT COALESCE(current_days, 0) FROM streaks WHERE user_id = ?", [
        userId,
      ]),
      dailyPlanComplete: false,
      levelledUp: false,
    };
  }

  const date = str(step.step_date);
  const xp = num(step.xp);
  const xpBefore = await scalar(
    "SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?",
    [userId],
  );

  const result = await transaction(async () => {
    await run("UPDATE daily_steps SET status = 'done', completed_at = ? WHERE id = ?", [
      nowIso(),
      stepId,
    ]);

    await awardXp(userId, xp, `Step: ${str(step.title)}`, "daily_step", stepId, date);

    // A step referencing a roadmap task closes that task too, so the roadmap
    // moves when the daily plan does.
    if (str(step.ref_type) === "roadmap_task") {
      await run("UPDATE roadmap_tasks SET status = 'done' WHERE id = ?", [str(step.ref_slug)]);
    }

    const streakDays = await touchStreak(userId, date);

    // Bonus for clearing the whole day.
    const remaining = await scalar(
      "SELECT COUNT(*) FROM daily_steps WHERE user_id = ? AND step_date = ? AND status = 'todo'",
      [userId, date],
    );
    const dailyPlanComplete = remaining === 0;

    let bonus = 0;
    if (dailyPlanComplete) {
      const alreadyBonused = await scalar(
        `SELECT COUNT(*) FROM xp_events
          WHERE user_id = ? AND day_date = ? AND reason = 'Daily plan complete'`,
        [userId, date],
      );
      if (alreadyBonused === 0) {
        bonus = XP_AWARDS.dailyPlanComplete;
        await awardXp(userId, bonus, "Daily plan complete", "daily_plan", date, date);
      }
    }

    await recordDailyProgress(userId, date);

    return { xpAwarded: xp + bonus, streakDays, dailyPlanComplete };
  });

  const newAchievements = await checkAchievements(userId);
  const xpAfter = await scalar("SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?", [
    userId,
  ]);

  const { levelFor } = await import("./xp");

  return {
    ...result,
    newAchievements,
    levelledUp: levelFor(xpAfter).level > levelFor(xpBefore).level,
  };
}

/** Un-completes a step and reverses its XP. Used by the undo affordance. */
export async function uncompleteStep(userId: string, stepId: string): Promise<boolean> {
  const step = await one<Record<string, unknown>>(
    "SELECT * FROM daily_steps WHERE id = ? AND user_id = ? AND status = 'done'",
    [stepId, userId],
  );
  if (!step) return false;

  const date = str(step.step_date);

  await transaction(async () => {
    await run("UPDATE daily_steps SET status = 'todo', completed_at = NULL WHERE id = ?", [stepId]);

    // Remove this step's XP and any day-complete bonus it triggered. Achievements
    // already earned are deliberately kept — they record something that happened.
    await run("DELETE FROM xp_events WHERE user_id = ? AND ref_type = 'daily_step' AND ref_id = ?", [
      userId,
      stepId,
    ]);
    await run(
      `DELETE FROM xp_events
        WHERE user_id = ? AND day_date = ? AND reason = 'Daily plan complete'`,
      [userId, date],
    );

    if (str(step.ref_type) === "roadmap_task") {
      await run("UPDATE roadmap_tasks SET status = 'todo' WHERE id = ?", [str(step.ref_slug)]);
    }

    await recordDailyProgress(userId, date);
  });

  return true;
}

// ---------------------------------------------------------- lesson actions ---

export interface LessonResult extends ActionResult {
  correct: number;
  total: number;
  perfect: boolean;
}

/**
 * Records a finished lesson and its quiz score.
 *
 * XP is awarded only the first time a lesson is completed — later attempts
 * update the score but do not pay again, so re-running a quiz cannot inflate
 * the progress page.
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  courseSlug: string,
  lessonSlug: string,
  correct: number,
  total: number,
  minutes: number,
): Promise<LessonResult> {
  const date = todayIso();
  const perfect = total > 0 && correct === total;

  const existing = await one<Record<string, unknown>>(
    "SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?",
    [userId, lessonId],
  );
  const firstCompletion = !existing || str(existing.status) !== "completed";

  const lesson = await one<Record<string, unknown>>("SELECT xp FROM lessons WHERE id = ?", [
    lessonId,
  ]);
  const lessonXp = num(lesson?.xp, XP_AWARDS.lesson);

  const xpBefore = await scalar(
    "SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?",
    [userId],
  );

  const result = await transaction(async () => {
    if (existing) {
      await run(
        `UPDATE lesson_progress
            SET status = 'completed', correct = ?, total = ?, minutes = ?,
                attempts = attempts + 1, completed_at = ?, updated_at = ?
          WHERE id = ?`,
        [correct, total, minutes, nowIso(), nowIso(), str(existing.id)],
      );
    } else {
      await run(
        `INSERT INTO lesson_progress
           (id, user_id, lesson_id, status, correct, total, minutes, attempts, completed_at, updated_at)
         VALUES (?, ?, ?, 'completed', ?, ?, ?, 1, ?, ?)`,
        [randomUUID(), userId, lessonId, correct, total, minutes, nowIso(), nowIso()],
      );
    }

    let xpAwarded = 0;
    if (firstCompletion) {
      xpAwarded += lessonXp;
      await awardXp(userId, lessonXp, `Lesson: ${lessonSlug}`, "lesson", lessonId, date);

      if (perfect) {
        xpAwarded += XP_AWARDS.quizPerfect;
        await awardXp(userId, XP_AWARDS.quizPerfect, "Perfect quiz", "lesson", lessonId, date);
      }
    }

    // Finishing a lesson closes the matching roadmap task and any daily step
    // that pointed at it — one action, consistent state everywhere.
    await markRoadmapTaskForLesson(userId, courseSlug, lessonSlug);

    const stepRefs = [`${courseSlug}/${lessonSlug}`];
    await run(
      `UPDATE daily_steps SET status = 'done', completed_at = ?
        WHERE user_id = ? AND step_date = ? AND status = 'todo'
          AND ref_type IN ('lesson', 'practice') AND ref_slug = ?`,
      [nowIso(), userId, date, stepRefs[0]],
    );

    const streakDays = await touchStreak(userId, date);

    const remaining = await scalar(
      "SELECT COUNT(*) FROM daily_steps WHERE user_id = ? AND step_date = ? AND status = 'todo'",
      [userId, date],
    );
    const dailyPlanComplete = remaining === 0;

    if (dailyPlanComplete) {
      const alreadyBonused = await scalar(
        `SELECT COUNT(*) FROM xp_events
          WHERE user_id = ? AND day_date = ? AND reason = 'Daily plan complete'`,
        [userId, date],
      );
      if (alreadyBonused === 0) {
        xpAwarded += XP_AWARDS.dailyPlanComplete;
        await awardXp(userId, XP_AWARDS.dailyPlanComplete, "Daily plan complete", "daily_plan", date, date);
      }
    }

    await recordDailyProgress(userId, date);

    return { xpAwarded, streakDays, dailyPlanComplete };
  });

  const newAchievements = await checkAchievements(userId);
  const xpAfter = await scalar("SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?", [
    userId,
  ]);
  const { levelFor } = await import("./xp");

  return {
    ...result,
    newAchievements,
    levelledUp: levelFor(xpAfter).level > levelFor(xpBefore).level,
    correct,
    total,
    perfect,
  };
}

// ---------------------------------------------------- opportunity actions ----

export interface SaveOutcome {
  saved: boolean;
  xpAwarded: number;
  newAchievements: AwardedAchievement[];
  /** Set when the opportunity id did not resolve. */
  notFound?: boolean;
}

/** Saves or unsaves an opportunity. Returns the new saved state. */
export async function toggleSavedOpportunity(
  userId: string,
  opportunityId: string,
): Promise<SaveOutcome> {
  // Resolve first: without this an unknown id reaches the INSERT and fails on the
  // foreign key, turning a bad request into a 500.
  const opportunity = await one<Record<string, unknown>>(
    "SELECT id, title, deadline, type, slug FROM opportunities WHERE id = ?",
    [opportunityId],
  );
  if (!opportunity) {
    return { saved: false, xpAwarded: 0, newAchievements: [], notFound: true };
  }

  const existing = await one<{ id: string }>(
    "SELECT id FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
    [userId, opportunityId],
  );

  if (existing) {
    await run("DELETE FROM saved_opportunities WHERE id = ?", [str(existing.id)]);
    // Mirror the removal in the tracked deadlines.
    await run("DELETE FROM user_deadlines WHERE user_id = ? AND opportunity_id = ?", [
      userId,
      opportunityId,
    ]);
    return { saved: false, xpAwarded: 0, newAchievements: [] };
  }

  await run(
    "INSERT INTO saved_opportunities (id, user_id, opportunity_id, note, created_at) VALUES (?, ?, ?, NULL, ?)",
    [randomUUID(), userId, opportunityId, nowIso()],
  );

  // Saving something with a real deadline puts it on the dashboard countdown.
  if (opportunity.deadline !== null) {
    await run(
      `INSERT INTO user_deadlines (id, user_id, opportunity_id, title, due_date, kind, done, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        randomUUID(),
        userId,
        opportunityId,
        str(opportunity.title),
        str(opportunity.deadline),
        str(opportunity.type, "application"),
        nowIso(),
      ],
    );
  }

  await awardXp(userId, XP_AWARDS.opportunitySaved, "Saved an opportunity", "opportunity", opportunityId);

  // Reviewing an opportunity closes the matching daily step.
  await run(
    `UPDATE daily_steps SET status = 'done', completed_at = ?
      WHERE user_id = ? AND step_date = ? AND status = 'todo'
        AND ref_type = 'opportunity' AND ref_slug = ?`,
    [nowIso(), userId, todayIso(), str(opportunity.slug)],
  );

  await touchStreak(userId);
  await recordDailyProgress(userId);

  return {
    saved: true,
    xpAwarded: XP_AWARDS.opportunitySaved,
    newAchievements: await checkAchievements(userId),
  };
}

/** Starts tracking an application for a saved opportunity. */
export async function startApplication(
  userId: string,
  opportunityId: string,
): Promise<{ created: boolean; newAchievements: AwardedAchievement[]; notFound?: boolean }> {
  const opportunity = await one<{ id: string }>("SELECT id FROM opportunities WHERE id = ?", [
    opportunityId,
  ]);
  if (!opportunity) return { created: false, newAchievements: [], notFound: true };

  const existing = await one<{ id: string }>(
    "SELECT id FROM applications WHERE user_id = ? AND opportunity_id = ?",
    [userId, opportunityId],
  );
  if (existing) return { created: false, newAchievements: [] };

  await run(
    `INSERT INTO applications (id, user_id, opportunity_id, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, 'preparing', NULL, ?, ?)`,
    [randomUUID(), userId, opportunityId, nowIso(), nowIso()],
  );

  await awardXp(
    userId,
    XP_AWARDS.applicationStarted,
    "Started an application",
    "application",
    opportunityId,
  );
  await touchStreak(userId);

  return { created: true, newAchievements: await checkAchievements(userId) };
}
