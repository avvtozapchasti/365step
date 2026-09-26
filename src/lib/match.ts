/**
 * Opportunity personalisation.
 *
 * The product claim is that the feed depends on who you are, so this scores
 * every opportunity against the actual onboarding answers and — just as
 * important — returns the reasons in plain language. A ranking nobody can
 * interrogate is indistinguishable from a random order, so every card carries
 * its own "why this matches you".
 */

import { daysUntil, urgency } from "./date";
import { subjectLabel } from "./taxonomy";
import type { MatchedOpportunity, Opportunity, Profile } from "./types";

export interface MatchContext {
  profile: Profile;
  goalSlug: string | null;
  goalTitle: string | null;
  savedIds: Set<string>;
}

const WEIGHTS = {
  audience: 30,
  subjectFirst: 22, // first matching interest
  subjectExtra: 8, // each further matching interest
  goal: 20,
  gradeInRange: 12,
  secondary: 6,
  free: 4,
  prestige: 5, // × prestige (1–3)
  remoteAccessible: 3,
  deadlineSoon: 6,
  deadlineComfortable: 2,
};

/** Grades are stored as '10' for school and 'year-2' for university. */
function numericGrade(grade: string | null): number | null {
  if (!grade) return null;
  const direct = Number(grade);
  return Number.isFinite(direct) ? direct : null;
}

export function scoreOpportunity(
  opportunity: Opportunity,
  context: MatchContext,
): MatchedOpportunity {
  const { profile, goalSlug, goalTitle, savedIds } = context;
  const reasons: string[] = [];
  let score = 0;

  // ---- audience -----------------------------------------------------------
  const audienceMatch = opportunity.audiences.includes(profile.role);
  if (audienceMatch) score += WEIGHTS.audience;

  // ---- subjects -----------------------------------------------------------
  const sharedSubjects = profile.interests.filter((i) => opportunity.subjects.includes(i));
  if (sharedSubjects.length > 0) {
    score += WEIGHTS.subjectFirst + (sharedSubjects.length - 1) * WEIGHTS.subjectExtra;

    const named = sharedSubjects.slice(0, 2).map(subjectLabel);
    reasons.push(
      named.length === 1
        ? `Matches your interest in ${named[0]}`
        : `Matches your interests in ${named[0]} and ${named[1]}`,
    );
  }

  // ---- the primary goal ---------------------------------------------------
  if (goalSlug && opportunity.goalSlugs.includes(goalSlug) && goalTitle) {
    score += WEIGHTS.goal;
    reasons.push(`Advances your goal: ${goalTitle.toLowerCase()}`);
  }

  // ---- grade eligibility --------------------------------------------------
  const grade = numericGrade(profile.grade);
  if (grade !== null && (opportunity.minGrade !== null || opportunity.maxGrade !== null)) {
    const aboveMin = opportunity.minGrade === null || grade >= opportunity.minGrade;
    const belowMax = opportunity.maxGrade === null || grade <= opportunity.maxGrade;

    if (aboveMin && belowMax) {
      score += WEIGHTS.gradeInRange;
      reasons.push(`Open to Grade ${grade} students`);
    } else {
      // Not eligible yet is very different from not relevant — keep it visible
      // but well down the ranking, and say so.
      score -= 25;
      reasons.push(
        grade < (opportunity.minGrade ?? 0)
          ? `Opens to you from Grade ${opportunity.minGrade}`
          : "Grade range has passed — check the official criteria",
      );
    }
  }

  // ---- stacked secondary goals -------------------------------------------
  const secondaryHits = profile.secondary.filter((s) =>
    opportunity.tags.some((t) => t.toLowerCase().includes(s)) ||
    opportunity.type.includes(s) ||
    opportunity.goalSlugs.some((g) => g.includes(s)),
  );
  if (secondaryHits.length > 0) score += WEIGHTS.secondary;

  // ---- practical access ---------------------------------------------------
  if (/free|fully funded|stipend|paid/i.test(opportunity.cost)) {
    score += WEIGHTS.free;
    reasons.push(opportunity.cost.match(/free/i) ? "No cost to take part" : "Funded or paid");
  }
  if (opportunity.format === "remote") {
    score += WEIGHTS.remoteAccessible;
    reasons.push("Remote — no travel needed");
  }

  score += WEIGHTS.prestige * opportunity.prestige;

  // ---- deadline pressure --------------------------------------------------
  const daysLeft = daysUntil(opportunity.deadline);
  const band = urgency(daysLeft);
  if (band === "critical" || band === "soon") score += WEIGHTS.deadlineSoon;
  else if (band === "comfortable" && daysLeft !== null) score += WEIGHTS.deadlineComfortable;
  if (band === "closed") score -= 40;

  // A non-matching audience should not out-rank a matching one on side signals.
  if (!audienceMatch) score = Math.round(score * 0.35);

  if (reasons.length === 0) {
    reasons.push(
      audienceMatch
        ? `Open to ${roleNoun(profile.role)}`
        : "Outside your current profile, shown for reference",
    );
  }

  return {
    ...opportunity,
    score,
    reasons: reasons.slice(0, 3),
    matchLabel: labelFor(score),
    saved: savedIds.has(opportunity.id),
    daysLeft,
  };
}

function roleNoun(role: Profile["role"]): string {
  if (role === "school") return "school students";
  if (role === "university") return "university students";
  return "graduates";
}

function labelFor(score: number): string {
  if (score >= 85) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 35) return "Worth a look";
  return "Related";
}

export interface RankOptions {
  type?: string | null;
  search?: string | null;
  savedOnly?: boolean;
  closingWithinDays?: number | null;
  limit?: number;
  /** Drop anything below this score. Used by the dashboard's short list. */
  minScore?: number;
}

export function rankOpportunities(
  opportunities: Opportunity[],
  context: MatchContext,
  options: RankOptions = {},
): MatchedOpportunity[] {
  const query = options.search?.trim().toLowerCase() ?? "";

  let matched = opportunities.map((o) => scoreOpportunity(o, context));

  if (options.type) matched = matched.filter((o) => o.type === options.type);
  if (options.savedOnly) matched = matched.filter((o) => o.saved);

  if (options.closingWithinDays != null) {
    const within = options.closingWithinDays;
    matched = matched.filter((o) => o.daysLeft !== null && o.daysLeft >= 0 && o.daysLeft <= within);
  }

  if (query) {
    matched = matched.filter((o) =>
      [o.title, o.organization, o.summary, o.country, ...o.tags, ...o.subjects]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (options.minScore != null) {
    const floor = options.minScore;
    matched = matched.filter((o) => o.score >= floor);
  }

  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Equal fit: whatever closes first is the more useful thing to show.
    if (a.daysLeft === null && b.daysLeft === null) return a.title.localeCompare(b.title);
    if (a.daysLeft === null) return 1;
    if (b.daysLeft === null) return -1;
    return a.daysLeft - b.daysLeft;
  });

  return options.limit ? matched.slice(0, options.limit) : matched;
}
