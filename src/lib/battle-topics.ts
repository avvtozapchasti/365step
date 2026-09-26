/**
 * Battle topic definitions — pure data, no database dependency.
 *
 * Split out from `battles.ts` so client components (the battle challenge form)
 * can import `BATTLE_TOPICS` as a value without pulling that server-only
 * module's dependency graph (better-sqlite3, postgres, node:fs) into the
 * browser bundle. Same pattern as `step-display.ts` next to `steps.ts`.
 */

export const BATTLE_TOPICS = [
  { value: "sat-reading", label: "SAT Reading", track: "SAT", courseSlug: "sat-reading" },
  { value: "sat-writing", label: "SAT Writing", track: "SAT", courseSlug: "sat-writing" },
  { value: "sat-math", label: "SAT Math", track: "SAT", courseSlug: "sat-math" },
  { value: "sat-mixed", label: "SAT Mixed", track: "SAT", courseSlug: null },
] as const;

export type BattleTopic = (typeof BATTLE_TOPICS)[number]["value"];

export function topicLabel(topic: string): string {
  return BATTLE_TOPICS.find((t) => t.value === topic)?.label ?? topic;
}
