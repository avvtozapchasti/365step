import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Check, Timer } from "lucide-react";

import { Badge, Card, EmptyState, ProgressBar, SectionHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getCoursesWithProgress, getPrimaryGoal, getProfile } from "@/lib/queries";
import { subjectLabel } from "@/lib/taxonomy";
import type { CourseWithProgress } from "@/lib/queries";

export const metadata: Metadata = { title: "Learn" };
export const dynamic = "force-dynamic";

const ACCENT: Record<string, string> = {
  indigo: "var(--color-kind-learn)",
  violet: "#8b5cf6",
  emerald: "var(--color-done)",
  sky: "var(--color-kind-practice)",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  amber: "var(--color-kind-opportunity)",
  fuchsia: "var(--color-kind-build)",
  teal: "var(--color-kind-reflect)",
};

export default async function LearnPage() {
  const user = await currentUser();
  if (!user) redirect("/signin");

  const [profile, goal, courses] = await Promise.all([
    getProfile(user.id),
    getPrimaryGoal(user.id),
    getCoursesWithProgress(user.id),
  ]);
  if (!profile) redirect("/onboarding");

  // Courses that serve the user's goal or interests come first — the same
  // relevance rule the daily planner uses, so Learn and the plan agree.
  const relevance = (course: CourseWithProgress) => {
    let score = 0;
    if (goal && course.goalSlugs.includes(goal.slug)) score += 10;
    score += course.subjects.filter((s) => profile.interests.includes(s)).length * 3;
    return score;
  };

  const recommended = [...courses]
    .filter((c) => relevance(c) > 0 && c.progressPct < 100)
    .sort((a, b) => relevance(b) - relevance(a) || a.orderIndex - b.orderIndex)
    .slice(0, 3);

  const inProgress = courses.filter((c) => c.completedCount > 0 && c.progressPct < 100);

  // Group everything by track for the full catalogue.
  const tracks = [...new Set(courses.map((c) => c.track))];

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const totalDone = courses.reduce((sum, c) => sum + c.completedCount, 0);

  return (
    <div className="space-y-9">
      <header>
        <p className="eyebrow mb-1.5">Learn</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Short lessons, real feedback
        </h1>
        <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
          Every lesson is a short explanation, one worked example, then questions that
          tell you why an answer is right. Nothing here takes longer than the estimate on
          the card.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="outline">
            <Check className="size-3" />
            <span className="nums">
              {totalDone} of {totalLessons} lessons complete
            </span>
          </Badge>
          {profile.interests.length > 0 ? (
            <Badge tone="neutral">
              Tuned to {profile.interests.slice(0, 2).map(subjectLabel).join(" & ")}
            </Badge>
          ) : null}
        </div>
      </header>

      {/* ------------------------------------------------------- continue */}
      {inProgress.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="Pick up where you left off"
            title="In progress"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {inProgress.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ recommended */}
      {recommended.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="For your goal"
            title="Recommended for you"
            description={
              goal
                ? `Chosen because they serve “${goal.title.toLowerCase()}” and the subjects you picked.`
                : undefined
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((course) => (
              <CourseCard key={course.id} course={course} compact />
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- catalogue */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" />}
          title="No courses yet"
          description="Run `npm run db:seed` to load the curriculum."
        />
      ) : (
        tracks.map((track) => {
          const trackCourses = courses.filter((c) => c.track === track);
          const done = trackCourses.reduce((s, c) => s + c.completedCount, 0);
          const all = trackCourses.reduce((s, c) => s + c.lessonCount, 0);

          return (
            <section key={track}>
              <SectionHeader
                eyebrow={track}
                title={`${track} track`}
                action={
                  <span className="subtle nums text-xs">
                    {done}/{all} lessons
                  </span>
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {trackCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function CourseCard({
  course,
  compact = false,
}: {
  course: CourseWithProgress;
  compact?: boolean;
}) {
  const colour = ACCENT[course.accent] ?? "var(--color-kind-learn)";
  const complete = course.progressPct === 100;
  const target = course.nextLessonSlug
    ? `/learn/${course.slug}/${course.nextLessonSlug}`
    : `/learn/${course.slug}`;

  return (
    <Card className="group flex flex-col p-5 transition-all hover:shadow-lift">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklab, ${colour} 13%, transparent)`,
            color: colour,
          }}
        >
          <BookOpen className="size-[18px]" />
        </span>

        {complete ? (
          <Badge tone="done">
            <Check className="size-3" strokeWidth={3} />
            Complete
          </Badge>
        ) : (
          <span className="subtle nums inline-flex items-center gap-1 text-[11px]">
            <Timer className="size-3" />
            {course.totalMinutes} min
          </span>
        )}
      </div>

      <Link href={`/learn/${course.slug}`} className="min-w-0">
        <h3 className="text-base font-semibold leading-snug">{course.title}</h3>
        <p className="subtle mt-0.5 text-xs">{course.subtitle}</p>
      </Link>

      {!compact ? (
        <p className="muted mt-2.5 flex-1 text-[13px] leading-relaxed">{course.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
          <span className="subtle nums">
            {course.completedCount}/{course.lessonCount} lessons
          </span>
          <span className="nums subtle">{course.progressPct}%</span>
        </div>
        <ProgressBar
          value={course.progressPct}
          gradient={!complete}
          height="h-1.5"
          label={`${course.title} progress`}
        />
      </div>

      <Link
        href={target}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
      >
        {complete ? "Review" : course.completedCount > 0 ? "Continue" : "Start"}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  );
}
