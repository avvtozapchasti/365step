/**
 * Account operations: validation, registration, credential checking.
 *
 * Deliberately free of any request-scoped dependency — no `next/headers`, no
 * `next/navigation`. Creating an account and checking a password have nothing to
 * do with cookies, and keeping them separate means they can be exercised from a
 * plain script (and from the seed) rather than only from inside a request.
 *
 * Session and cookie handling lives in `auth.ts`, which builds on this.
 */

import { randomUUID } from "node:crypto";

import { all, one, run } from "./db";
import { nowIso } from "./date";
import { hashPassword, verifyPassword } from "./password";

export interface AuthResult {
  ok: boolean;
  error?: string;
  userId?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message, or null when the input is acceptable. */
export function validateCredentials(
  email: string,
  password: string,
  name?: string,
): string | null {
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (name !== undefined && name.trim().length < 2) return "Tell us your name.";
  return null;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const invalid = validateCredentials(email, password, name);
  if (invalid) return { ok: false, error: invalid };

  try {
    const normalised = email.trim().toLowerCase();

    const existing = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", [
      normalised,
    ]);
    if (existing) return { ok: false, error: "That email is already registered. Sign in instead." };

    const id = randomUUID();
    await run(
      "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
      [id, normalised, await hashPassword(password), name.trim(), nowIso()],
    );

    return { ok: true, userId: id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Register user error:", msg, error);

    if (msg.includes("UNIQUE constraint failed") || msg.includes("duplicate key")) {
      return { ok: false, error: "That email is already registered. Sign in instead." };
    }
    if (msg.includes("table") || msg.includes("column")) {
      return {
        ok: false,
        error: "Database schema error. Please ensure the database is properly initialized.",
      };
    }

    return { ok: false, error: "Could not create account. Please try again." };
  }
}

export async function authenticate(email: string, password: string): Promise<AuthResult> {
  try {
    const normalised = email.trim().toLowerCase();

    const row = await one<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [normalised],
    );
    if (!row) return { ok: false, error: "No account found for that email." };

    if (!(await verifyPassword(password, String(row.password_hash)))) {
      return { ok: false, error: "That password does not match." };
    }
    return { ok: true, userId: String(row.id) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Authenticate error:", msg, error);

    if (msg.includes("table") || msg.includes("column")) {
      return {
        ok: false,
        error: "Database schema error. Please ensure the database is properly initialized.",
      };
    }

    return { ok: false, error: "Could not sign in. Please try again." };
  }
}

/** Used by the demo entry point to find the seeded account. */
export async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  try {
    return one<{ id: string }>("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Find user by email error:", msg, error);
    return null;
  }
}

export async function hasOnboarded(userId: string): Promise<boolean> {
  const rows = await all<{ onboarded_at: string | null }>(
    "SELECT onboarded_at FROM profiles WHERE user_id = ?",
    [userId],
  );
  return rows.length > 0 && rows[0].onboarded_at !== null;
}

/** Housekeeping: drop sessions that have already expired. */
export async function pruneSessions(): Promise<void> {
  await run("DELETE FROM sessions WHERE expires_at < ?", [nowIso()]);
}
