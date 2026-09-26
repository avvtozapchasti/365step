import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  Bookmark,
  CalendarCheck,
  Clock,
  Flame,
  FolderKanban,
  Footprints,
  GraduationCap,
  Hammer,
  Layers,
  Lock,
  Microscope,
  Rocket,
  Swords,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

import {
  Badge,
  Card,
  Panel,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  Stat,
} from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import {
  getAchievements,
  getActivityHistory,
  getPrimaryGoal,
  getSnapshot,
  getTrackProgress,
} from "@/lib/queries";
import { LEVELS, formatXp, levelFor } from "@/lib/xp";

export const metadata: Metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  microscope: Microscope,
  target: Target,
  bookmark: Bookmark,
  rocket: Rocket,
  hammer: Hammer,
  layers: Layers,
  "trending-up": TrendingUp,
  award: Award,
  zap: Zap,
  users: Users,
  swords: Swords,
  "calendar-check": CalendarCheck,
};

export default async function ProgressPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");

  const goal = await getPrimaryGoal(user.id);
  if (!goal) redirect("/onboarding");

  const [snapshot, history, tracks, achievements] = await Promise.all([
    getSnapshot(user.id, goal),
    getActivityHistory(user.id, 28),
    getTrackProgress(user.id),
    getAchievements(user.id),
  ]);

  const level = levelFor(snapshot.totalXp);
  const earned = achievements.filter((a) => a.earnedAt !== null);
  const locked = achievements.filter((a) => a.earnedAt === null);

  const activeDays = history.filter((d) => d.steps > 0).length;
  const bestDay = history.reduce((best, day) => (day.xp > best.xp ? day : best), history[0]);

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-1.5">Progress</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          365 small steps, added up
        </h1>
        <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
          Everything here is computed from what you actually completed — no estimates. The
          point of the page is to make a year of ten-minute sessions visible.
        </p>
      </header>

      {/* ============================================================== level */}
      <Panel className="p-5 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <ProgressRing value={level.pct} size={124}>
            <span className="nums text-2xl font-semibold leading-none">{level.level}</span>
            <span className="subtle text-[10px]">level</span>
          </ProgressRing>

          <div className="min-w-0">
            <p className="eyebrow mb-1">Level {level.level}</p>
            <h2 className="text-xl font-semibold tracking-tight">{level.title}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="xp">
                <Zap className="size-3" />
                <span className="nums">{formatXp(snapshot.totalXp)} XP</span>
              </Badge>
              <Badge tone="streak">
                <Flame className="size-3" />
                <span className="nums">{snapshot.streak.currentDays} day streak</span>
              </Badge>
              <Badge tone="outline">
                <span className="nums">Best {snapshot.streak.longestDays} days</span>
              </Badge>
            </div>

            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                <span className="subtle nums">
                  {formatXp(level.intoLevel)} / {formatXp(level.levelSpan)} into this level
                </span>
                <span className="nums subtle">
                  {level.xpToNext > 0
                    ? `${formatXp(level.xpToNext)} XP to level ${level.level + 1}`
                    : "Max level"}
                </span>
              </div>
              <ProgressBar value={level.pct} gradient label="Level progress" />
            </div>
          </div>
        </div>

        {/* level ladder */}
        <div className="hairline mt-6 pt-5">
          <p className="eyebrow mb-3">The ladder</p>
          <div className="flex gap-1">
            {LEVELS.map((entry) => {
              const reached = snapshot.totalXp >= entry.floor;
              const isCurrent = entry.level === level.level;
              return (
                <div
                  key={entry.level}
                  title={`Level ${entry.level} — ${entry.title} (${formatXp(entry.floor)} XP)`}
                  className={clsx(
                    "h-7 flex-1 rounded-md transition-all",
                    isCurrent && "ring-1 ring-[var(--fg)]",
                  )}
                  style={{
                    background: reached
                      ? "linear-gradient(135deg, var(--color-arc-start), var(--color-arc-end))"
                      : "var(--bg-sunken)",
                    opacity: reached ? (isCurrent ? 1 : 0.55) : 1,
                  }}
                />
              );
            })}
          </div>
          <div className="subtle mt-1.5 flex justify-between text-[10px]">
            <span>Level 1</span>
            <span>Level {LEVELS.length} · 365 Master</span>
          </div>
        </div>
      </Panel>

      {/* =============================================================== stats */}
      <section>
        <SectionHeader eyebrow="Totals" title="Everything so far" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Stat
            label="Steps completed"
            value={snapshot.stepsCompleted}
            hint={`Day ${snapshot.dayIndex} of ${snapshot.totalDays}`}
            icon={<Footprints className="size-3.5" />}
          />
          <Stat
            label="Lessons"
            value={snapshot.lessonsCompleted}
            hint="With their quick checks"
            icon={<BookOpen className="size-3.5" />}
          />
          <Stat
            label="Learning time"
            value={formatMinutes(snapshot.learningMinutes)}
            hint="Across all lessons"
            icon={<Clock className="size-3.5" />}
          />
          <Stat
            label="Total XP"
            value={formatXp(snapshot.totalXp)}
            hint={`Level ${level.level}`}
            icon={<Zap className="size-3.5" />}
          />
          <Stat
            label="Saved"
            value={snapshot.savedCount}
            hint="Opportunities"
            icon={<Bookmark className="size-3.5" />}
          />
          <Stat
            label="Applications"
            value={snapshot.applicationCount}
            hint="Being tracked"
            icon={<Rocket className="size-3.5" />}
          />
          <Stat
            label="Projects"
            value={snapshot.projectCount}
            hint="In your portfolio"
            icon={<FolderKanban className="size-3.5" />}
          />
          <Stat
            label="Achievements"
            value={`${earned.length}/${achievements.length}`}
            hint="Earned"
            icon={<Award className="size-3.5" />}
          />
        </div>
      </section>

      {/* ============================================================ activity */}
      <section>
        <SectionHeader
          eyebrow="Last four weeks"
          title="Weekly activity"
          description={`Active on ${activeDays} of the last ${history.length} days. The shape you want is many short bars, not a few tall ones.`}
        />
        <Card className="p-5 sm:p-6">
          <ActivityChart history={history} />

          <div className="hairline mt-5 grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
            <SmallFact label="Active days" value={`${activeDays} / ${history.length}`} />
            <SmallFact
              label="Consistency"
              value={`${Math.round((activeDays / Math.max(1, history.length)) * 100)}%`}
            />
            <SmallFact
              label="Best day"
              value={bestDay ? `${bestDay.xp} XP` : "—"}
              hint={bestDay && bestDay.xp > 0 ? formatDate(bestDay.date) : undefined}
            />
            <SmallFact
              label="XP this month"
              value={formatXp(history.reduce((sum, d) => sum + d.xp, 0))}
            />
          </div>
        </Card>
      </section>

      {/* ============================================================== tracks */}
      {tracks.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="By subject"
            title="Learning breakdown"
            description="Where your lessons have gone. A track sitting at zero while others climb is what the assistant flags."
          />
          <Card className="p-5 sm:p-6">
            <div className="space-y-4">
              {tracks.map((track) => (
                <div key={track.track}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{track.track}</span>
                    <span className="subtle nums shrink-0 text-[11px]">
                      {track.completed}/{track.total} lessons · {track.pct}%
                    </span>
                  </div>
                  <ProgressBar
                    value={track.pct}
                    gradient={track.pct > 0}
                    height="h-1.5"
                    label={`${track.track} progress`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      {/* ======================================================== achievements */}
      <section>
        <SectionHeader
          eyebrow={`${earned.length} of ${achievements.length} earned`}
          title="Achievements"
          description="Each one is checked against real counters, so none of these can be clicked into existence."
        />

        {earned.length > 0 ? (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {earned.map((achievement) => {
              const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Award;
              return (
                <Card key={achievement.id} className="p-4">
                  <div
                    className="mb-3 flex size-9 items-center justify-center rounded-xl"
                    style={{
                      background: "color-mix(in oklab, var(--color-arc-mid) 14%, transparent)",
                      color: "var(--color-arc-mid)",
                    }}
                  >
                    <Icon className="size-[18px]" />
                  </div>
                  <p className="text-sm font-semibold leading-snug">{achievement.title}</p>
                  <p className="muted mt-1 text-[11px] leading-relaxed">
                    {achievement.description}
                  </p>
                  <p className="subtle mt-2 text-[10px]">
                    {achievement.earnedAt
                      ? formatDate(achievement.earnedAt.slice(0, 10))
                      : null}
                  </p>
                </Card>
              );
            })}
          </div>
        ) : null}

        {locked.length > 0 ? (
          <>
            <p className="eyebrow mb-3">Still to earn</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {locked.map((achievement) => {
                const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Award;
                return (
                  <Card key={achievement.id} className="p-4 opacity-55">
                    <div className="sunken mb-3 flex size-9 items-center justify-center rounded-xl subtle">
                      <Icon className="size-[18px]" />
                    </div>
                    <p className="text-sm font-semibold leading-snug">{achievement.title}</p>
                    <p className="muted mt-1 text-[11px] leading-relaxed">
                      {achievement.description}
                    </p>
                    <p className="subtle mt-2 flex items-center gap-1 text-[10px]">
                      <Lock className="size-2.5" />+{achievement.xp} XP
                    </p>
                  </Card>
                );
              })}
            </div>
          </>
        ) : null}
      </section>

      {/* ================================================================ goal */}
      <section>
        <SectionHeader eyebrow="The year" title="Goal progress" />
        <Card className="p-5 sm:p-6">
          <p className="text-lg font-semibold leading-snug">{goal.title}</p>
          <p className="subtle mt-1 text-xs">
            Started {formatDate(goal.startDate)}
            {goal.targetDate ? ` · target ${formatDate(goal.targetDate)}` : ""}
          </p>

          <div className="mt-5">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="subtle nums">
                Day {snapshot.dayIndex} of {snapshot.totalDays}
              </span>
              <span className="nums subtle">{snapshot.goalProgressPct}%</span>
            </div>
            <ProgressBar value={snapshot.goalProgressPct} gradient height="h-2.5" />
          </div>

          <p className="muted mt-4 text-sm leading-relaxed">
            {snapshot.totalDays - snapshot.dayIndex} days left. At your current pace that is
            roughly{" "}
            <strong className="font-semibold text-[var(--fg)] nums">
              {estimateRemainingSteps(snapshot.stepsCompleted, snapshot.dayIndex, snapshot.totalDays)}
            </strong>{" "}
            more small steps between now and the end of the year.
          </p>
        </Card>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------- pieces ---

function ActivityChart({
  history,
}: {
  history: { date: string; label: string; xp: number; steps: number; minutes: number }[];
}) {
  const max = Math.max(1, ...history.map((d) => d.xp));

  return (
    <div>
      <div className="flex items-end gap-[3px] sm:gap-1.5">
        {history.map((day) => {
          const height = day.xp === 0 ? 2 : Math.max(8, (day.xp / max) * 100);
          return (
            <div key={day.date} className="group relative flex min-w-0 flex-1 flex-col items-center">
              <div className="sunken flex h-28 w-full items-end overflow-hidden rounded-[4px] sm:rounded-md">
                <div
                  className="w-full rounded-[4px] transition-all duration-700 ease-out sm:rounded-md"
                  style={{
                    height: `${height}%`,
                    background:
                      day.xp === 0
                        ? "var(--border)"
                        : "linear-gradient(180deg, var(--color-arc-mid), var(--color-arc-end))",
                  }}
                />
              </div>

              {/* tooltip */}
              <span className="surface shadow-lift pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap px-2 py-1 text-[10px] group-hover:block">
                <span className="nums font-semibold">{day.xp} XP</span>
                <span className="subtle"> · {day.steps} steps</span>
                <br />
                <span className="subtle">{formatDate(day.date)}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* week markers */}
      <div className="subtle mt-2 flex justify-between text-[10px]">
        <span>4 weeks ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function SmallFact({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="nums mt-1 text-base font-semibold">{value}</p>
      {hint ? <p className="subtle text-[10px]">{hint}</p> : null}
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Projects the remaining steps from the pace so far, not from an ideal. */
function estimateRemainingSteps(
  completed: number,
  dayIndex: number,
  totalDays: number,
): number {
  const perDay = dayIndex > 0 ? completed / dayIndex : 3;
  return Math.round(perDay * (totalDays - dayIndex));
}
