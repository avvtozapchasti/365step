import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Set up your path" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[30rem] w-[48rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-arc-start), var(--color-arc-end) 60%, transparent)",
        }}
      />
      <OnboardingFlow firstName={user.name.split(" ")[0]} />
    </div>
  );
}
