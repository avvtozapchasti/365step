"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
  type RespondResult,
  type SendResult,
} from "@/lib/friends";

function revalidateAll(): void {
  revalidatePath("/compete");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function sendFriendRequestAction(email: string): Promise<SendResult> {
  const user = await requireUser();
  const result = await sendFriendRequest(user.id, email);
  if (result.ok) revalidateAll();
  return result;
}

export async function respondToFriendRequestAction(
  friendshipId: string,
  accept: boolean,
): Promise<RespondResult> {
  const user = await requireUser();
  const result = await respondToFriendRequest(user.id, friendshipId, accept);
  if (result.ok) revalidateAll();
  return result;
}

export async function removeFriendAction(friendshipId: string): Promise<SendResult> {
  const user = await requireUser();
  const result = await removeFriend(user.id, friendshipId);
  if (result.ok) revalidateAll();
  return result;
}
