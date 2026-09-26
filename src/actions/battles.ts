"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  createBattle,
  respondToBattle,
  submitBattleAnswers,
  type CreateBattleResult,
  type RespondBattleResult,
  type SubmitBattleResult,
} from "@/lib/battles";

function revalidateAll(battleId?: string): void {
  revalidatePath("/compete");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  if (battleId) revalidatePath(`/compete/battles/${battleId}`);
}

export async function createBattleAction(
  friendId: string,
  topic: string,
): Promise<CreateBattleResult> {
  const user = await requireUser();
  const result = await createBattle(user.id, friendId, topic);
  if (result.ok) revalidateAll(result.battleId);
  return result;
}

export async function respondToBattleAction(
  battleId: string,
  accept: boolean,
): Promise<RespondBattleResult> {
  const user = await requireUser();
  const result = await respondToBattle(user.id, battleId, accept);
  if (result.ok) revalidateAll(battleId);
  return result;
}

export async function submitBattleAction(
  battleId: string,
  answers: number[],
  seconds: number,
): Promise<SubmitBattleResult> {
  const user = await requireUser();
  const result = await submitBattleAnswers(user.id, battleId, answers, seconds);
  if (result.ok) revalidateAll(battleId);
  return result;
}

/**
 * void-returning wrappers for the plain `<form action={...}>` on the battle
 * page (rendered from a Server Component, no client JS needed to respond).
 * A raw `<form>` action's type is `(formData: FormData) => void | Promise<void>`,
 * which `respondToBattleAction`'s `Promise<RespondBattleResult>` does not
 * satisfy — these discard the result instead of changing that public return
 * type just to fit one call site.
 */
export async function acceptBattleAction(battleId: string): Promise<void> {
  await respondToBattleAction(battleId, true);
}

export async function declineBattleAction(battleId: string): Promise<void> {
  await respondToBattleAction(battleId, false);
}
