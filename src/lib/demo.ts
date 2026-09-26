import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { one, run } from "./db";
import { nowIso } from "./date";
import { applyOnboarding, type OnboardingProfile } from "./onboarding";
import { hashPassword } from "./password";
import { goalBySlug } from "./taxonomy";

export type DemoPersona = "school" | "university" | "graduate";

interface DemoScenario {
  email: string;
  name: string;
  goalSlug: string;
  profile: OnboardingProfile;
}

const SCENARIOS: Record<DemoPersona, DemoScenario> = {
  // Same account the CLI seed builds with 37 days of history, when present.
  school: {
    email: "alex@365step.app",
    name: "Alex",
    goalSlug: "get-into-university",
    profile: {
      role: "school",
      grade: "10",
      country: "Kazakhstan",
      dailyMinutes: 20,
      skillLevel: "beginner",
      interests: ["engineering", "physics", "math"],
      secondary: ["research", "portfolio", "scholarship"],
      targetDate: null,
    },
  },
  university: {
    email: "dana@365step.app",
    name: "Dana",
    goalSlug: "find-internship",
    profile: {
      role: "university",
      grade: "year-2",
      country: "Kazakhstan",
      dailyMinutes: 30,
      skillLevel: "intermediate",
      interests: ["cs", "data-science", "math"],
      secondary: ["internship", "portfolio", "network"],
      targetDate: null,
    },
  },
  graduate: {
    email: "timur@365step.app",
    name: "Timur",
    goalSlug: "career-skills",
    profile: {
      role: "graduate",
      grade: "1-2-years",
      country: "Kazakhstan",
      dailyMinutes: 20,
      skillLevel: "intermediate",
      interests: ["business", "data-science", "economics"],
      secondary: ["english", "network", "public-speaking"],
      targetDate: null,
    },
  },
};

export function isDemoPersona(value: unknown): value is DemoPersona {
  return typeof value === "string" && Object.hasOwn(SCENARIOS, value);
}

/** Returns the demo user's id, creating and onboarding the account on first use. */
export async function ensureDemoUser(persona: unknown): Promise<string | null> {
  if (!isDemoPersona(persona)) return null;
  const scenario = SCENARIOS[persona];

  const existing = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", [
    scenario.email,
  ]);
  if (existing) return String(existing.id);

  const goal = goalBySlug(scenario.goalSlug);
  if (!goal) return null;

  const userId = randomUUID();
  try {
    // Nobody signs in with this password; demo accounts open via the button only.
    await run(
      "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        scenario.email,
        await hashPassword(randomBytes(24).toString("hex")),
        scenario.name,
        nowIso(),
      ],
    );
  } catch (error) {
    // Two first clicks at once: the other request created it; use that row.
    const raced = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", [
      scenario.email,
    ]);
    if (raced) return String(raced.id);
    throw error;
  }

  await applyOnboarding(userId, goal, scenario.profile);
  return userId;
}
