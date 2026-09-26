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

  try {
    const result = await registerUser(email, password, name);
    if (!result.ok || !result.userId) return { error: result.error ?? "Could not create account." };

    try {
      await createSession(result.userId);
    } catch (error) {
      console.error("Failed to create session:", error);
      return { error: "Could not create session. Please try again." };
    }

    // `redirect` signals by throwing, so it must sit outside any try/catch.
    redirect("/onboarding");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Sign up error:", msg, error);

    // Check if it's a database connection error
    if (msg.includes("ECONNREFUSED") || msg.includes("connection") || msg.includes("database")) {
      return { error: "Database connection failed. Please check the server configuration." };
    }
    if (msg.includes("table") || msg.includes("column")) {
      return { error: "Database schema error. Please ensure the database is properly initialized." };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const result = await authenticate(email, password);
    if (!result.ok || !result.userId) return { error: result.error ?? "Could not sign in." };

    try {
      await pruneSessions();
      await createSession(result.userId);
    } catch (error) {
      console.error("Failed to create session:", error);
      return { error: "Could not create session. Please try again." };
    }

    const onboarded = await hasOnboarded(result.userId);
    redirect(onboarded ? "/dashboard" : "/onboarding");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Sign in error:", msg, error);

    // Check if it's a database connection error
    if (msg.includes("ECONNREFUSED") || msg.includes("connection") || msg.includes("database")) {
      return { error: "Database connection failed. Please check the server configuration." };
    }
    if (msg.includes("table") || msg.includes("column")) {
      return { error: "Database schema error. Please ensure the database is properly initialized." };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

/**
 * Signs into the seeded demo account.
 *
 * Present so a first-time visitor — or a judge with two minutes — can see a
 * populated product immediately instead of an empty new account.
 */
export async function demoLoginAction(): Promise<FormState> {
  try {
    const user = await findUserByEmail(DEMO_EMAIL);
    if (!user) {
      return {
        error: "The demo account is not seeded yet. Run `npm run db:seed` and try again.",
      };
    }

    try {
      await createSession(user.id);
    } catch (error) {
      console.error("Failed to create session:", error);
      return { error: "Could not create session. Please try again." };
    }

    redirect("/dashboard");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Demo login error:", msg, error);

    if (msg.includes("table") || msg.includes("column")) {
      return { error: "Database schema error. Please ensure the database is properly initialized." };
    }

    return { error: "Could not sign in. Please try again." };
  }
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
