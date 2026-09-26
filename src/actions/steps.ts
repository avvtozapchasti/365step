"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  completeStep,
  uncompleteStep,
  type ActionResult,
  type AwardedAchievement,
} from "@/lib/gamification";
import { regenerateTodaySteps } from "@/lib/steps";

export interface StepActionResult {
  ok: boolean
  error?: string;
  xpAwarded?: number;
  streakDays?: number;
  dailyPlanComplete?: boolean;
  levelledUp?: boolean;
  newAchievements?: AwardedAchievement[];
}

function shape(result: ActionResult | null): StepActionResult {
  if (!result) return { ok: false, error: "That step could not be found." };
  return {
    ok: true,
    xpAwarded: result.xpAwarded,
    streakDays: result.streakDays,
    dailyPlanComplete: result.dailyPlanComplete,
    levelledUp: result.levelledUp,
    newAchievements: result.newAchievements,
  };
}

/** Revalidates every surface a completed step changes. */
function revalidateAll(): void {
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/roadmap");
}

export async function completeStepAction(stepId: string): Promise<StepActionResult> {
  const user = await requireUser();
  const result = await completeStep(user.id, stepId);
  revalidateAll();
  return shape(result);
}

export async function uncompleteStepAction(stepId: string): Promise<StepActionResult> {
  const user = await requireUser();
  const undone = await uncompleteStep(user.id, stepId);
  revalidateAll();
  return undone ? { ok: true } : { ok: false, error: "That step was not completed." };
}

/**
 * Rebuilds the remaining part of today's plan from current state. Completed
 * steps are kept, so this cannot be used to farm XP.
 */
export async function regenerateStepsAction(): Promise<StepActionResult> {
  const user = await requireUser();
  await regenerateTodaySteps(user.id);
  revalidateAll();
  return { ok: true };
}
