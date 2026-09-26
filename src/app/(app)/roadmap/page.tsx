import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Map, Target } from "lucide-react";

import { RewardProvider } from "@/components/reward-toast";
import { RoadmapTimeline } from "@/components/roadmap-timeline";
import {
  Badge,
  ButtonLink,
  EmptyState,
  Panel,
  ProgressBar,
  ProgressRing,
} from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { dayIndex as computeDayIndex, formatDate } from "@/lib/date";
import { getPrimaryGoal } from "@/lib/queries";
import { TOTAL_DAYS, readRoadmap } from "@/lib/roadmap";

export const metadata: Metadata = { title: "My Roadmap" };
export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");

  const goal = await getPrimaryGoal(user.id);
  if (!goal) redirect("/onboarding");

  const roadmap = await readRoadmap(user.id, goal.startDate);

  if (!roadmap) {
    return (
      <EmptyState
        icon={<Map className="size-5" />}
        title="No roadmap yet"
        description="Your roadmap is generated from your goal during onboarding."
        action={<ButtonLink href="/onboarding">Set up my path</ButtonLink>}
      />
    );
  }

  const day = Math.min(TOTAL_DAYS, computeDayIndex(goal.startDate));
  const dayPct = Math.round((day / TOTAL_DAYS) * 100);

  return (
    <RewardProvider>
      <div className="space-y-7">
        {/* ========================================================== header */}
        <header>
          <p className="eyebrow mb-1.5">My roadmap</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Twelve months, thirty days at a time
          </h1>
          <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
            Generated from your goal and your subjects. Your daily steps are drawn from
            whichever milestone is open, so finishing a step here moves the plan — and
            finishing a lesson ticks its task automatically.
          </p>
        </header>

        {/* ============================================================= goal */}
        <Panel className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <ProgressRing value={roadmap.progressPct} size={112} stroke={8}>
              <span className="nums text-xl font-semibold leading-none">
                {roadmap.progressPct}%
              </span>
              <span className="subtle text-[10px]">of plan</span>
            </ProgressRing>

            <div className="min-w-0">
              <div className="flex items-start gap-2.5">
                <Target
                  className="mt-1 size-4 shrink-0"
                  style={{ color: "var(--color-arc-mid)" }}
                />
                <div className="min-w-0">
                  <p className="eyebrow mb-1">The goal</p>
                  <h2 className="text-lg font-semibold leading-snug">{goal.title}</h2>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="outline">
                  <span className="nums">
                    Day {day} of {TOTAL_DAYS}
                  </span>
                </Badge>
                <Badge tone="neutral">Month {roadmap.currentMonth} of 12</Badge>
                <Badge tone="outline">
                  <span className="nums">
                    {roadmap.tasksDone}/{roadmap.tasksTotal} tasks
                  </span>
                </Badge>
                {goal.targetDate ? (
                  <Badge tone="neutral">Target {formatDate(goal.targetDate)}</Badge>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                    <span className="subtle">Time elapsed</span>
                    <span className="nums subtle">{dayPct}%</span>
                  </div>
                  <ProgressBar value={dayPct} height="h-1.5" label="Days elapsed" />
                </div>
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                    <span className="subtle">Plan completed</span>
                    <span className="nums subtle">{roadmap.progressPct}%</span>
                  </div>
                  <ProgressBar
                    value={roadmap.progressPct}
                    gradient
                    height="h-1.5"
                    label="Plan progress"
                  />
                </div>
              </div>

              {/* An honest read on pace, rather than a generic cheer. */}
              <p className="muted mt-4 text-xs leading-relaxed">
                {roadmap.progressPct >= dayPct
                  ? "You are level with or ahead of the calendar — the plan is keeping up with the year."
                  : `The calendar is ${dayPct - roadmap.progressPct} points ahead of the plan. That is normal; the daily steps pull from the earliest month with open work.`}
              </p>
            </div>
          </div>
        </Panel>

        {/* ======================================================= milestones */}
        <section>
          <RoadmapTimeline
            milestones={roadmap.milestones}
            currentMonth={roadmap.currentMonth}
          />
        </section>
      </div>
    </RewardProvider>
  );
}
