import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookOpen, Compass, Flame, Map, Sparkles, Zap } from "lucide-react";

import { AiPanel } from "@/components/ai-panel";
import { DeadlineList } from "@/components/deadline-list";
import { RewardProvider } from "@/components/reward-toast";
import { TodaySteps } from "@/components/today-steps";
import {
  Badge,
  ButtonLink,
  Card,
  Panel,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  SkeletonCard,
} from "@/components/ui";
import { analyseGrowth } from "@/lib/ai";
import { currentUser } from "@/lib/auth";
import { greeting } from "@/lib/date";
import {
  getDeadlines,
  getPrimaryGoal,
  getProfile,
  getSnapshot,
} from "@/lib/queries";
import { ensureTodaySteps } from "@/lib/steps";
import { formatXp, levelFor } from "@/lib/xp";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const [user, params] = await Promise.all([currentUser(), searchParams]);
  if (!user) redirect("/signin");

  const [profile, goal] = await Promise.all([getProfile(user.id), getPrimaryGoal(user.id)]);
  if (!profile || !goal) redirect("/onboarding");

  // Building today's plan on first visit of the day is what makes the product
  // feel like it was waiting for you.
  const [steps, snapshot, deadlines] = await Promise.all([
    ensureTodaySteps(user.id),
    getSnapshot(user.id, goal),
    getDeadlines(user.id),
  ]);

  const level = levelFor(snapshot.totalXp);
  const firstName = user.name.split(" ")[0];
  const isNew = params.welcome === "1";

  return (
    <RewardProvider>
      <div className="space-y-8">
        {isNew ? <WelcomeNote /> : null}

        {/* ========================================================== header */}
        <header className="animate-[rise_0.4s_both]">
          <p className="muted text-sm">
            {greeting()}, {firstName} 👋
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <ProgressRing value={snapshot.goalProgressPct} size={128}>
              <span className="nums text-[1.75rem] font-semibold leading-none">
                {snapshot.dayIndex}
              </span>
              <span className="subtle text-[10px]">of {snapshot.totalDays} days</span>
            </ProgressRing>

            <div className="min-w-0">
              <p className="eyebrow mb-1.5">Your goal</p>
              <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {goal.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="streak">
                  <Flame className="size-3.5" />
                  <span className="nums">{snapshot.streak.currentDays} day streak</span>
                </Badge>
                <Badge tone="xp">
                  <Zap className="size-3" />
                  <span className="nums">{formatXp(snapshot.totalXp)} XP</span>
                </Badge>
                <Badge tone="outline">
                  Level {level.level} · {level.title}
                </Badge>
              </div>

              <div className="mt-4 max-w-sm">
                <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                  <span className="subtle">
                    Level {level.level} → {level.level + 1}
                  </span>
                  <span className="nums subtle">
                    {level.xpToNext > 0 ? `${formatXp(level.xpToNext)} XP to go` : "Max level"}
                  </span>
                </div>
                <ProgressBar value={level.pct} gradient height="h-1.5" label="Level progress" />
              </div>
            </div>
          </div>
        </header>

        {/* ================================================= today's steps */}
        <section>
          <TodaySteps steps={steps} />
        </section>

        {/* =========================================== assistant + deadlines */}
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section>
            <Suspense fallback={<SkeletonCard lines={5} />}>
              <AssistantSlot userId={user.id} name={firstName} />
            </Suspense>
          </section>

          <section>
            <SectionHeader
              eyebrow="Closing soon"
              title="My deadlines"
              action={
                deadlines.length > 0 ? (
                  <Link
                    href="/opportunities?filter=saved"
                    className="muted inline-flex items-center gap-1 text-xs transition-colors hover:text-[var(--fg)]"
                  >
                    All saved
                    <ArrowRight className="size-3" />
                  </Link>
                ) : null
              }
            />
            <DeadlineList deadlines={deadlines} limit={5} />
          </section>
        </div>

        {/* ========================================================= at a glance */}
        <section>
          <SectionHeader eyebrow="At a glance" title="Where you are" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GlanceCard
              href="/learn"
              icon={<BookOpen className="size-4" />}
              colour="var(--color-kind-learn)"
              label="Lessons done"
              value={snapshot.lessonsCompleted}
              hint={`${snapshot.learningMinutes} minutes learning`}
            />
            <GlanceCard
              href="/opportunities?filter=saved"
              icon={<Compass className="size-4" />}
              colour="var(--color-kind-opportunity)"
              label="Saved"
              value={snapshot.savedCount}
              hint={`${snapshot.applicationCount} application${snapshot.applicationCount === 1 ? "" : "s"}`}
            />
            <GlanceCard
              href="/roadmap"
              icon={<Map className="size-4" />}
              colour="var(--color-arc-mid)"
              label="Steps done"
              value={snapshot.stepsCompleted}
              hint={`Day ${snapshot.dayIndex} of 365`}
            />
            <GlanceCard
              href="/projects"
              icon={<Sparkles className="size-4" />}
              colour="var(--color-kind-build)"
              label="Projects"
              value={snapshot.projectCount}
              hint="In your portfolio"
            />
          </div>
        </section>

        {/* ========================================================= this week */}
        <section>
          <SectionHeader
            eyebrow="This week"
            title="Your activity"
            description="Steps completed each day. Small and consistent is the shape you want."
          />
          <Card className="p-5">
            <WeekChart activity={snapshot.weeklyActivity} />
          </Card>
        </section>
      </div>
    </RewardProvider>
  );
}

