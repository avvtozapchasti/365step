"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { checkAchievements, type AwardedAchievement } from "@/lib/gamification";
import { toggleRoadmapTask } from "@/lib/roadmap";

export interface TaskToggleResult {
  ok: boolean;
  status?: "done" | "todo" | "locked";
  newAchievements?: AwardedAchievement[];
  error?: string;
}

export async function toggleRoadmapTaskAction(taskId: string): Promise<TaskToggleResult> {
  const user = await requireUser();

  const status = await toggleRoadmapTask(user.id, taskId);
  if (!status) return { ok: false, error: "That task could not be found." };

  revalidatePath("/roadmap");
  revalidatePath("/dashboard");

  return {
    ok: true,
    status,
    newAchievements: status === "done" ? await checkAchievements(user.id) : [],
  };
}
