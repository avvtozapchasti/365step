import "server-only";

import { randomUUID } from "node:crypto";

import { one, run, transaction } from "./db";
import { addDays, nowIso, todayIso } from "./date";
import { checkAchievements } from "./gamification";
import { generateRoadmap } from "./roadmap";
import { ensureTodaySteps } from "./steps";
import type { GoalOption } from "./taxonomy";
import type { Role, SkillLevel } from "./types";

export interface OnboardingProfile {
  role: Role;
  grade: string;
  country: string | null;
  dailyMinutes: number;
  skillLevel: SkillLevel;
  interests: string[];
  secondary: string[];
  targetDate: string | null;
}

/** Writes profile + primary goal, then builds the roadmap and today's plan. */
export async function applyOnboarding(
  userId: string,
  goal: GoalOption,
  profile: OnboardingProfile,
): Promise<void> {
  const startDate = todayIso();
  const goalId = randomUUID();

  await transaction(async () => {
    const existingProfile = await one<{ user_id: string }>(
      "SELECT user_id FROM profiles WHERE user_id = ?",
      [userId],
    );

    const profileValues = [
      profile.role,
      profile.grade,
      profile.country,
      profile.dailyMinutes,
      profile.skillLevel,
      JSON.stringify(profile.interests),
      JSON.stringify(profile.secondary),
      nowIso(),
    ];

    if (existingProfile) {
      await run(
        `UPDATE profiles SET role = ?, grade = ?, country = ?, daily_minutes = ?,
             skill_level = ?, interests = ?, secondary = ?, onboarded_at = ?
           WHERE user_id = ?`,
        [...profileValues, userId],
      );
    } else {
      await run(
        `INSERT INTO profiles (role, grade, country, daily_minutes, skill_level,
             interests, secondary, onboarded_at, user_id, timezone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UTC')`,
        [...profileValues, userId],
      );
    }

    // Re-running onboarding replaces the previous plan rather than stacking a
    // second active goal on top of it.
    await run("UPDATE goals SET status = 'archived', is_primary = 0 WHERE user_id = ?", [userId]);

    await run(
      `INSERT INTO goals (id, user_id, slug, title, category, start_date, target_date,
           status, is_primary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
      [
        goalId,
        userId,
        goal.slug,
        goal.headline,
        goal.category,
        startDate,
        profile.targetDate ?? addDays(startDate, 364),
        nowIso(),
      ],
    );

    await run("DELETE FROM daily_steps WHERE user_id = ? AND step_date = ?", [userId, startDate]);
  });

  // The roadmap writes many rows of its own; keeping it outside the transaction
  // above avoids holding a write lock across the whole generation.
  await generateRoadmap(userId, goalId, goal.headline, profile.interests);

  await ensureTodaySteps(userId);
  await checkAchievements(userId);
}