// ------------------------------------------------------------------- pieces ---

/**
 * The assistant is loaded in its own boundary because it may call out to the
 * Claude API. A slow or hanging call then delays only this card, never the steps
 * the user came here to do.
 */
async function AssistantSlot({ userId, name }: { userId: string; name: string }) {
  const analysis = await analyseGrowth(userId, name);
  if (!analysis) return null;
  return <AiPanel analysis={analysis} />;
}

function WelcomeNote() {
  return (
    <Panel className="animate-[pop_0.4s_both] overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--color-arc-mid) 14%, transparent)",
            color: "var(--color-arc-mid)",
          }}
        >
          <Sparkles className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Your roadmap is ready</h2>
          <p className="muted mt-1.5 text-sm leading-relaxed">
            Twelve monthly milestones, built around your goal and your interests. Today&apos;s
            steps below are the first few minutes of it — start with step 01.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/roadmap" size="sm" variant="secondary">
              <Map className="size-3.5" />
              See the full roadmap
            </ButtonLink>
            <ButtonLink href="/opportunities" size="sm" variant="ghost">
              <Compass className="size-3.5" />
              Browse opportunities
            </ButtonLink>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function GlanceCard({
  href,
  icon,
  colour,
  label,
  value,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  colour: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Link href={href} className="surface group p-4 transition-all hover:shadow-lift">
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${colour} 13%, transparent)`,
            color: colour,
          }}
        >
          {icon}
        </span>
        <ArrowRight className="subtle size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="nums mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
      <p className="subtle mt-0.5 truncate text-[11px]">{hint}</p>
    </Link>
  );
}

function WeekChart({
  activity,
}: {
  activity: { date: string; label: string; xp: number; steps: number }[];
}) {
  const max = Math.max(1, ...activity.map((d) => d.steps));

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3">
      {activity.map((day, i) => {
        const height = day.steps === 0 ? 3 : Math.max(10, (day.steps / max) * 100);
        const isToday = i === activity.length - 1;

        return (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="nums subtle text-[10px]">{day.steps > 0 ? day.steps : ""}</span>
            <div className="sunken flex h-24 w-full items-end overflow-hidden rounded-lg">
              <div
                className="w-full rounded-lg transition-[height] duration-700 ease-out"
                style={{
                  height: `${height}%`,
                  background:
                    day.steps === 0
                      ? "var(--border)"
                      : "linear-gradient(180deg, var(--color-arc-mid), var(--color-arc-end))",
                }}
                title={`${day.label}: ${day.steps} steps, ${day.xp} XP`}
              />
            </div>
            <span
              className={`text-[10px] ${isToday ? "font-semibold" : "subtle"}`}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
