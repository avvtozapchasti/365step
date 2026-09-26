"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { one, str } from "@/lib/db";
import { completeLesson, type AwardedAchievement } from "@/lib/gamification";

export interface LessonSubmitResult {
  ok: boolean;
  error?: string;
  xpAwarded?: number;
  streakDays?: number;
  levelledUp?: boolean;
  dailyPlanComplete?: boolean;
  perfect?: boolean;
  /** The authoritative score, recomputed server-side. */
  correct?: number;
  total?: number;
  newAchievements?: AwardedAchievement[];
  nextLessonSlug?: string | null;
  nextLessonTitle?: string | null;
}

/**
 * Records a finished lesson.
 *
 * The score is recomputed here from the submitted answers against the stored
 * correct indices — the client's own tally is never trusted, so a tampered
 * request cannot award a perfect-quiz bonus.
 */
export async function submitLessonAction(
  courseSlug: string,
  lessonSlug: string,
  answers: number[],
  secondsSpent: number,
): Promise<LessonSubmitResult> {
  const user = await requireUser();

  const lesson = await one<Record<string, unknown>>(
    `SELECT l.id, l.est_minutes FROM lessons l
       JOIN courses c ON c.id = l.course_id
      WHERE c.slug = ? AND l.slug = ?`,
    [courseSlug, lessonSlug],
  );
  if (!lesson) return { ok: false, error: "That lesson could not be found." };

  const lessonId = str(lesson.id);

  const { all } = await import("@/lib/db");
  const questions = await all<{ correct_index: number }>(
    "SELECT correct_index FROM questions WHERE lesson_id = ? ORDER BY order_index",
    [lessonId],
  );

  const total = questions.length;
  const correct = questions.reduce(
    (count, question, index) => count + (answers[index] === Number(question.correct_index) ? 1 : 0),
    0,
  );

  // Clamp the reported time: a tab left open overnight should not register as
  // eleven hours of study on the progress page.
  const minutes = Math.max(1, Math.min(90, Math.round(secondsSpent / 60)));

  const result = await completeLesson(
    user.id,
    lessonId,
    courseSlug,
    lessonSlug,
    correct,
    total,
    minutes,
  );

  const next = await one<{ slug: string; title: string }>(
    `SELECT l.slug, l.title FROM lessons l
       JOIN courses c ON c.id = l.course_id
      WHERE c.slug = ?
        AND l.order_index > (SELECT order_index FROM lessons WHERE id = ?)
      ORDER BY l.order_index`,
    [courseSlug, lessonId],
  );

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/progress");
  revalidatePath("/roadmap");

  return {
    ok: true,
    xpAwarded: result.xpAwarded,
    streakDays: result.streakDays,
    levelledUp: result.levelledUp,
    dailyPlanComplete: result.dailyPlanComplete,
    perfect: result.perfect,
    correct,
    total,
    newAchievements: result.newAchievements,
    nextLessonSlug: next ? str(next.slug) : null,
    nextLessonTitle: next ? str(next.title) : null,
  };
}
