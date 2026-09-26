/**
 * The daily SAT challenge: one fixed set of SAT questions everyone sees that
 * day, a solo race for a spot on the leaderboard.
 *
 * The set is chosen by a seeded shuffle of every SAT question, seeded from the
 * date string itself — so it is reproducible without being stored ahead of
 * time, and identical across SQLite and Postgres without depending on either
 * dialect's own RANDOM(). The set is persisted on first request each day so a
 * concurrent second request can't recompute a different one.
 */

import { randomUUID } from "node:crypto";

import { all, num, one, run, str } from "./db";
import { nowIso, todayIso } from "./date";
import { awardXp, checkAchievements, touchStreak } from "./gamification";
import type { AwardedAchievement } from "./gamification";
import type { PublicQuizQuestion, QuizBreakdownItem } from "./types";
import { XP_AWARDS } from "./xp";

const QUESTIONS_PER_CHALLENGE = 5;

/** A small, dependency-free deterministic PRNG (mulberry32), seeded from a string. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Creates today's challenge if it does not exist yet, or reads the existing one. */
export async function ensureTodayChallenge(
  date = todayIso(),
): Promise<{ id: string; questionIds: string[] }> {
  const existing = await one<{ id: string; question_ids: string }>(
    "SELECT id, question_ids FROM daily_challenges WHERE challenge_date = ?",
    [date],
  );
  if (existing) {
    return { id: str(existing.id), questionIds: JSON.parse(str(existing.question_ids)) };
  }

  const rows = await all<{ id: string }>(
    `SELECT q.id FROM questions q
       JOIN lessons l ON l.id = q.lesson_id
       JOIN courses c ON c.id = l.course_id
      WHERE c.track = 'SAT'`,
  );
  const ids = rows.map((r) => str(r.id));
  const chosen = seededShuffle(ids, date).slice(0, Math.min(QUESTIONS_PER_CHALLENGE, ids.length));

  const id = randomUUID();
  try {
    await run(
      "INSERT INTO daily_challenges (id, challenge_date, question_ids, created_at) VALUES (?, ?, ?, ?)",
      [id, date, JSON.stringify(chosen), nowIso()],
    );
    return { id, questionIds: chosen };
  } catch {
    // Two concurrent first-visitors of the day both tried to create it; the
    // UNIQUE constraint on challenge_date let exactly one insert land — read
    // back whichever one won.
    const row = await one<{ id: string; question_ids: string }>(
      "SELECT id, question_ids FROM daily_challenges WHERE challenge_date = ?",
      [date],
    );
    return { id: str(row!.id), questionIds: JSON.parse(str(row!.question_ids)) };
  }
}

/** Whether this user has already played today — cheap enough for a dashboard card. */
export async function hasAttemptedTodayChallenge(userId: string, date = todayIso()): Promise<boolean> {
  const { id } = await ensureTodayChallenge(date);
  const row = await one<{ id: string }>(
    "SELECT id FROM daily_challenge_attempts WHERE challenge_id = ? AND user_id = ?",
    [id, userId],
  );
  return row !== null;
}

export interface DailyChallengeView {
  id: string;
  date: string;
  questions: PublicQuizQuestion[];
  attempted: boolean;
  myResult: { correct: number; total: number; seconds: number } | null;
}

