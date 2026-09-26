"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { str } from "@/lib/db";
import { deleteProject, saveProject } from "@/lib/projects";
import type { AwardedAchievement } from "@/lib/gamification";

export interface ProjectFormResult {
  ok: boolean;
  error?: string;
  xpAwarded?: number;
  newAchievements?: AwardedAchievement[];
}

function revalidateAll(): void {
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function saveProjectAction(formData: FormData): Promise<ProjectFormResult> {
  const user = await requireUser();

  const result = await saveProject(user.id, {
    id: str(formData.get("id"), "").trim() || undefined,
    name: str(formData.get("name"), ""),
    description: str(formData.get("description"), ""),
    category: str(formData.get("category"), "other"),
    status: str(formData.get("status"), "idea"),
    skills: str(formData.get("skills"), ""),
    githubUrl: str(formData.get("githubUrl"), ""),
    demoUrl: str(formData.get("demoUrl"), ""),
    link: str(formData.get("link"), ""),
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidateAll();
  return {
    ok: true,
    xpAwarded: result.xpAwarded,
    newAchievements: result.newAchievements,
  };
}

export async function deleteProjectAction(id: string): Promise<ProjectFormResult> {
  const user = await requireUser();

  const result = await deleteProject(user.id, id);
  if (!result.ok) return { ok: false, error: result.error };

  revalidateAll();
  return { ok: true };
}
