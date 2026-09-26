"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { submitDailyChallenge, type SubmitDailyResult } from "@/lib/daily-challenge";

export async function submitDailyChallengeAction(
  answers: number[],
  seconds: number,
): Promise<SubmitDailyResult> {
  const user = await requireUser();
  const result = await submitDailyChallenge(user.id, answers, seconds);
  if (result.ok) {
    revalidatePath("/compete");
    revalidatePath("/dashboard");
    revalidatePath("/progress");
  }
  return result;
}
