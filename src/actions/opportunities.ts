"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { startApplication, toggleSavedOpportunity } from "@/lib/gamification";
import type { AwardedAchievement } from "@/lib/gamification";

export interface SaveResult {
  ok: boolean;
  saved?: boolean;
  xpAwarded?: number;
  newAchievements?: AwardedAchievement[];
  error?: string;
}

function revalidateAll(): void {
  revalidatePath("/dashboard");
  revalidatePath("/opportunities");
  revalidatePath("/progress");
}

/**
 * Saves or unsaves an opportunity.
 *
 * Saving is not a bookmark in isolation: it also puts the deadline on the
 * dashboard countdown and closes the matching daily step, which is what makes
 * the whole discover-then-act loop hold together.
 */
export async function toggleSaveAction(opportunityId: string): Promise<SaveResult> {
  const user = await requireUser();
  const result = await toggleSavedOpportunity(user.id, opportunityId);

  if (result.notFound) {
    return { ok: false, error: "That opportunity could not be found." };
  }

  revalidateAll();

  return {
    ok: true,
    saved: result.saved,
    xpAwarded: result.xpAwarded,
    newAchievements: result.newAchievements,
  };
}

/** Begins tracking an application for an opportunity. */
export async function startApplicationAction(opportunityId: string): Promise<SaveResult> {
  const user = await requireUser();
  const result = await startApplication(user.id, opportunityId);

  if (result.notFound) {
    return { ok: false, error: "That opportunity could not be found." };
  }

  revalidateAll();

  return {
    ok: true,
    saved: true,
    newAchievements: result.newAchievements,
    error: result.created ? undefined : "You are already tracking this application.",
  };
}
