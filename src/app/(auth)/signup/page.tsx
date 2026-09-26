import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth-forms";
import { DemoLoginButton } from "@/components/demo-login-button";
import { Panel } from "@/components/ui";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };
export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (await currentUser()) redirect("/dashboard");

  return (
    <>
      <Panel className="p-7 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Start your 365 days</h1>
        <p className="muted mt-2 text-sm leading-relaxed">
          Six short questions and you will have a roadmap built around your goal — plus
          today&apos;s first step.
        </p>

        <div className="mt-7">
          <SignUpForm />
        </div>

        <p className="muted mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-[var(--fg)] underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </Panel>

      <div className="mt-5 text-center">
        <p className="subtle mb-3 text-xs">Want to look around first?</p>
        <DemoLoginButton size="sm" variant="secondary" className="inline-block">
          Open the demo account
        </DemoLoginButton>
      </div>
    </>
  );
}
