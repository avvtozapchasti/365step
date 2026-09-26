/**
 * Friends: send/accept/decline requests, list friends, check friendship.
 *
 * Stored as one row per unordered pair (`user_a < user_b`, a plain string
 * comparison of the UUIDs) rather than two directional rows, so "are these two
 * people friends" and "who are my friends" are each a single, simple query with
 * no risk of the two directions disagreeing.
 */

import { randomUUID } from "node:crypto";

import { all, one, run, str } from "./db";
import { nowIso } from "./date";
import { awardXp, checkAchievements } from "./gamification";
import type { AwardedAchievement } from "./gamification";
import { XP_AWARDS } from "./xp";

export interface FriendUser {
  id: string;
  name: string;
  email: string;
}

export interface FriendshipRow {
  id: string;
  friend: FriendUser;
  status: "pending" | "accepted" | "declined";
  requestedByMe: boolean;
  createdAt: string;
}

function pairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

export async function sendFriendRequest(userId: string, friendEmail: string): Promise<SendResult> {
  const email = friendEmail.trim().toLowerCase();
  if (!email) return { ok: false, error: "Enter an email address." };

  const target = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", [email]);
  if (!target) return { ok: false, error: "No account found with that email." };
  if (str(target.id) === userId) return { ok: false, error: "You cannot add yourself." };

  const [a, b] = pairKey(userId, str(target.id));
  const existing = await one<{ id: string; status: string }>(
    "SELECT id, status FROM friendships WHERE user_a = ? AND user_b = ?",
    [a, b],
  );

  if (existing) {
    if (str(existing.status) === "accepted") return { ok: false, error: "You are already friends." };
    if (str(existing.status) === "pending") return { ok: false, error: "A request is already pending." };
    // Previously declined — a fresh request resets it rather than piling up rows.
    await run(
      "UPDATE friendships SET status = 'pending', requested_by = ?, created_at = ?, responded_at = NULL WHERE id = ?",
      [userId, nowIso(), str(existing.id)],
    );
    return { ok: true };
  }

  await run(
    `INSERT INTO friendships (id, user_a, user_b, status, requested_by, created_at)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [randomUUID(), a, b, userId, nowIso()],
  );
  return { ok: true };
}

export interface RespondResult {
  ok: boolean;
  error?: string;
  newAchievements?: AwardedAchievement[];
}

export async function respondToFriendRequest(
  userId: string,
  friendshipId: string,
  accept: boolean,
): Promise<RespondResult> {
  const row = await one<Record<string, unknown>>("SELECT * FROM friendships WHERE id = ?", [
    friendshipId,
  ]);
  if (!row) return { ok: false, error: "That request could not be found." };
  if (str(row.user_a) !== userId && str(row.user_b) !== userId) {
    return { ok: false, error: "That request is not yours to answer." };
  }
  if (str(row.requested_by) === userId) {
    return { ok: false, error: "You cannot respond to your own request." };
  }
  if (str(row.status) !== "pending") {
    return { ok: false, error: "That request has already been answered." };
  }

  await run("UPDATE friendships SET status = ?, responded_at = ? WHERE id = ?", [
    accept ? "accepted" : "declined",
    nowIso(),
    friendshipId,
  ]);

  if (!accept) return { ok: true };

  // Both sides get the XP — a friendship only exists once, but it took two people.
  await awardXp(userId, XP_AWARDS.friendAdded, "New friend", "friendship", friendshipId);
  await awardXp(str(row.requested_by), XP_AWARDS.friendAdded, "New friend", "friendship", friendshipId);

  return { ok: true, newAchievements: await checkAchievements(userId) };
}

export async function removeFriend(userId: string, friendshipId: string): Promise<SendResult> {
  const row = await one<Record<string, unknown>>("SELECT * FROM friendships WHERE id = ?", [
    friendshipId,
  ]);
  if (!row) return { ok: false, error: "That friendship could not be found." };
  if (str(row.user_a) !== userId && str(row.user_b) !== userId) {
    return { ok: false, error: "That is not your friendship to remove." };
  }
  await run("DELETE FROM friendships WHERE id = ?", [friendshipId]);
  return { ok: true };
}

export async function getFriends(userId: string): Promise<FriendshipRow[]> {
  const rows = await all<Record<string, unknown>>(
    `SELECT f.*, ua.name AS a_name, ua.email AS a_email, ub.name AS b_name, ub.email AS b_email
       FROM friendships f
       JOIN users ua ON ua.id = f.user_a
       JOIN users ub ON ub.id = f.user_b
      WHERE (f.user_a = ? OR f.user_b = ?) AND f.status = 'accepted'
      ORDER BY f.responded_at DESC`,
    [userId, userId],
  );

  return rows.map((r) => {
    const iAmA = str(r.user_a) === userId;
    return {
      id: str(r.id),
      friend: iAmA
        ? { id: str(r.user_b), name: str(r.b_name), email: str(r.b_email) }
        : { id: str(r.user_a), name: str(r.a_name), email: str(r.a_email) },
      status: "accepted" as const,
      requestedByMe: str(r.requested_by) === userId,
      createdAt: str(r.created_at),
    };
  });
}

export async function getPendingRequests(
  userId: string,
): Promise<{ incoming: FriendshipRow[]; outgoing: FriendshipRow[] }> {
  const rows = await all<Record<string, unknown>>(
    `SELECT f.*, ua.name AS a_name, ua.email AS a_email, ub.name AS b_name, ub.email AS b_email
       FROM friendships f
       JOIN users ua ON ua.id = f.user_a
       JOIN users ub ON ub.id = f.user_b
      WHERE (f.user_a = ? OR f.user_b = ?) AND f.status = 'pending'
      ORDER BY f.created_at DESC`,
    [userId, userId],
  );

  const incoming: FriendshipRow[] = [];
  const outgoing: FriendshipRow[] = [];

  for (const r of rows) {
    const iAmA = str(r.user_a) === userId;
    const entry: FriendshipRow = {
      id: str(r.id),
      friend: iAmA
        ? { id: str(r.user_b), name: str(r.b_name), email: str(r.b_email) }
        : { id: str(r.user_a), name: str(r.a_name), email: str(r.a_email) },
      status: "pending",
      requestedByMe: str(r.requested_by) === userId,
      createdAt: str(r.created_at),
    };
    (entry.requestedByMe ? outgoing : incoming).push(entry);
  }

  return { incoming, outgoing };
}

export async function areFriends(userId: string, otherId: string): Promise<boolean> {
  const [a, b] = pairKey(userId, otherId);
  const row = await one<{ id: string }>(
    "SELECT id FROM friendships WHERE user_a = ? AND user_b = ? AND status = 'accepted'",
    [a, b],
  );
  return row !== null;
}
