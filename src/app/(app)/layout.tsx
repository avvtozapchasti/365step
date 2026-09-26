import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { currentUser } from "@/lib/auth";
import { dayIndex as computeDayIndex } from "@/lib/date";
import { getPrimaryGoal, getProfile, getStreak, getTotalXp } from "@/lib/queries";
import { TOTAL_DAYS } from "@/lib/roadmap";
import { levelFor } from "@/lib/xp";

export const dynamic = "force-dynamic";

/**
 * The gate for every signed-in page: no session goes to sign-in, an
 * unfinished profile goes back to onboarding. Everything inside this layout can
 * therefore assume a user with a profile and a goal.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/signin");

  const profile = await getProfile(user.id);
  if (!profile || !profile.onboardedAt) redirect("/onboarding");

  const [goal, streak, totalXp] = await Promise.all([
    getPrimaryGoal(user.id),
    getStreak(user.id),
    getTotalXp(user.id),
  ]);

  if (!goal) redirect("/onboarding");

  const level = levelFor(totalXp);

  return (
    <AppShell
      user={{
        name: user.name,
        level: level.level,
        levelTitle: level.title,
        totalXp,
        streak: streak.currentDays,
        dayIndex: Math.min(TOTAL_DAYS, computeDayIndex(goal.startDate)),
      }}
    >
      {children}
    </AppShell>
  );
}
