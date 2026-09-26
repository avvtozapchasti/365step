import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Play, Timer, Zap } from "lucide-react";
import clsx from "clsx";

import { Badge, ButtonLink, Card, ProgressBar } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import {
  getCourseBySlug,
  getLessonProgressMap,
  getLessons,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  return { title: course?.title ?? "Course" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const [user, { courseSlug }] = await Promise.all([currentUser(), params]);
  if (!user) redirect("/signin");

  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const [lessons, progress] = await Promise.all([
    getLessons(course.id),
    getLessonProgressMap(user.id),
  ]);

  const completed = lessons.filter((l) => progress.get(l.id)?.status === "completed");
  const next = lessons.find((l) => progress.get(l.id)?.status !== "completed");
  const pct = lessons.length === 0 ? 0 : Math.round((completed.length / lessons.length) * 100);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estMinutes, 0);

  return (
    <div className="space-y-7">
      <header>
        <Link
          href="/learn"
          className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft className="size-3.5" />
          Learn
        </Link>

        <p className="eyebrow mt-4 mb-1.5">{course.track}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{course.title}</h1>
        <p className="muted mt-1 text-sm">{course.subtitle}</p>
        <p className="muted mt-3 max-w-2xl text-sm leading-relaxed">{course.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="outline">
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
          </Badge>
          <Badge tone="outline">
            <Timer className="size-3" />
            {totalMinutes} min total
          </Badge>
          <Badge tone="neutral" className="capitalize">
            {course.difficulty}
          </Badge>
        </div>

        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="subtle nums">
              {completed.length} of {lessons.length} complete
            </span>
            <span className="nums subtle">{pct}%</span>
          </div>
          <ProgressBar value={pct} gradient height="h-2" label="Course progress" />
        </div>

        {next ? (
          <div className="mt-5">
            <ButtonLink href={`/learn/${course.slug}/${next.slug}`} size="lg">
              <Play className="size-4" />
              {completed.length > 0 ? "Continue" : "Start"}: {next.title}
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-5">
            <Badge tone="done">
              <Check className="size-3" strokeWidth={3} />
              Every lesson complete — revisit any of them below
            </Badge>
          </div>
        )}
      </header>

      <section>
        <ol className="space-y-2.5">
          {lessons.map((lesson, index) => {
            const done = progress.get(lesson.id);
            const isDone = done?.status === "completed";
            const isNext = next?.id === lesson.id;
            const score =
              done && done.total > 0 ? Math.round((done.correct / done.total) * 100) : null;

            return (
              <li key={lesson.id}>
                <Link
                  href={`/learn/${course.slug}/${lesson.slug}`}
                  className={clsx(
                    "surface group flex items-start gap-4 p-4 transition-all hover:shadow-lift sm:p-5",
                    isNext && "ring-1 ring-[var(--fg)]",
                  )}
                >
                  {/* number / tick */}
                  <span
                    className={clsx(
                      "nums mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      isDone
                        ? "bg-[var(--color-done)] text-white"
                        : isNext
                          ? "bg-[var(--fg)] text-[var(--bg-raised)]"
                          : "sunken subtle",
                    )}
                  >
                    {isDone ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-[15px] font-semibold leading-snug">
                        {lesson.title}
                      </span>
                      <span className="subtle nums inline-flex items-center gap-1 text-[11px]">
                        <Timer className="size-3" />
                        {lesson.estMinutes} min
                      </span>
                      <span
                        className="nums inline-flex items-center gap-0.5 text-[11px]"
                        style={{ color: "var(--color-xp)" }}
                      >
                        <Zap className="size-3" />
                        {lesson.xp}
                      </span>
                    </span>

                    <span className="muted mt-1 block text-[13px] leading-relaxed">
                      {lesson.objective}
                    </span>

                    {score !== null ? (
                      <span className="mt-2 inline-block">
                        <Badge tone={score >= 80 ? "done" : score >= 50 ? "soon" : "urgent"}>
                          Scored {score}%
                          {score < 70 ? " · worth another pass" : ""}
                        </Badge>
                      </span>
                    ) : null}
                  </span>

                  <span className="flex shrink-0 items-center gap-2 self-center">
                    {isNext ? <Badge tone="outline">Next</Badge> : null}
                    <ArrowRight className="subtle size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