export async function getDailyChallenge(
  userId: string,
  date = todayIso(),
): Promise<DailyChallengeView> {
  const { id, questionIds } = await ensureTodayChallenge(date);

  const attempt = await one<Record<string, unknown>>(
    "SELECT * FROM daily_challenge_attempts WHERE challenge_id = ? AND user_id = ?",
    [id, userId],
  );

  // Once attempted, there is no reason to send the questions back down again.
  let questions: PublicQuizQuestion[] = [];
  if (!attempt && questionIds.length > 0) {
    const rows = await all<Record<string, unknown>>(
      `SELECT id, prompt, options FROM questions WHERE id IN (${questionIds.map(() => "?").join(",")})`,
      questionIds,
    );
    const byId = new Map(rows.map((r) => [str(r.id), r]));
    questions = questionIds
      .map((qid) => byId.get(qid))
      .filter((r): r is Record<string, unknown> => r !== undefined)
      .map((r) => ({
        id: str(r.id),
        prompt: str(r.prompt),
        options: JSON.parse(str(r.options, "[]")) as string[],
      }));
  }

  return {
    id,
    date,
    questions,
    attempted: attempt !== null,
    myResult: attempt
      ? { correct: num(attempt.correct), total: num(attempt.total), seconds: num(attempt.seconds) }
      : null,
  };
}

export interface SubmitDailyResult {
  ok: boolean;
  error?: string;
  correct?: number;
  total?: number;
  perfect?: boolean;
  xpAwarded?: number;
  newAchievements?: AwardedAchievement[];
  breakdown?: QuizBreakdownItem[];
}

export async function submitDailyChallenge(
  userId: string,
  answers: number[],
  seconds: number,
): Promise<SubmitDailyResult> {
  const date = todayIso();
  const { id, questionIds } = await ensureTodayChallenge(date);

  const existing = await one<{ id: string }>(
    "SELECT id FROM daily_challenge_attempts WHERE challenge_id = ? AND user_id = ?",
    [id, userId],
  );
  if (existing) return { ok: false, error: "You already completed today's challenge." };

  if (questionIds.length === 0) {
    return { ok: false, error: "No SAT questions are available yet." };
  }

  const rows = await all<Record<string, unknown>>(
    `SELECT id, correct_index, explanation FROM questions WHERE id IN (${questionIds
      .map(() => "?")
      .join(",")})`,
    questionIds,
  );
  const byId = new Map(rows.map((r) => [str(r.id), r]));

  let correct = 0;
  const breakdown: QuizBreakdownItem[] = questionIds.map((qid, i) => {
    const q = byId.get(qid);
    const correctIndex = num(q?.correct_index);
    const chosenIndex = answers[i] ?? -1;
    const isCorrect = chosenIndex === correctIndex;
    if (isCorrect) correct++;
    return { questionId: qid, chosenIndex, correctIndex, isCorrect, explanation: str(q?.explanation) };
  });
  const total = questionIds.length;
  const perfect = total > 0 && correct === total;
  const xp = XP_AWARDS.dailyChallengeComplete + (perfect ? XP_AWARDS.dailyChallengePerfect : 0);

  await run(
    `INSERT INTO daily_challenge_attempts (id, challenge_id, user_id, correct, total, seconds, xp_awarded, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), id, userId, correct, total, seconds, xp, nowIso()],
  );

  await awardXp(userId, xp, "Daily SAT Challenge", "daily_challenge", id);
  await touchStreak(userId);

  return {
    ok: true,
    correct,
    total,
    perfect,
    xpAwarded: xp,
    newAchievements: await checkAchievements(userId),
    breakdown,
  };
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  correct: number;
  total: number;
  seconds: number;
  isMe: boolean;
}

export async function getLeaderboard(
  userId: string,
  date = todayIso(),
  limit = 20,
): Promise<LeaderboardEntry[]> {
  const { id } = await ensureTodayChallenge(date);

  const rows = await all<Record<string, unknown>>(
    `SELECT a.correct, a.total, a.seconds, a.user_id, u.name
       FROM daily_challenge_attempts a
       JOIN users u ON u.id = a.user_id
      WHERE a.challenge_id = ?
      ORDER BY a.correct DESC, a.seconds ASC
      LIMIT ?`,
    [id, limit],
  );

  return rows.map((r, i) => ({
    rank: i + 1,
    name: str(r.name),
    correct: num(r.correct),
    total: num(r.total),
    seconds: num(r.seconds),
    isMe: str(r.user_id) === userId,
  }));
}
