"use server";

import { redirect } from "next/navigation";

import {
  authenticate,
  createSession,
  destroySession,
  findUserByEmail,
  hasOnboarded,
  pruneSessions,
  registerUser,
  validateCredentials,
} from "@/lib/auth";

export interface FormState {
  error?: string;
}

const DEMO_EMAIL = "alex@365step.app";

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const invalid = validateCredentials(email, password, name);
  if (invalid) return { error: invalid };

  const result = await registerUser(email, password, name);
  if (!result.ok || !result.userId) return { error: result.error ?? "Could not create account." };

  await createSession(result.userId);

  // `redirect` signals by throwing, so it must sit outside any try/catch.
  redirect("/onboarding");
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const result = await authenticate(email, password);
  if (!result.ok || !result.userId) return { error: result.error ?? "Could not sign in." };

  await pruneSessions();
  await createSession(result.userId);

  redirect((await hasOnboarded(result.userId)) ? "/dashboard" : "/onboarding");
}

/**
 * Signs into the seeded demo account.
 *
 * Present so a first-time visitor — or a judge with two minutes — can see a
 * populated product immediately instead of an empty new account.
 */
export async function demoLoginAction(): Promise<FormState> {
  const user = await findUserByEmail(DEMO_EMAIL);
  if (!user) {
    return {
      error: "The demo account is not seeded yet. Run `npm run db:seed` and try again.",
    };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
