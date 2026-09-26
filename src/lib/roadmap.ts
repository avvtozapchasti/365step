/**
 * Roadmap generation and reading.
 *
 * Generation runs once, at the end of onboarding: the goal picks a template,
 * the user's interests fill the `{subject}` slots, and the result is persisted
 * as milestones and tasks. Statuses are then derived at read time from the
 * current day index and real task completion, so the roadmap stays honest
 * without a background job keeping it in sync.
 */

import { randomUUID } from "node:crypto";

import { all, num, run, str } from "./db";
import { dayIndex as computeDayIndex, nowIso } from "./date";
import { templateFor } from "./roadmap-templates";
import { subjectLabel } from "./taxonomy";
import type { Milestone, MilestoneStatus, RoadmapTask, TaskStatus } from "./types";

/** Each roadmap milestone covers a 30-day block of the 365-day journey. */
export const DAYS_PER_MILESTONE = 30;
export const TOTAL_DAYS = 365;

export function milestoneIndexForDay(dayIndex: number): number {
  return Math.min(12, Math.max(1, Math.floor((dayIndex - 1) / DAYS_PER_MILESTONE) + 1));
}

/**
 * Builds the persisted roadmap for a freshly onboarded user. Safe to call more
 * than once: any existing path for the goal is replaced.
 */
