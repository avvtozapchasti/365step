import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth-forms";
import { DemoLoginButton } from "@/components/demo-login-button";
import { Panel } from "@/components/ui";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await currentUser()) redirect("/dashboard");

  return (
    <>
      <Panel className="p-7 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="muted mt-2 text-sm">Pick up where you left off.</p>

        <div className="mt-7">
          <SignInForm />
        </div>

        <p className="muted mt-6 text-center text-sm">
          New here?{" "}
          <Link href="/signup" className="font-medium text-[var(--fg)] underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </Panel>

      <div className="surface mt-5 p-4">
        <p className="eyebrow mb-2">Demo account</p>
        <p className="muted text-xs leading-relaxed">
          <span className="font-mono">alex@365step.app</span> ·{" "}
          <span className="font-mono">demo1234</span> — seeded on day 37 with a 12 day
          streak, 14 completed lessons and four saved opportunities.
        </p>
        <div className="mt-3">
          <DemoLoginButton size="sm">Sign in as Alex</DemoLoginButton>
        </div>
      </div>
    </>
  );
}
