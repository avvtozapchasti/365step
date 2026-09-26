import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LessonPlayer } from "@/components/lesson-player";
import { RewardProvider } from "@/components/reward-toast";
import { currentUser } from "@/lib/auth";
import {
  getCourseBySlug,
  getLesson,
  getLessonProgressMap,
  getQuestions,
  getResources,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLesson(courseSlug, lessonSlug);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [user, { courseSlug, lessonSlug }, query] = await Promise.all([
    currentUser(),
    params,
    searchParams,
  ]);
  if (!user) redirect("/signin");

  const [course, lesson] = await Promise.all([
    getCourseBySlug(courseSlug),
    getLesson(courseSlug, lessonSlug),
  ]);
  if (!course || !lesson) notFound();

  const [questions, resources, progressMap] = await Promise.all([
    getQuestions(lesson.id),
    getResources(lesson.id),
    getLessonProgressMap(user.id),
  ]);

  const progress = progressMap.get(lesson.id);

  return (
    <RewardProvider>
      <div className="mx-auto max-w-3xl">
        <LessonPlayer
          courseSlug={course.slug}
          courseTitle={course.title}
          lesson={lesson}
          questions={questions}
          resources={resources}
          practiceMode={query.mode === "practice"}
          alreadyCompleted={progress?.status === "completed"}
          previousScore={
            progress && progress.total > 0
              ? { correct: progress.correct, total: progress.total }
              : null
          }
        />
      </div>
    </RewardProvider>
  );
}
