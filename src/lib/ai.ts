/**
 * AI Growth Assistant.
 *
 * 365step is not a chatbot. The assistant is a thin layer that reads the user's
 * real state — progress, weak areas, deadlines, saved opportunities, activity —
 * and answers one question well: "what should I do today?"
 *
 * Two stages, deliberately in this order:
 *
 *   1. A deterministic analysis over the database. This always runs, needs no
 *      API key, and is what produces the concrete next steps. It is the product.
 *   2. Optionally, if ANTHROPIC_API_KEY is set, Claude turns those same facts
 *      into one short piece of coaching prose. If the call fails, is refused, or
 *      the key is absent, stage 1 stands on its own — so the feature degrades to
 *      "slightly less warmly worded", never to "broken".
 *
 * The model never invents facts: it only ever sees the computed summary, and its
 * output is presentational. Every number on the screen comes from stage 1.
 */

import { all, num, str } from "./db";
import { daysUntil, todayIso } from "./date";
import { rankOpportunities } from "./match";
import {
  getDeadlines,
  getLessonProgressMap,
  getOpportunities,
  getPrimaryGoal,
  getProfile,
  getSavedOpportunityIds,
  getSnapshot,
  getSteps,
  getTrackProgress,
} from "./queries";
import { currentMilestoneTasks } from "./roadmap";
import { subjectLabel } from "./taxonomy";

export type InsightTone = "positive" | "warning" | "neutral" | "urgent";

export interface Insight {
  tone: InsightTone;
  icon: string;
  text: string;
  /** Where the user goes to act on it. */
  href?: string;
  linkLabel?: string;
}

export interface Suggestion {
  title: string;
  detail: string;
  minutes: number;
  href: string;
  action: string;
}

export interface GrowthAnalysis {
  headline: string;
  insights: Insight[];
  suggestions: Suggestion[];
  /** 'claude' when the headline was written by the model, 'rules' otherwise. */
  narration: "claude" | "rules";
}

// ------------------------------------------------------------------- facts ---

interface Facts {
  name: string;
  goalTitle: string | null;
  dayIndex: number;
  streak: number;
  totalXp: number;
  level: number;
  dailyMinutes: number;
  stepsToday: number;
  stepsDoneToday: number;
  minutesLeftToday: number;
  lessonsThisWeek: number;
  activeDaysThisWeek: number;
  /** Track name -> lessons completed, all time. */
  trackTotals: { track: string; completed: number; total: number }[];
  /** Tracks relevant to the goal that have had no activity in 7 days. */
  neglectedTracks: string[];
  weakLessons: { title: string; courseSlug: string; lessonSlug: string; pct: number }[];
  deadlinesSoon: { title: string; daysLeft: number; slug: string | null }[];
  savedCount: number;
  projectCount: number;
  unsavedStrongMatches: { title: string; slug: string; daysLeft: number | null; reason: string }[];
  openRoadmapTask: { title: string; monthIndex: number } | null;
}

