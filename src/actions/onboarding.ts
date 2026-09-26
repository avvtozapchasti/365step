"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { one, run, transaction } from "@/lib/db";
import { addDays, nowIso, todayIso } from "@/lib/date";
import { checkAchievements } from "@/lib/gamification";
import { generateRoadmap } from "@/lib/roadmap";
import { ensureTodaySteps } from "@/lib/steps";
import { GOALS, ROLES, SUBJECTS } from "@/lib/taxonomy";
import type { Role, SkillLevel } from "@/lib/types";

export interface OnboardingAnswers {
  role: Role;
  grade: string;
  goalSlug: string;
  interests: string[];
  dailyMinutes: number;
  skillLevel: SkillLevel;
  targetDate: string | null;
  secondary: string[];
  country?: string;
}

export interface OnboardingResult {
  error?: string;
}

const VALID_ROLES = new Set(ROLES.map((r) => r.value));
const VALID_SUBJECTS = new Set(SUBJECTS.map((s) => s.slug));
const VALID_MINUTES = new Set([10, 20, 30, 45]);
const VALID_LEVELS = new Set<SkillLevel>(["beginner", "intermediate", "advanced"]);

/**
 * Completes onboarding.
 *
 * Everything the user answered becomes real state in one transaction: a profile,
 * a primary goal, and a twelve-month roadmap generated from the goal template
 * with their interests filled in. Today's plan is then built from that state, so
 * the dashboard they land on is already populated.
 */
export async function completeOnboardingAction(
  answers: OnboardingAnswers,
): Promise<OnboardingResult> {
  const user = await requireUser();

  // ---- validation --------------------------------------------------------
  if (!VALID_ROLES.has(answers.role)) return { error: "Choose who you are." };

  const goal = GOALS.find((g) => g.slug === answers.goalSlug);
  if (!goal) return { error: "Choose a main goal." };
  if (!goal.roles.includes(answers.role)) {
    return { error: "That goal does not match the profile you chose." };
  }

  const roleOption = ROLES.find((r) => r.value === answers.role);
  if (!roleOption?.grades.some((g) => g.value === answers.grade)) {
    return { error: "Choose where you are right now." };
  }

  const interests = answers.interests.filter((i) => VALID_SUBJECTS.has(i)).slice(0, 6);
  if (interests.length === 0) return { error: "Pick at least one area that interests you." };

  if (!VALID_MINUTES.has(answers.dailyMinutes)) {
    return { error: "Choose how much time you have each day." };
  }
  if (!VALID_LEVELS.has(answers.skillLevel)) {
    return { error: "Choose your current level." };
  }

  const startDate = todayIso();

  // A target date in the past would break every countdown that reads it.
  let targetDate = answers.targetDate;
  if (targetDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || targetDate <= startDate) targetDate = null;
  }

  const secondary = answers.secondary.slice(0, 8);

  // ---- persist -----------------------------------------------------------
  const goalId = randomUUID();

  await transaction(async () => {
    const existingProfile = await one<{ user_id: string }>(
      "SELECT user_id FROM profiles WHERE user_id = ?",
      [user.id],
    );

    const profileValues = [
      answers.role,
      answers.grade,
      answers.country ?? null,
      answers.dailyMinutes,
      answers.skillLevel,
      JSON.stringify(interests),
      JSON.stringify(secondary),
      nowIso(),
    ];

    if (existingProfile) {
      await run(
        `UPDATE profiles SET role = ?, grade = ?, country = ?, daily_minutes = ?,
             skill_level = ?, interests = ?, secondary = ?, onboarded_at = ?
           WHERE user_id = ?`,
        [...profileValues, user.id],
      );
    } else {
      await run(
        `INSERT INTO profiles (role, grade, country, daily_minutes, skill_level,
             interests, secondary, onboarded_at, user_id, timezone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UTC')`,
        [...profileValues, user.id],
      );
    }

    // Re-running onboarding replaces the previous plan rather than stacking a
    // second active goal on top of it.
    await run("UPDATE goals SET status = 'archived', is_primary = 0 WHERE user_id = ?", [user.id]);

    await run(
      `INSERT INTO goals (id, user_id, slug, title, category, start_date, target_date,
           status, is_primary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
      [
        goalId,
        user.id,
        goal.slug,
        goal.headline,
        goal.category,
        startDate,
        targetDate ?? addDays(startDate, 364),
        nowIso(),
      ],
    );

    await run("DELETE FROM daily_steps WHERE user_id = ? AND step_date = ?", [user.id, startDate]);
  });

  // The roadmap writes many rows of its own; keeping it outside the transaction
  // above avoids holding a write lock across the whole generation.
  await generateRoadmap(user.id, goalId, goal.headline, interests);

  await ensureTodaySteps(user.id);
  await checkAchievements(user.id);

  redirect("/dashboard?welcome=1");
}