export async function generateRoadmap(
  userId: string,
  goalId: string,
  goalTitle: string,
  interests: string[],
): Promise<string> {
  const existing = await all<{ id: string }>(
    "SELECT id FROM learning_paths WHERE user_id = ? AND goal_id = ?",
    [userId, goalId],
  );
  for (const row of existing) {
    await run("DELETE FROM learning_paths WHERE id = ?", [str(row.id)]);
  }

  const goalSlug = str(
    (await all<{ slug: string }>("SELECT slug FROM goals WHERE id = ?", [goalId]))[0]?.slug,
  );
  const template = templateFor(goalSlug);

  // The subject that fills {subject} slots — the user's first stated interest,
  // with a neutral fallback so the copy never reads "Find  competitions".
  const primarySubject = interests.length > 0 ? subjectLabel(interests[0]).toLowerCase() : "your field";

  const pathId = randomUUID();
  await run(
    `INSERT INTO learning_paths (id, user_id, goal_id, title, summary, total_days, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      pathId,
      userId,
      goalId,
      goalTitle,
      `A twelve-month path built around ${primarySubject}, in 30-day blocks.`,
      TOTAL_DAYS,
      nowIso(),
    ],
  );

  for (let i = 0; i < template.length; i++) {
    const milestone = template[i];
    const milestoneId = randomUUID();

    await run(
      `INSERT INTO roadmap_milestones (id, learning_path_id, month_index, title, focus, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [milestoneId, pathId, i + 1, milestone.title, milestone.focus, i === 0 ? "current" : "upcoming"],
    );

    for (let j = 0; j < milestone.tasks.length; j++) {
      const task = milestone.tasks[j];
      const [refType, refValue] = task.ref ? splitRef(task.ref) : [null, null];

      await run(
        `INSERT INTO roadmap_tasks (id, milestone_id, title, kind, ref_type, ref_slug, status, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          milestoneId,
          task.subjectSlot ? task.title.replace("{subject}", primarySubject) : task.title,
          task.kind,
          refType,
          refValue,
          "todo",
          j,
        ],
      );
    }
  }

  return pathId;
}

/** 'lesson:sat-reading/transitions' -> ['lesson', 'sat-reading/transitions'] */
function splitRef(ref: string): [string, string | null] {
  const idx = ref.indexOf(":");
  if (idx === -1) return [ref, null];
  return [ref.slice(0, idx), ref.slice(idx + 1)];
}

export interface RoadmapView {
  pathId: string;
  title: string;
  summary: string | null;
  milestones: Milestone[];
  currentMonth: number;
  tasksDone: number;
  tasksTotal: number;
  progressPct: number;
}

/**
 * Reads the roadmap with statuses derived from where the user actually is.
 * A milestone is `done` when every task in it is done, `current` for the month
 * the user is in, and `upcoming` after that. Tasks in future months are
 * `locked` so the UI can show the path ahead without inviting a jump to month 9.
 */
export async function readRoadmap(userId: string, startDate: string): Promise<RoadmapView | null> {
  const paths = await all<Record<string, unknown>>(
    `SELECT id, title, summary FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );
  if (paths.length === 0) return null;

  const pathId = str(paths[0].id);
  const currentMonth = milestoneIndexForDay(computeDayIndex(startDate));

  const milestoneRows = await all<Record<string, unknown>>(
    `SELECT id, month_index, title, focus FROM roadmap_milestones
      WHERE learning_path_id = ? ORDER BY month_index`,
    [pathId],
  );

  const taskRows = await all<Record<string, unknown>>(
    `SELECT t.id, t.milestone_id, t.title, t.kind, t.ref_type, t.ref_slug, t.status, t.order_index
       FROM roadmap_tasks t
       JOIN roadmap_milestones m ON m.id = t.milestone_id
      WHERE m.learning_path_id = ?
      ORDER BY m.month_index, t.order_index`,
    [pathId],
  );

  let tasksDone = 0;

  const milestones: Milestone[] = milestoneRows.map((row) => {
    const monthIndex = num(row.month_index);
    const mine = taskRows.filter((t) => str(t.milestone_id) === str(row.id));

    const tasks: RoadmapTask[] = mine.map((t) => {
      const stored = str(t.status, "todo");
      const isDone = stored === "done";
      if (isDone) tasksDone++;

      const status: TaskStatus = isDone ? "done" : monthIndex > currentMonth ? "locked" : "todo";

      return {
        id: str(t.id),
        title: str(t.title),
        kind: str(t.kind, "action") as RoadmapTask["kind"],
        refType: t.ref_type === null ? null : str(t.ref_type),
        refSlug: t.ref_slug === null ? null : str(t.ref_slug),
        status,
      };
    });

    const allDone = tasks.length > 0 && tasks.every((t) => t.status === "done");
    const status: MilestoneStatus = allDone
      ? "done"
      : monthIndex === currentMonth
        ? "current"
        : monthIndex < currentMonth
          ? "current" // overdue months stay open rather than silently locking
          : "upcoming";

    return {
      id: str(row.id),
      monthIndex,
      title: str(row.title),
      focus: str(row.focus),
      status,
      tasks,
    };
  });

  const tasksTotal = taskRows.length;

  return {
    pathId,
    title: str(paths[0].title),
    summary: paths[0].summary === null ? null : str(paths[0].summary),
    milestones,
    currentMonth,
    tasksDone,
    tasksTotal,
    progressPct: tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100),
  };
}

/** Marks one roadmap task done or back to todo. Returns the new status. */
export async function toggleRoadmapTask(userId: string, taskId: string): Promise<TaskStatus | null> {
  const rows = await all<{ status: string }>(
    `SELECT t.status FROM roadmap_tasks t
       JOIN roadmap_milestones m ON m.id = t.milestone_id
       JOIN learning_paths p ON p.id = m.learning_path_id
      WHERE t.id = ? AND p.user_id = ?`,
    [taskId, userId],
  );
  if (rows.length === 0) return null;

  const next: TaskStatus = str(rows[0].status, "todo") === "done" ? "todo" : "done";
  await run("UPDATE roadmap_tasks SET status = ? WHERE id = ?", [next, taskId]);
  return next;
}

/** Marks the roadmap task matching a lesson ref as done, if one exists. */
export async function markRoadmapTaskForLesson(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<void> {
  await run(
    `UPDATE roadmap_tasks SET status = 'done'
      WHERE status <> 'done'
        AND ref_type = 'lesson'
        AND ref_slug = ?
        AND milestone_id IN (
          SELECT m.id FROM roadmap_milestones m
            JOIN learning_paths p ON p.id = m.learning_path_id
           WHERE p.user_id = ?
        )`,
    [`${courseSlug}/${lessonSlug}`, userId],
  );
}

/** The milestone the user is in right now, with its open tasks. */
export async function currentMilestoneTasks(
  userId: string,
  startDate: string,
): Promise<{ milestoneTitle: string; monthIndex: number; tasks: RoadmapTask[] } | null> {
  const view = await readRoadmap(userId, startDate);
  if (!view) return null;

  // Prefer the earliest month that still has open work, so a user who fell
  // behind gets finishable tasks instead of a month they skipped.
  const candidates = view.milestones
    .filter((m) => m.monthIndex <= view.currentMonth)
    .filter((m) => m.tasks.some((t) => t.status === "todo"));

  const milestone = candidates[0] ?? view.milestones[view.currentMonth - 1] ?? view.milestones[0];
  if (!milestone) return null;

  return {
    milestoneTitle: milestone.title,
    monthIndex: milestone.monthIndex,
    tasks: milestone.tasks.filter((t) => t.status === "todo"),
  };
}