async function gatherFacts(userId: string, name: string): Promise<Facts | null> {
  const [profile, goal] = await Promise.all([getProfile(userId), getPrimaryGoal(userId)]);
  if (!profile || !goal) return null;

  const today = todayIso();

  const [snapshot, steps, trackTotals, deadlines, savedIds, opportunities, progressMap, milestone] =
    await Promise.all([
      getSnapshot(userId, goal),
      getSteps(userId, today),
      getTrackProgress(userId),
      getDeadlines(userId),
      getSavedOpportunityIds(userId),
      getOpportunities(),
      getLessonProgressMap(userId),
      currentMilestoneTasks(userId, goal.startDate),
    ]);

  // ---- lessons completed in the last seven days, grouped by track ----------
  const weekAgo = snapshot.weeklyActivity[0]?.date ?? today;
  const recent = await all<Record<string, unknown>>(
    `SELECT c.track AS track, COUNT(*) AS n
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN courses c ON c.id = l.course_id
      WHERE lp.user_id = ? AND lp.status = 'completed' AND lp.completed_at >= ?
      GROUP BY c.track`,
    [userId, weekAgo],
  );
  const recentByTrack = new Map(recent.map((r) => [str(r.track), num(r.n)]));
  const lessonsThisWeek = [...recentByTrack.values()].reduce((a, b) => a + b, 0);

  // A track counts as neglected when it serves the goal, has lessons left, and
  // has seen nothing this week. This is what produces the "you have done four
  // Math lessons but no Reading" style observation.
  const goalTracks = await all<Record<string, unknown>>(
    `SELECT DISTINCT track FROM courses WHERE goal_slugs LIKE ?`,
    [`%"${goal.slug}"%`],
  );
  const neglectedTracks = goalTracks
    .map((r) => str(r.track))
    .filter((track) => {
      if ((recentByTrack.get(track) ?? 0) > 0) return false;
      const totals = trackTotals.find((t) => t.track === track);
      return totals !== undefined && totals.completed < totals.total;
    })
    // A track the user started and then dropped is a far more useful thing to
    // point at than one they have never opened — "you stopped" beats "you have
    // not begun", which reads as nagging about the entire catalogue.
    .sort((a, b) => {
      const started = (track: string) =>
        trackTotals.find((t) => t.track === track)?.completed ?? 0;
      return started(b) - started(a);
    });

  // ---- lessons answered poorly, worth revisiting --------------------------
  const lessonRows = await all<Record<string, unknown>>(
    `SELECT l.title, l.slug AS lesson_slug, c.slug AS course_slug, lp.correct, lp.total
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN courses c ON c.id = l.course_id
      WHERE lp.user_id = ? AND lp.status = 'completed' AND lp.total > 0`,
    [userId],
  );
  const weakLessons = lessonRows
    .map((r) => ({
      title: str(r.title),
      courseSlug: str(r.course_slug),
      lessonSlug: str(r.lesson_slug),
      pct: Math.round((num(r.correct) / Math.max(1, num(r.total))) * 100),
    }))
    .filter((l) => l.pct < 70)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  void progressMap; // reserved for future per-lesson recency weighting

  // ---- strong matches the user has not saved yet --------------------------
  const unsaved = rankOpportunities(
    opportunities.filter((o) => !savedIds.has(o.id)),
    { profile, goalSlug: goal.slug, goalTitle: goal.title, savedIds },
    { limit: 3, minScore: 70 },
  ).map((o) => ({
    title: o.title,
    slug: o.slug,
    daysLeft: o.daysLeft,
    reason: o.reasons[0] ?? o.matchLabel,
  }));

  const stepsDoneToday = steps.filter((s) => s.status === "done").length;
  const minutesLeftToday = steps
    .filter((s) => s.status === "todo")
    .reduce((sum, s) => sum + s.estMinutes, 0);

  const openTask = milestone?.tasks[0] ?? null;

  return {
    name,
    goalTitle: goal.title,
    dayIndex: snapshot.dayIndex,
    streak: snapshot.streak.currentDays,
    totalXp: snapshot.totalXp,
    level: snapshot.level,
    dailyMinutes: profile.dailyMinutes,
    stepsToday: steps.length,
    stepsDoneToday,
    minutesLeftToday,
    lessonsThisWeek,
    activeDaysThisWeek: snapshot.weeklyActivity.filter((d) => d.steps > 0).length,
    trackTotals,
    neglectedTracks,
    weakLessons,
    deadlinesSoon: deadlines
      .filter((d) => d.daysLeft >= 0 && d.daysLeft <= 21)
      .slice(0, 4)
      .map((d) => ({ title: d.title, daysLeft: d.daysLeft, slug: d.opportunitySlug })),
    savedCount: snapshot.savedCount,
    projectCount: snapshot.projectCount,
    unsavedStrongMatches: unsaved,
    openRoadmapTask: openTask
      ? { title: openTask.title, monthIndex: milestone?.monthIndex ?? 1 }
      : null,
  };
}

// ---------------------------------------------------------------- insights ---

