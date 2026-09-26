"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Timer,
} from "lucide-react";
import clsx from "clsx";

import {
  completeStepAction,
  regenerateStepsAction,
  uncompleteStepAction,
} from "@/actions/steps";
import {
  STEP_KIND_COLOUR as KIND_COLOUR,
  stepAction,
  stepHref,
  stepKindLabel,
  stepNumber,
} from "@/lib/step-display";
import type { DailyStep } from "@/lib/types";
import { Badge, Button, EmptyState } from "./ui";
import { useReward } from "./reward-toast";

/**
 * Today's steps — the centre of the product.
 *
 * Three to five small actions, never a backlog. Completing one writes through to
 * XP, the streak, daily progress and (where a step points at one) the matching
 * roadmap task, then refreshes the page so every other number agrees.
 */
export function TodaySteps({ steps }: { steps: DailyStep[] }) {
  const router = useRouter();
  const reward = useReward();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [regenerating, startRegenerate] = useTransition();

  const done = steps.filter((s) => s.status === "done");
  const remaining = steps.filter((s) => s.status === "todo");
  const minutesLeft = remaining.reduce((sum, s) => sum + s.estMinutes, 0);
  const allDone = steps.length > 0 && remaining.length === 0;

  async function complete(step: DailyStep) {
    setBusyId(step.id);
    const result = await completeStepAction(step.id);
    setBusyId(null);

    if (result.ok) {
      reward({
        xp: result.xpAwarded,
        streak: result.streakDays,
        levelledUp: result.levelledUp,
        dayComplete: result.dailyPlanComplete,
        achievements: result.newAchievements,
      });
      router.refresh();
    }
  }

  async function undo(step: DailyStep) {
    setBusyId(step.id);
    await uncompleteStepAction(step.id);
    setBusyId(null);
    router.refresh();
  }

  if (steps.length === 0) {
    return (
      <EmptyState
        icon={<Timer className="size-5" />}
        title="No steps for today yet"
        description="Your plan is built from your roadmap and your progress. Generate today's steps to get started."
        action={
          <Button
            disabled={regenerating}
            onClick={() =>
              startRegenerate(async () => {
                await regenerateStepsAction();
                router.refresh();
              })
            }
          >
            {regenerating ? <Loader2 className="size-4 animate-spin" /> : null}
            Build today&apos;s plan
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1.5">Today&apos;s steps</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {allDone ? "All done for today" : `${remaining.length} small ${remaining.length === 1 ? "action" : "actions"}`}
          </h2>
          <p className="muted mt-1 text-sm">
            {allDone ? (
              <>Come back tomorrow — the plan rebuilds from where you are.</>
            ) : (
              <>
                <span className="nums">{minutesLeft}</span> minutes in total.{" "}
                {done.length > 0 ? (
                  <span className="nums">
                    {done.length} of {steps.length} done.
                  </span>
                ) : (
                  "Start anywhere."
                )}
              </>
            )}
          </p>
        </div>

        {allDone ? (
          <Badge tone="done">
            <CheckCircle2 className="size-3" />
            Day complete
          </Badge>
        ) : null}
      </div>

      {/* steps */}
      <ol className="space-y-2.5">
        {steps.map((step, index) => {
          const href = stepHref(step);
          const isDone = step.status === "done";
          const busy = busyId === step.id;

          return (
            <li
              key={step.id}
              className={clsx(
                "surface group relative overflow-hidden transition-all",
                isDone ? "opacity-60" : "hover:shadow-lift",
              )}
              style={{ animation: `rise 0.4s ${index * 0.05}s both` }}
            >
              {/* kind stripe */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: isDone ? "var(--color-done)" : KIND_COLOUR[step.kind] }}
              />

              <div className="flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-center sm:gap-4 sm:p-5 sm:pl-6">
                {/* number + kind */}
                <div className="flex items-center gap-3 sm:w-[8.5rem] sm:shrink-0">
                  <span className="nums subtle text-[13px] font-semibold">
                    {stepNumber(index)}
                  </span>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: isDone ? "var(--color-done)" : KIND_COLOUR[step.kind] }}
                  >
                    {stepKindLabel(step.kind)}
                  </span>
                </div>

                {/* body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3
                      className={clsx(
                        "text-[15px] font-semibold leading-snug",
                        isDone && "line-through decoration-1",
                      )}
                    >
                      {step.title}
                    </h3>
                    <span className="subtle nums inline-flex items-center gap-1 text-[11px]">
                      <Timer className="size-3" />
                      {step.estMinutes} min
                    </span>
                  </div>
                  <p className="subtle mt-0.5 text-xs">{step.context}</p>
                  <p className="muted mt-1.5 text-[13px] leading-relaxed">{step.detail}</p>
                </div>

                {/* actions */}
                <div className="flex shrink-0 items-center gap-2 sm:w-auto">
                  {isDone ? (
                    <>
                      <Badge tone="done">
                        <Check className="size-3" strokeWidth={3} />
                        Completed
                      </Badge>
                      <button
                        type="button"
                        onClick={() => undo(step)}
                        disabled={busy}
                        aria-label={`Undo ${step.title}`}
                        title="Undo"
                        className="subtle rounded-full p-1.5 transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]"
                      >
                        {busy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--btn-bg)] px-4 text-[13px] font-medium text-[var(--btn-fg)] transition-all hover:opacity-90 active:scale-[0.98]"
                        >
                          {stepAction(step)}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => complete(step)}
                        disabled={busy}
                        aria-label={`Mark ${step.title} complete`}
                        title="Mark complete"
                        className="flex size-9 items-center justify-center rounded-full border border-[var(--border-strong)] transition-all hover:border-[var(--color-done)] hover:text-[var(--color-done)] active:scale-95"
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" strokeWidth={2.5} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* When everything is done, offer more rather than a dead end. */}
      {allDone ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={regenerating}
            onClick={() =>
              startRegenerate(async () => {
                await regenerateStepsAction();
                router.refresh();
              })
            }
          >
            {regenerating ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Add more steps for today
          </Button>
          <Link
            href="/learn"
            className="muted text-sm underline-offset-4 transition-colors hover:text-[var(--fg)] hover:underline"
          >
            Or explore Learn
          </Link>
        </div>
      ) : null}
    </div>
  );
}
