/**
 * Friend battles: a head-to-head SAT quiz between two friends.
 *
 * Both players answer the same fixed set of questions (chosen once, at creation
 * time, so neither side gets an easier set); whoever scores higher wins, ties
 * broken by speed. Correct answers are never sent to the client before the
 * player submits — `getBattleQuestions` returns only prompt/options, and
 * grading happens server-side in `submitBattleAnswers`.
 */

import { randomUUID } from "node:crypto";

import { all, num, one, run, str } from "./db";
import { addDays, nowIso, todayIso } from "./date";
import { BATTLE_TOPICS, topicLabel } from "./battle-topics";
import { areFriends } from "./friends";
import { awardXp, checkAchievements, touchStreak } from "./gamification";
import type { AwardedAchievement } from "./gamification";
import type { PublicQuizQuestion, QuizBreakdownItem } from "./types";
import { XP_AWARDS } from "./xp";

// Re-exported for callers that only need the domain logic module — client
// components should import these directly from ./battle-topics instead, so
// they never pull this file's database dependency into the browser bundle.
export { BATTLE_TOPICS, topicLabel } from "./battle-topics";
export type { BattleTopic } from "./battle-topics";

const QUESTIONS_PER_BATTLE = 5;
const EXPIRY_DAYS = 2;

export interface BattleView {
  id: string;
  topic: string;
  topicLabel: string;
  status: "pending" | "active" | "completed" | "declined" | "expired";
  challenger: { id: string; name: string };
  opponent: { id: string; name: string };
  isChallenger: boolean;
  myResult: { correct: number; total: number; seconds: number } | null;
  opponentResult: { correct: number; total: number; seconds: number } | null;
  winnerId: string | null;
  createdAt: string;
  questionCount: number;
}

export interface CreateBattleResult {
  ok: boolean;
  error?: string;
  battleId?: string;
}

export async function createBattle(
  userId: string,
  friendId: string,
  topic: string,
): Promise<CreateBattleResult> {
  if (userId === friendId) return { ok: false, error: "You cannot battle yourself." };
  if (!(await areFriends(userId, friendId))) {
    return { ok: false, error: "You can only battle a friend." };
  }

  const def = BATTLE_TOPICS.find((t) => t.value === topic);
  if (!def) return { ok: false, error: "Choose a topic." };

  const rows = def.courseSlug
    ? await all<{ id: string }>(
        `SELECT q.id FROM questions q
           JOIN lessons l ON l.id = q.lesson_id
           JOIN courses c ON c.id = l.course_id
          WHERE c.slug = ?`,
        [def.courseSlug],
      )
    : await all<{ id: string }>(
        `SELECT q.id FROM questions q
           JOIN lessons l ON l.id = q.lesson_id
           JOIN courses c ON c.id = l.course_id
          WHERE c.track = ?`,
        [def.track],
      );

  if (rows.length < QUESTIONS_PER_BATTLE) {
    return { ok: false, error: "Not enough questions for that topic yet." };
  }

  const questionIds = [...rows]
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTIONS_PER_BATTLE)
    .map((r) => str(r.id));

  const id = randomUUID();
  await run(
    `INSERT INTO battles (id, challenger_id, opponent_id, topic, question_ids, status, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      id,
      userId,
      friendId,
      topic,
      JSON.stringify(questionIds),
      nowIso(),
      `${addDays(todayIso(), EXPIRY_DAYS)}T00:00:00.000Z`,
    ],
  );

  return { ok: true, battleId: id };
}

export interface RespondBattleResult {
  ok: boolean;
  error?: string;
}

export async function respondToBattle(
  userId: string,
  battleId: string,
  accept: boolean,
): Promise<RespondBattleResult> {
  const battle = await one<Record<string, unknown>>("SELECT * FROM battles WHERE id = ?", [
    battleId,
  ]);
  if (!battle) return { ok: false, error: "That battle could not be found." };
  if (str(battle.opponent_id) !== userId) {
    return { ok: false, error: "Only the challenged player can respond." };
  }
  if (str(battle.status) !== "pending") {
    return { ok: false, error: "That battle already started." };
  }

  await run("UPDATE battles SET status = ? WHERE id = ?", [
    accept ? "active" : "declined",
    battleId,
  ]);
  return { ok: true };
}

/** The questions a player sees before submitting — no correct answers included. */
export async function getBattleQuestions(
  userId: string,
  battleId: string,
): Promise<PublicQuizQuestion[] | null> {
  const battle = await one<Record<string, unknown>>("SELECT * FROM battles WHERE id = ?", [
    battleId,
  ]);
  if (!battle) return null;
  if (str(battle.challenger_id) !== userId && str(battle.opponent_id) !== userId) return null;

  const questionIds: string[] = JSON.parse(str(battle.question_ids));
  if (questionIds.length === 0) return [];

  const rows = await all<Record<string, unknown>>(
    `SELECT id, prompt, options FROM questions WHERE id IN (${questionIds.map(() => "?").join(",")})`,
    questionIds,
  );
  const byId = new Map(rows.map((r) => [str(r.id), r]));

  return questionIds
    .map((id) => byId.get(id))
    .filter((r): r is Record<string, unknown> => r !== undefined)
    .map((r) => ({
      id: str(r.id),
      prompt: str(r.prompt),
      options: JSON.parse(str(r.options, "[]")) as string[],
    }));
}

export interface SubmitBattleResult {
  ok: boolean;
  error?: string;
  correct?: number;
  total?: number;
  battleComplete?: boolean;
  /** true = you won, false = you lost, null = draw, undefined = opponent has not finished yet. */
  won?: boolean | null;
  xpAwarded?: number;
  newAchievements?: AwardedAchievement[];
  breakdown?: QuizBreakdownItem[];
}

export async function submitBattleAnswers(
  userId: string,
  battleId: string,
  answers: number[],
  seconds: number,
): Promise<SubmitBattleResult> {
  const battle = await one<Record<string, unknown>>("SELECT * FROM battles WHERE id = ?", [
    battleId,
  ]);
  if (!battle) return { ok: false, error: "That battle could not be found." };
  if (str(battle.challenger_id) !== userId && str(battle.opponent_id) !== userId) {
    return { ok: false, error: "That battle is not yours." };
  }
  if (str(battle.status) !== "active") {
    return { ok: false, error: "That battle is not active." };
  }

  const existing = await one<{ id: string }>(
    "SELECT id FROM battle_results WHERE battle_id = ? AND user_id = ?",
    [battleId, userId],
  );
  if (existing) return { ok: false, error: "You already submitted your answers." };

  const questionIds: string[] = JSON.parse(str(battle.question_ids));
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

  await run(
    `INSERT INTO battle_results (id, battle_id, user_id, correct, total, seconds, answers, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), battleId, userId, correct, total, seconds, JSON.stringify(answers), nowIso()],
  );

  let xpAwarded = XP_AWARDS.battleParticipation;
  await awardXp(userId, xpAwarded, "Battle played", "battle", battleId);
  await touchStreak(userId);

  const otherId = str(battle.challenger_id) === userId ? str(battle.opponent_id) : str(battle.challenger_id);
  const otherResult = await one<Record<string, unknown>>(
    "SELECT * FROM battle_results WHERE battle_id = ? AND user_id = ?",
    [battleId, otherId],
  );

  let battleComplete = false;
  let won: boolean | null | undefined;

  if (otherResult) {
    battleComplete = true;
    const otherCorrect = num(otherResult.correct);
    const otherSeconds = num(otherResult.seconds);

    let winnerId: string | null;
    if (correct > otherCorrect) winnerId = userId;
    else if (otherCorrect > correct) winnerId = otherId;
    else winnerId = seconds < otherSeconds ? userId : otherSeconds < seconds ? otherId : null;

    await run("UPDATE battles SET status = 'completed', winner_id = ?, completed_at = ? WHERE id = ?", [
      winnerId,
      nowIso(),
      battleId,
    ]);

    if (winnerId) {
      await awardXp(winnerId, XP_AWARDS.battleWin, "Battle won", "battle", battleId);
      if (winnerId === userId) xpAwarded += XP_AWARDS.battleWin;
      // The winner might be the other player — check their achievements too, so
      // "Battle Champion" unlocks the moment the fifth win actually happens
      // rather than waiting for that player's next unrelated action.
      if (winnerId !== userId) await checkAchievements(winnerId);
    }
    won = winnerId === null ? null : winnerId === userId;
  }

  return {
    ok: true,
    correct,
    total,
    battleComplete,
    won,
    xpAwarded,
    newAchievements: await checkAchievements(userId),
    breakdown,
  };
}