function buildInsights(facts: Facts): Insight[] {
  const insights: Insight[] = [];

  // Deadlines first — they are the only thing here that expires.
  const critical = facts.deadlinesSoon.filter((d) => d.daysLeft <= 7);
  if (critical.length > 0) {
    insights.push({
      tone: "urgent",
      icon: "alarm-clock",
      text:
        critical.length === 1
          ? `${critical[0].title} closes in ${critical[0].daysLeft} ${critical[0].daysLeft === 1 ? "day" : "days"}.`
          : `${critical.length} of your saved deadlines close within a week.`,
      href: "/opportunities?filter=saved",
      linkLabel: "Review deadlines",
    });
  } else if (facts.deadlinesSoon.length > 0) {
    insights.push({
      tone: "warning",
      icon: "calendar-clock",
      text: `You have ${facts.deadlinesSoon.length} saved ${facts.deadlinesSoon.length === 1 ? "deadline" : "deadlines"} within three weeks.`,
      href: "/opportunities?filter=saved",
      linkLabel: "See saved",
    });
  }

  // Balance across tracks — the flagship observation from the spec.
  if (facts.lessonsThisWeek > 0 && facts.neglectedTracks.length > 0) {
    const track = facts.neglectedTracks[0];
    insights.push({
      tone: "warning",
      icon: "scale",
      text: `You completed ${facts.lessonsThisWeek} ${facts.lessonsThisWeek === 1 ? "lesson" : "lessons"} this week, but nothing in ${track} yet.`,
      href: "/learn",
      linkLabel: `Open ${track}`,
    });
  }

  // Accuracy, not just completion.
  if (facts.weakLessons.length > 0) {
    const weakest = facts.weakLessons[0];
    insights.push({
      tone: "warning",
      icon: "target",
      text: `You scored ${weakest.pct}% on ${weakest.title}. Worth one more pass.`,
      href: `/learn/${weakest.courseSlug}/${weakest.lessonSlug}?mode=practice`,
      linkLabel: "Practise it",
    });
  }

  // Streak, framed as something to protect rather than a scold.
  if (facts.streak >= 3 && facts.minutesLeftToday > 0) {
    insights.push({
      tone: "neutral",
      icon: "flame",
      text: `${facts.streak} day streak. ${facts.minutesLeftToday} minutes left today keeps it alive.`,
    });
  } else if (facts.streak >= 7) {
    insights.push({
      tone: "positive",
      icon: "flame",
      text: `${facts.streak} days in a row — that consistency is the whole point.`,
    });
  } else if (facts.activeDaysThisWeek <= 2 && facts.dayIndex > 7) {
    insights.push({
      tone: "warning",
      icon: "trending-down",
      text: `You were active ${facts.activeDaysThisWeek} ${facts.activeDaysThisWeek === 1 ? "day" : "days"} this week. Even ten minutes today restarts the habit.`,
    });
  }

  // Opportunities the user has not looked at.
  if (facts.unsavedStrongMatches.length > 0) {
    const top = facts.unsavedStrongMatches[0];
    const closing = facts.unsavedStrongMatches.filter(
      (o) => o.daysLeft !== null && o.daysLeft <= 30,
    );
    insights.push({
      tone: "neutral",
      icon: "compass",
      text:
        closing.length > 1
          ? `${closing.length} opportunities matching your profile close within 30 days.`
          : `${top.title} looks like a strong fit — ${top.reason.toLowerCase()}.`,
      href: `/opportunities/${top.slug}`,
      linkLabel: "Take a look",
    });
  }

  // Portfolio gap, for goals where a portfolio is the evidence.
  if (facts.projectCount === 0 && facts.dayIndex > 14) {
    insights.push({
      tone: "neutral",
      icon: "layers",
      text: "You have no projects yet. One small finished project outweighs several unfinished ones.",
      href: "/projects",
      linkLabel: "Add a project",
    });
  }

  if (insights.length === 0) {
    insights.push({
      tone: "positive",
      icon: "check-circle",
      text: `Day ${facts.dayIndex} and nothing is slipping. Keep the plan small and keep showing up.`,
    });
  }

  return insights.slice(0, 4);
}

// -------------------------------------------------------------- next steps ---

async function buildSuggestions(userId: string, facts: Facts): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  const steps = await getSteps(userId, todayIso());

  // Anything still open in today's plan is, by construction, the answer.
  for (const step of steps.filter((s) => s.status === "todo")) {
    const href =
      step.refType === "lesson"
        ? `/learn/${step.refSlug}`
        : step.refType === "practice"
          ? `/learn/${step.refSlug}?mode=practice`
          : step.refType === "opportunity"
            ? `/opportunities/${step.refSlug}`
            : step.refType === "roadmap_task"
              ? "/roadmap"
              : "/dashboard";

    suggestions.push({
      title: step.title,
      detail: step.detail,
      minutes: step.estMinutes,
      href,
      action: step.kind === "opportunity" ? "View" : "Start",
    });
  }

  // If the plan is already clear, propose genuinely useful extras.
  if (suggestions.length < 3) {
    if (facts.weakLessons.length > 0) {
      const weak = facts.weakLessons[0];
      suggestions.push({
        title: `Redo ${weak.title}`,
        detail: `You scored ${weak.pct}% first time. Retrieval practice is where the gain is.`,
        minutes: 6,
        href: `/learn/${weak.courseSlug}/${weak.lessonSlug}?mode=practice`,
        action: "Practice",
      });
    }

    if (facts.unsavedStrongMatches.length > 0) {
      const opportunity = facts.unsavedStrongMatches[0];
      suggestions.push({
        title: `Check eligibility: ${opportunity.title}`,
        detail:
          opportunity.daysLeft !== null
            ? `Closes in ${opportunity.daysLeft} days. Three minutes tells you whether it is worth a plan.`
            : "Three minutes tells you whether it is worth a plan.",
        minutes: 3,
        href: `/opportunities/${opportunity.slug}`,
        action: "View",
      });
    }

    if (facts.openRoadmapTask) {
      suggestions.push({
        title: facts.openRoadmapTask.title,
        detail: `From month ${facts.openRoadmapTask.monthIndex} of your roadmap. One concrete piece of it today.`,
        minutes: 15,
        href: "/roadmap",
        action: "Open",
      });
    }

    if (facts.projectCount === 0) {
      suggestions.push({
        title: "Write down one project idea",
        detail: "Not build it — just name the problem and who has it.",
        minutes: 5,
        href: "/projects",
        action: "Open",
      });
    }
  }

  return suggestions.slice(0, 5);
}

