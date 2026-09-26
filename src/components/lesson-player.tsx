"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  Lightbulb,
  Loader2,
  PlayCircle,
  RotateCcw,
  Timer,
  X,
  Zap,
} from "lucide-react";
import clsx from "clsx";

import { submitLessonAction, type LessonSubmitResult } from "@/actions/lessons";
import type { Lesson, Question, Resource } from "@/lib/types";
import { LessonProse } from "./lesson-prose";
import { Badge, Button, ButtonLink, Card, Panel, ProgressBar } from "./ui";

type Phase = "theory" | "quiz" | "done";

/**
 * The lesson player.
 *
 * The whole product's learning principle is Learn → Practice → Feedback, so the
 * player is three phases and nothing more: a short explanation, questions one at
 * a time with the explanation revealed immediately after answering, then the
 * result and the obvious next action.
 *
 * `practiceMode` skips the theory — that is what a "Practice" daily step links
 * to, and what the assistant links to when a score was weak.
 */
export function LessonPlayer({
  courseSlug,
  courseTitle,
  lesson,
  questions,
  resources,
  practiceMode,
  alreadyCompleted,
  previousScore,
}: {
  courseSlug: string;
  courseTitle: string;
  lesson: Lesson;
  questions: Question[];
  resources: Resource[];
  practiceMode: boolean;
  alreadyCompleted: boolean;
  previousScore: { correct: number; total: number } | null;
}) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>(practiceMode ? "quiz" : "theory");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LessonSubmitResult | null>(null);

  const startedAt = useRef(Date.now());
  const question = questions[index];
  const isLast = index === questions.length - 1;

  const correctCount = useMemo(
    () => answers.reduce((n, answer, i) => n + (answer === questions[i]?.correctIndex ? 1 : 0), 0),
    [answers, questions],
  );

  // Keyboard answering: 1–4 to pick, Enter to advance. Quiz drilling should not
  // require the mouse.
  useEffect(() => {
    if (phase !== "quiz" || !question) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        if (revealed) advance();
        else if (selected !== null) reveal();
        return;
      }
      if (revealed) return;
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= question!.options.length) {
        setSelected(n - 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function reveal() {
    if (selected === null) return;
    setAnswers((current) => {
      const next = [...current];
      next[index] = selected;
      return next;
    });
    setRevealed(true);
  }

  function advance() {
    if (!isLast) {
      setIndex(index + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }
    finish();
  }

  async function finish() {
    setSubmitting(true);
    const finalAnswers = [...answers];
    if (selected !== null) finalAnswers[index] = selected;

    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const submitted = await submitLessonAction(courseSlug, lesson.slug, finalAnswers, seconds);

    setResult(submitted);
    setSubmitting(false);
    setPhase("done");
    router.refresh();
  }

  function restart() {
    setPhase("quiz");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setRevealed(false);
    setResult(null);
    startedAt.current = Date.now();
  }

  // ------------------------------------------------------------------- header
  const header = (
    <div className="mb-6">
      <Link
        href={`/learn/${courseSlug}`}
        className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--fg)]"
      >
        <ArrowLeft className="size-3.5" />
        {courseTitle}
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{lesson.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="outline">
          <Timer className="size-3" />
          {lesson.estMinutes} min
        </Badge>
        <Badge tone="xp">
          <Zap className="size-3" />
          {lesson.xp} XP
        </Badge>
        {practiceMode ? <Badge tone="calm">Practice mode</Badge> : null}
        {alreadyCompleted && previousScore ? (
          <Badge tone="done">
            <Check className="size-3" strokeWidth={3} />
            Previously {previousScore.correct}/{previousScore.total}
          </Badge>
        ) : null}
      </div>

      <p className="muted mt-3 text-sm leading-relaxed">{lesson.objective}</p>
    </div>
  );

  // ------------------------------------------------------------------- theory
  if (phase === "theory") {
    return (
      <div className="animate-[rise_0.4s_both]">
        {header}

        <Panel className="p-6 sm:p-8">
          <LessonProse text={lesson.theory} />

          {lesson.example ? (
            <div className="sunken mt-7 rounded-xl p-5">
              <p className="eyebrow mb-3 flex items-center gap-1.5">
                <Lightbulb className="size-3.5" />
                Worked example
              </p>
              <LessonProse text={lesson.example} />
            </div>
          ) : null}

          {lesson.takeaway ? (
            <div
              className="mt-6 rounded-xl border-l-[3px] py-3 pl-4"
              style={{ borderColor: "var(--color-arc-mid)" }}
            >
              <p className="eyebrow mb-1">The takeaway</p>
              <p className="text-[15px] font-medium leading-relaxed">{lesson.takeaway}</p>
            </div>
          ) : null}
        </Panel>

        {resources.length > 0 ? (
          <div className="mt-5">
            <p className="eyebrow mb-3">Go deeper (optional)</p>
            <div className="space-y-2">
              {resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface group flex items-center gap-3 p-3.5 transition-all hover:shadow-soft"
                >
                  <PlayCircle className="size-4 shrink-0" style={{ color: "var(--color-arc-mid)" }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{resource.title}</span>
                    <span className="subtle text-[11px]">
                      {resource.source}
                      {resource.durationMin ? ` · ${resource.durationMin} min` : ""}
                    </span>
                  </span>
                  <ExternalLink className="subtle size-3.5 shrink-0" />
                </a>
              ))}
            </div>
            <p className="subtle mt-3 text-xs leading-relaxed">
              Watching does not complete the step — the questions below do. That is
              deliberate.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Button size="lg" onClick={() => setPhase("quiz")}>
            Check yourself
            <ArrowRight className="size-4" />
          </Button>
          <span className="subtle text-xs">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------- quiz
  if (phase === "quiz" && question) {
    const isCorrect = revealed && selected === question.correctIndex;

    return (
      <div className="animate-[rise_0.4s_both]">
        {header}

        <div className="mb-4">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="subtle nums">
              Question {index + 1} of {questions.length}
            </span>
            <span className="nums subtle">
              {correctCount} correct so far
            </span>
          </div>
          <ProgressBar
            value={(index / questions.length) * 100}
            gradient
            height="h-1.5"
            label="Quiz progress"
          />
        </div>

        <Panel className="p-6 sm:p-7">
          <p className="text-[17px] font-medium leading-relaxed">{question.prompt}</p>

          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const isChosen = selected === i;
              const isAnswer = i === question.correctIndex;

              // After revealing: mark the right answer, and mark a wrong pick.
              const state = !revealed
                ? isChosen
                  ? "chosen"
                  : "idle"
                : isAnswer
                  ? "correct"
                  : isChosen
                    ? "wrong"
                    : "idle";

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isChosen}
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={clsx(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    state === "idle" &&
                      "border-[var(--border)] hover:border-[var(--border-strong)] disabled:hover:border-[var(--border)]",
                    state === "chosen" && "border-[var(--fg)] bg-[var(--bg-sunken)]",
                    state === "correct" &&
                      "border-[var(--color-done)] bg-[color-mix(in_oklab,var(--color-done)_8%,transparent)]",
                    state === "wrong" &&
                      "border-[var(--color-urgent)] bg-[color-mix(in_oklab,var(--color-urgent)_7%,transparent)]",
                  )}
                >
                  <span
                    className={clsx(
                      "mt-px flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                      state === "idle" && "border-[var(--border-strong)] subtle",
                      state === "chosen" && "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg-raised)]",
                      state === "correct" &&
                        "border-[var(--color-done)] bg-[var(--color-done)] text-white",
                      state === "wrong" &&
                        "border-[var(--color-urgent)] bg-[var(--color-urgent)] text-white",
                    )}
                  >
                    {state === "correct" ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : state === "wrong" ? (
                      <X className="size-3" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* instant feedback */}
          {revealed ? (
            <div
              className="mt-5 animate-[rise_0.3s_both] rounded-xl border-l-[3px] py-3 pl-4"
              style={{
                borderColor: isCorrect ? "var(--color-done)" : "var(--color-soon)",
              }}
            >
              <p
                className="mb-1 text-sm font-semibold"
                style={{ color: isCorrect ? "var(--color-done)" : "var(--color-soon)" }}
              >
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              <p className="text-[13px] leading-relaxed">{question.explanation}</p>
            </div>
          ) : null}

          <div className="hairline mt-6 flex items-center justify-between gap-3 pt-5">
            <span className="subtle hidden text-[11px] sm:block">
              Press 1–{question.options.length} to choose, Enter to continue
            </span>

            {revealed ? (
              <Button onClick={advance} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLast ? "Finish lesson" : "Next question"}
                {submitting ? null : <ArrowRight className="size-4" />}
              </Button>
            ) : (
              <Button onClick={reveal} disabled={selected === null}>
                Check answer
              </Button>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // --------------------------------------------------------------------- done
  // The server recomputes the score from the stored correct answers, so prefer
  // its numbers; the local tally is only a fallback if the submit failed.
  const total = result?.total ?? questions.length;
  const finalCorrect = result?.correct ?? correctCount;
  const pct = total === 0 ? 100 : Math.round((finalCorrect / total) * 100);

  return (
    <div className="animate-[pop_0.4s_both]">
      <Panel className="overflow-hidden p-7 text-center sm:p-10">
        <div
          className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
          style={{
            background:
              pct >= 80
                ? "color-mix(in oklab, var(--color-done) 13%, transparent)"
                : "color-mix(in oklab, var(--color-soon) 14%, transparent)",
            color: pct >= 80 ? "var(--color-done)" : "var(--color-soon)",
          }}
        >
          <CheckCircle2 className="size-7" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          {pct === 100
            ? "Perfect"
            : pct >= 80
              ? "Well done"
              : pct >= 50
                ? "Good start"
                : "Worth another pass"}
        </h2>

        <p className="muted nums mt-2 text-sm">
          {finalCorrect} of {total} correct · {pct}%
        </p>

        {/* rewards */}
        {result?.ok ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {result.xpAwarded ? (
              <Badge tone="xp">
                <Zap className="size-3" />+{result.xpAwarded} XP
              </Badge>
            ) : (
              <Badge tone="neutral">Already completed — no XP this time</Badge>
            )}
            {result.streakDays ? (
              <Badge tone="streak">
                <Flame className="size-3" />
                {result.streakDays} day streak
              </Badge>
            ) : null}
            {result.levelledUp ? <Badge tone="done">Level up</Badge> : null}
            {result.dailyPlanComplete ? <Badge tone="done">Day complete</Badge> : null}
          </div>
        ) : null}

        {result?.newAchievements && result.newAchievements.length > 0 ? (
          <div className="sunken mt-6 rounded-xl p-4 text-left">
            <p className="eyebrow mb-2.5">New achievements</p>
            <ul className="space-y-2">
              {result.newAchievements.map((achievement) => (
                <li key={achievement.code} className="flex items-start gap-2.5">
                  <Award
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: "var(--color-arc-mid)" }}
                  />
                  <span>
                    <span className="block text-sm font-medium">{achievement.title}</span>
                    <span className="muted text-xs">{achievement.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result?.error ? (
          <p className="mt-5 text-sm text-[var(--color-urgent)]">{result.error}</p>
        ) : null}

        {/* what next */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          {result?.nextLessonSlug ? (
            <ButtonLink href={`/learn/${courseSlug}/${result.nextLessonSlug}`} size="lg">
              Next: {result.nextLessonTitle}
              <ArrowRight className="size-4" />
            </ButtonLink>
          ) : (
            <ButtonLink href="/dashboard" size="lg">
              Back to today
              <ArrowRight className="size-4" />
            </ButtonLink>
          )}

          <Button variant="secondary" onClick={restart}>
            <RotateCcw className="size-3.5" />
            Try again
          </Button>
        </div>

        <div className="hairline mt-7 pt-5">
          <Link
            href="/dashboard"
            className="muted text-sm underline-offset-4 transition-colors hover:text-[var(--fg)] hover:underline"
          >
            See how today&apos;s plan looks now
          </Link>
        </div>
      </Panel>

      {/* Review the material again without leaving the page. */}
      <Card className="mt-5 p-5">
        <p className="eyebrow mb-3">Review</p>
        {lesson.takeaway ? (
          <p className="text-sm font-medium leading-relaxed">{lesson.takeaway}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setPhase("theory")}
          className="muted mt-3 text-sm underline-offset-4 transition-colors hover:text-[var(--fg)] hover:underline"
        >
          Read the explanation again
        </button>
      </Card>
    </div>
  );
}