export async function listBattles(userId: string): Promise<BattleView[]> {
  const rows = await all<Record<string, unknown>>(
    `SELECT b.*, uc.name AS challenger_name, uo.name AS opponent_name
       FROM battles b
       JOIN users uc ON uc.id = b.challenger_id
       JOIN users uo ON uo.id = b.opponent_id
      WHERE b.challenger_id = ? OR b.opponent_id = ?
      ORDER BY b.created_at DESC`,
    [userId, userId],
  );
  if (rows.length === 0) return [];

  const ids = rows.map((r) => str(r.id));
  const results = await all<Record<string, unknown>>(
    `SELECT * FROM battle_results WHERE battle_id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );

  return rows.map((r) => {
    const isChallenger = str(r.challenger_id) === userId;
    const otherId = isChallenger ? str(r.opponent_id) : str(r.challenger_id);
    const mine = results.find((x) => str(x.battle_id) === str(r.id) && str(x.user_id) === userId);
    const theirs = results.find((x) => str(x.battle_id) === str(r.id) && str(x.user_id) === otherId);

    return {
      id: str(r.id),
      topic: str(r.topic),
      topicLabel: topicLabel(str(r.topic)),
      status: str(r.status) as BattleView["status"],
      challenger: { id: str(r.challenger_id), name: str(r.challenger_name) },
      opponent: { id: str(r.opponent_id), name: str(r.opponent_name) },
      isChallenger,
      myResult: mine
        ? { correct: num(mine.correct), total: num(mine.total), seconds: num(mine.seconds) }
        : null,
      opponentResult: theirs
        ? { correct: num(theirs.correct), total: num(theirs.total), seconds: num(theirs.seconds) }
        : null,
      winnerId: r.winner_id === null || r.winner_id === undefined ? null : str(r.winner_id),
      createdAt: str(r.created_at),
      questionCount: (JSON.parse(str(r.question_ids, "[]")) as string[]).length,
    };
  });
}

export async function getBattle(userId: string, battleId: string): Promise<BattleView | null> {
  const battles = await listBattles(userId);
  return battles.find((b) => b.id === battleId) ?? null;
}
