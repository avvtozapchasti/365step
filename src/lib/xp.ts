/**
 * XP, levels and the award table.
 *
 * Deliberately stingy: a lesson is worth more than a tap, and reviewing an
 * opportunity is worth less than shipping something. XP has to mean something
 * or the progress page stops being informative.
 */

export const XP_AWARDS = {
  lesson: 25,
  quizPerfect: 10, // bonus on top of the lesson award
  practice: 15,
  build: 30,
  opportunityReview: 8,
  opportunitySaved: 5,
  applicationStarted: 40,
  projectAdded: 35,
  projectShipped: 60,
  reflect: 5,
  dailyPlanComplete: 20, // bonus for clearing every step of the day
  friendAdded: 15,
  battleParticipation: 10,
  battleWin: 35,
  dailyChallengeComplete: 20,
  dailyChallengePerfect: 10, // bonus on top of dailyChallengeComplete
} as const;

/**
 * Level thresholds.
 *
 * Calibrated against the actual award table: consistent daily use earns roughly
 * 55–65 XP a day, so a full 365 days lands around 20,000 XP — which is level 15.
 * The curve widens as it climbs, so early momentum is quick and the top levels
 * still mean something in month ten. Getting this wrong in either direction
 * makes the level a decoration rather than a signal.
 */
export const LEVELS: { level: number; floor: number; title: string }[] = [
  { level: 1, floor: 0, title: "Starter" },
  { level: 2, floor: 200, title: "Beginner" },
  { level: 3, floor: 500, title: "Builder" },
  { level: 4, floor: 900, title: "Consistent" },
  { level: 5, floor: 1400, title: "Focused" },
  { level: 6, floor: 2100, title: "Committed" },
  { level: 7, floor: 2900, title: "Explorer" },
  { level: 8, floor: 3900, title: "Achiever" },
  { level: 9, floor: 5100, title: "Strategist" },
  { level: 10, floor: 6500, title: "Contender" },
  { level: 11, floor: 8200, title: "Standout" },
  { level: 12, floor: 10200, title: "Scholar" },
  { level: 13, floor: 12600, title: "Leader" },
  { level: 14, floor: 15500, title: "Pathfinder" },
  { level: 15, floor: 19000, title: "365 Master" },
];

export interface LevelInfo {
  level: number;
  title: string;
  floor: number;
  ceiling: number;
  intoLevel: number;
  levelSpan: number;
  pct: number;
  xpToNext: number;
}

export function levelFor(totalXp: number): LevelInfo {
  let current = LEVELS[0];
  for (const entry of LEVELS) {
    if (totalXp >= entry.floor) current = entry;
    else break;
  }
  const next = LEVELS.find((l) => l.level === current.level + 1);
  const ceiling = next ? next.floor : current.floor;
  const levelSpan = next ? next.floor - current.floor : 1;
  const intoLevel = totalXp - current.floor;

  return {
    level: current.level,
    title: current.title,
    floor: current.floor,
    ceiling,
    intoLevel,
    levelSpan,
    pct: next ? Math.min(100, Math.round((intoLevel / levelSpan) * 100)) : 100,
    xpToNext: next ? Math.max(0, next.floor - totalXp) : 0,
  };
}

export function formatXp(xp: number): string {
  return xp.toLocaleString("en-US");
}
