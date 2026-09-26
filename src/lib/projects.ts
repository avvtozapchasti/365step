/**
 * Portfolio project writes.
 *
 * Lives here rather than in the server action so it follows the same rule as
 * every other mutation in the app: the action authenticates and revalidates, the
 * domain logic sits in `lib/` where it can be exercised directly.
 */

import { randomUUID } from "node:crypto";

import { one, run, str } from "./db";
import { nowIso, todayIso } from "./date";
import { awardXp, checkAchievements, touchStreak } from "./gamification";
import type { AwardedAchievement } from "./gamification";
import { PROJECT_CATEGORIES } from "./taxonomy";
import type { ProjectStatus } from "./types";
import { XP_AWARDS } from "./xp";

export interface ProjectInput {
  id?: string;
  name: string;
  description: string;
  category: string;
  status: string;
  skills: string;
  githubUrl: string;
  demoUrl: string;
  link: string;
}

export interface ProjectWriteResult {
  ok: boolean;
  error?: string;
  projectId?: string;
  xpAwarded?: number;
  newAchievements?: AwardedAchievement[];
}

const VALID_STATUS = new Set<ProjectStatus>(["idea", "in_progress", "shipped", "paused"]);

/**
 * Accepts only http(s) URLs.
 *
 * These values are rendered as `href`s, so anything else — `javascript:`,
 * `data:` — is dropped rather than stored. Returning null instead of throwing
 * keeps a typo in an optional field from failing the whole save.
 */
export function safeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function saveProject(
  userId: string,
  input: ProjectInput,
): Promise<ProjectWriteResult> {
  const name = input.name.trim();
  const description = input.description.trim();

  if (name.length < 2) return { ok: false, error: "Give your project a name." };
  if (name.length > 120) return { ok: false, error: "That name is too long." };
  if (description.length > 2000) return { ok: false, error: "That description is too long." };

  const status: ProjectStatus = VALID_STATUS.has(input.status as ProjectStatus)
    ? (input.status as ProjectStatus)
    : "idea";
  const category = PROJECT_CATEGORIES.includes(input.category) ? input.category : "other";
  const skills = parseSkills(input.skills);
  const githubUrl = safeUrl(input.githubUrl);
  const demoUrl = safeUrl(input.demoUrl);
  const link = safeUrl(input.link);

  // ---- update ------------------------------------------------------------
  if (input.id) {
    const existing = await one<{ id: string; status: string }>(
      "SELECT id, status FROM projects WHERE id = ? AND user_id = ?",
      [input.id, userId],
    );
    if (!existing) return { ok: false, error: "That project could not be found." };

    await run(
      `UPDATE projects SET name = ?, description = ?, category = ?, skills = ?,
           status = ?, link = ?, github_url = ?, demo_url = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
      [
        name,
        description,
        category,
        JSON.stringify(skills),
        status,
        link,
        githubUrl,
        demoUrl,
        nowIso(),
        input.id,
        userId,
      ],
    );

    // Shipping is the milestone worth rewarding, and only the first time.
    let xpAwarded = 0;
    if (status === "shipped" && str(existing.status) !== "shipped") {
      xpAwarded = XP_AWARDS.projectShipped;
      await awardXp(userId, xpAwarded, `Shipped: ${name}`, "project", input.id);
      await touchStreak(userId);
    }

    return {
      ok: true,
      projectId: input.id,
      xpAwarded,
      newAchievements: await checkAchievements(userId),
    };
  }

  // ---- create ------------------------------------------------------------
  const id = randomUUID();
  await run(
    `INSERT INTO projects (id, user_id, name, description, category, skills, status,
         link, github_url, demo_url, started_on, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      name,
      description,
      category,
      JSON.stringify(skills),
      status,
      link,
      githubUrl,
      demoUrl,
      todayIso(),
      nowIso(),
      nowIso(),
    ],
  );

  let xpAwarded = XP_AWARDS.projectAdded;
  await awardXp(userId, xpAwarded, `Added project: ${name}`, "project", id);

  if (status === "shipped") {
    xpAwarded += XP_AWARDS.projectShipped;
    await awardXp(userId, XP_AWARDS.projectShipped, `Shipped: ${name}`, "project", id);
  }

  await touchStreak(userId);

  return {
    ok: true,
    projectId: id,
    xpAwarded,
    newAchievements: await checkAchievements(userId),
  };
}

export async function deleteProject(userId: string, id: string): Promise<ProjectWriteResult> {
  const existing = await one<{ id: string }>(
    "SELECT id FROM projects WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  if (!existing) return { ok: false, error: "That project could not be found." };

  await run("DELETE FROM projects WHERE id = ? AND user_id = ?", [id, userId]);

  // XP already earned stays: it records work that was genuinely done, and
  // clawing it back would make the progress page misreport history.
  return { ok: true };
}