// ------------------------------------------------------------ the headline ---

function ruleHeadline(facts: Facts): string {
  if (facts.stepsToday > 0 && facts.stepsDoneToday === facts.stepsToday) {
    return `Day ${facts.dayIndex} done. ${facts.streak > 1 ? `That is ${facts.streak} days running.` : "Come back tomorrow and make it two."}`;
  }
  if (facts.deadlinesSoon.some((d) => d.daysLeft <= 7)) {
    return `You have a deadline inside a week — clear that first, then today's ${facts.minutesLeftToday} minutes.`;
  }
  if (facts.minutesLeftToday > 0) {
    return `${facts.minutesLeftToday} minutes left in today's plan. Here is where to start.`;
  }
  return `Day ${facts.dayIndex} of 365. Here is what moves the needle today.`;
}

/**
 * Asks Claude to phrase the headline. Facts only — the model is given the
 * computed summary and cannot introduce numbers of its own.
 *
 * Returns null on any failure (no key, network, refusal, bad shape) and the
 * caller falls back to `ruleHeadline`.
 */
async function claudeHeadline(facts: Facts): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const summary = [
      `Name: ${facts.name}`,
      `Goal: ${facts.goalTitle ?? "not set"}`,
      `Day ${facts.dayIndex} of 365, level ${facts.level}, ${facts.totalXp} XP`,
      `Current streak: ${facts.streak} days`,
      `Today: ${facts.stepsDoneToday} of ${facts.stepsToday} steps done, ${facts.minutesLeftToday} minutes remaining`,
      `Lessons completed this week: ${facts.lessonsThisWeek}`,
      `Active days this week: ${facts.activeDaysThisWeek} of 7`,
      facts.neglectedTracks.length > 0
        ? `Not touched this week: ${facts.neglectedTracks.join(", ")}`
        : "All relevant tracks had activity this week",
      facts.weakLessons.length > 0
        ? `Weakest scores: ${facts.weakLessons.map((l) => `${l.title} (${l.pct}%)`).join(", ")}`
        : "No lesson scored below 70%",
      facts.deadlinesSoon.length > 0
        ? `Deadlines within 3 weeks: ${facts.deadlinesSoon.map((d) => `${d.title} in ${d.daysLeft}d`).join(", ")}`
        : "No saved deadlines within 3 weeks",
      `Saved opportunities: ${facts.savedCount}. Projects: ${facts.projectCount}`,
    ].join("\n");

    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 300, // deliberately short: this is one or two sentences
      output_config: { effort: "low" },
      system:
        "You write a single encouraging sentence (max two, under 40 words total) for a " +
        "student's learning dashboard. You are given a factual summary of their progress. " +
        "Rules: use only numbers present in the summary; never invent facts; name the most " +
        "important thing to do next; no emoji; no greeting; no exclamation marks; plain " +
        "direct English. Output the sentence only, with no preamble.",
      messages: [{ role: "user", content: summary }],
    });

    if (response.stop_reason === "refusal") return null;

    const text = response.content
      .filter((block): block is { type: "text"; text: string; citations: null } =>
        block.type === "text",
      )
      .map((block) => block.text)
      .join(" ")
      .trim();

    // Guard against an over-long or empty response rather than letting it break
    // the layout.
    if (text.length < 10 || text.length > 260) return null;
    return text;
  } catch {
    // Any failure at all falls through to the deterministic headline.
    return null;
  }
}

// ----------------------------------------------------------------- the API ---

export async function analyseGrowth(userId: string, name: string): Promise<GrowthAnalysis | null> {
  const facts = await gatherFacts(userId, name);
  if (!facts) return null;

  const [insights, suggestions, narrated] = await Promise.all([
    Promise.resolve(buildInsights(facts)),
    buildSuggestions(userId, facts),
    claudeHeadline(facts),
  ]);

  return {
    headline: narrated ?? ruleHeadline(facts),
    insights,
    suggestions,
    narration: narrated ? "claude" : "rules",
  };
}

/** Whether the optional model-written headline is configured. */
export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Small helper the dashboard uses for the deadline pill colours. */
export function deadlineTone(daysLeft: number | null): InsightTone {
  const days = daysLeft ?? daysUntil(null);
  if (days === null) return "neutral";
  if (days <= 7) return "urgent";
  if (days <= 30) return "warning";
  return "neutral";
}

export function subjectSummary(interests: string[]): string {
  if (interests.length === 0) return "your interests";
  return interests.slice(0, 3).map(subjectLabel).join(", ");
}
