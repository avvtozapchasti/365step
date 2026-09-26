/**
 * Pure presentation helpers for daily steps.
 *
 * Separate from `steps.ts` because that module reaches for node:crypto and the
 * database, which cannot cross into a client component. These are safe on both
 * sides of the boundary.
 */

import type { DailyStep, StepKind } from "./types";

/** Where a step's primary button should take the user. */
export function stepHref(step: DailyStep): string | null {
  if (!step.refType || !step.refSlug) return null;
  if (step.refType === "lesson") return `/learn/${step.refSlug}`;
  if (step.refType === "practice") return `/learn/${step.refSlug}?mode=practice`;
  if (step.refType === "opportunity") return `/opportunities/${step.refSlug}`;
  if (step.refType === "roadmap_task") return "/roadmap";
  return null;
}

/** The label on that button. */
export function stepAction(step: DailyStep): string {
  switch (step.kind) {
    case "learn":
      return "Start";
    case "practice":
      return "Practice";
    case "build":
      return "Open";
    case "opportunity":
      return "View";
    default:
      return "Done";
  }
}

export function stepKindLabel(kind: StepKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/** Zero-padded step number, '01' — the visual signature of the daily plan. */
export function stepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export const STEP_KIND_COLOUR: Record<StepKind, string> = {
  learn: "var(--color-kind-learn)",
  practice: "var(--color-kind-practice)",
  build: "var(--color-kind-build)",
  opportunity: "var(--color-kind-opportunity)",
  reflect: "var(--color-kind-reflect)",
};
