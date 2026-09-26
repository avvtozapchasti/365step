"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { todayIso } from "@/lib/date";
import { applyOnboarding } from "@/lib/onboarding";
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

  await applyOnboarding(user.id, goal, {
    role: answers.role,
    grade: answers.grade,
    country: answers.country ?? null,
    dailyMinutes: answers.dailyMinutes,
    skillLevel: answers.skillLevel,
    interests,
    secondary: answers.secondary.slice(0, 8),
    targetDate,
  });

  redirect("/dashboard?welcome=1");
}
