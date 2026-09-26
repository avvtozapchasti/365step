/**
 * Portfolio strength.
 *
 * A pure function, so both the server page and any client component can use it.
 * The weighting mirrors what someone reviewing a portfolio actually checks, in
 * the order they check it: does it exist, is any of it finished, is it
 * explained, and can I see the work.
 */

import type { Project } from "./types";

export interface PortfolioStrength {
  score: number;
  shipped: number;
  documented: number;
  linked: number;
  notes: string[];
}

export function portfolioStrength(projects: Project[]): PortfolioStrength {
  const shipped = projects.filter((p) => p.status === "shipped").length;
  const documented = projects.filter((p) => p.description.trim().length > 60).length;
  const linked = projects.filter((p) => p.githubUrl || p.demoUrl).length;

  const score = Math.min(
    100,
    Math.round(
      Math.min(projects.length, 3) * 12 + // 36 — having projects at all
        Math.min(shipped, 2) * 18 + //        36 — finishing them
        Math.min(documented, 3) * 6 + //      18 — explaining them
        Math.min(linked, 3) * 5, //           15 — being able to show them
    ),
  );

  const notes: string[] = [];

  if (projects.length === 0) {
    notes.push("Add your first project — writing down the idea counts as starting.");
  } else if (projects.length < 3) {
    const missing = 3 - projects.length;
    notes.push(
      `${missing} more project${missing === 1 ? "" : "s"} would round this out. Three is where a portfolio starts to look deliberate.`,
    );
  }

  if (projects.length > 0 && shipped === 0) {
    notes.push("Nothing marked shipped yet. One finished project outweighs three started ones.");
  }

  if (projects.length > documented) {
    notes.push(
      "Some projects have no real description. State the problem and who has it — that is what a reader remembers.",
    );
  }

  if (projects.length > linked) {
    notes.push("Add a GitHub or demo link where you can, so a reader can see the work itself.");
  }

  if (notes.length === 0) {
    notes.push("This portfolio does its job: finished, explained, and possible to look at.");
  }

  return { score, shipped, documented, linked, notes };
}
