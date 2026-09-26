"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Hammer,
  Loader2,
  Lock,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import clsx from "clsx";

import { toggleRoadmapTaskAction } from "@/actions/roadmap";
import type { Milestone, RoadmapTask } from "@/lib/types";
import { Badge, ProgressBar } from "./ui";
import { useReward } from "./reward-toast";

const KIND_ICON = {
  learn: Sparkles,
  practice: Target,
  build: Hammer,
  apply: Send,
  action: Circle,
} as const;

/**
 * The roadmap: twelve monthly milestones, each a small set of tasks.
 *
 * Completed months stay collapsed, the current month opens by default, and
 * future months are visible but locked — so the path ahead is legible without
 * inviting a jump to month nine.
 */
export function RoadmapTimeline({
  milestones,
  currentMonth,
}: {
  milestones: Milestone[];
  currentMonth: number;
}) {
  return (
    <ol className="relative space-y-3">
      {/* The spine. */}
      <span
        aria-hidden
        className="absolute bottom-6 left-[15px] top-6 w-px"
        style={{ background: "var(--border)" }}
      />

      {milestones.map((milestone, i) => (
        <MilestoneRow
          key={milestone.id}
          milestone={milestone}
          currentMonth={currentMonth}
          index={i}
        />
      ))}
    </ol>
  );
}

function MilestoneRow({
  milestone,
  currentMonth,
  index,
}: {
  milestone: Milestone;
  currentMonth: number;
  index: number;
}) {
  const isCurrent = milestone.monthIndex === currentMonth;
  const isPast = milestone.monthIndex < currentMonth;
  const isLocked = milestone.monthIndex > currentMonth;

  // Open the month the user is in; leave the rest collapsed.
  const [open, setOpen] = useState(isCurrent);

  const done = milestone.tasks.filter((t) => t.status === "done").length;
  const total = milestone.tasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  return (
    <li className="relative pl-11" style={{ animation: `rise 0.4s ${index * 0.04}s both` }}>
      {/* node */}
      <span
        className={clsx(
          "absolute left-0 top-4 flex size-8 items-center justify-center rounded-full border-2",
          complete
            ? "border-[var(--color-done)] bg-[var(--color-done)] text-white"
            : isCurrent
              ? "border-[var(--color-arc-mid)] bg-[var(--bg-raised)]"
              : "border-[var(--border-strong)] bg-[var(--bg-raised)]",
        )}
        style={{ background: complete ? undefined : "var(--bg-raised)" }}
      >
        {complete ? (
          <Check className="size-4" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="subtle size-3.5" />
        ) : (
          <span
            className="nums text-[11px] font-semibold"
            style={{ color: isCurrent ? "var(--color-arc-mid)" : undefined }}
          >
            {milestone.monthIndex}
          </span>
        )}
      </span>

      <div
        className={clsx(
          "surface overflow-hidden transition-all",
          isCurrent && "ring-1 ring-[var(--color-arc-mid)]",
          isLocked && "opacity-70",
        )}
      >
        {/* header */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--bg-sunken)] sm:p-5"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">Month {milestone.monthIndex}</span>
              {isCurrent ? <Badge tone="soon">You are here</Badge> : null}
              {complete ? (
                <Badge tone="done">
                  <Check className="size-3" strokeWidth={3} />
                  Complete
                </Badge>
              ) : null}
              {isLocked ? <Badge tone="neutral">Upcoming</Badge> : null}
              {isPast && !complete ? <Badge tone="outline">Still open</Badge> : null}
            </span>

            <span className="mt-1 block text-[17px] font-semibold leading-snug">
              {milestone.title}
            </span>
            <span className="muted mt-0.5 block text-[13px] leading-relaxed">
              {milestone.focus}
            </span>

            {total > 0 ? (
              <span className="mt-3 block max-w-xs">
                <span className="mb-1 flex items-baseline justify-between text-[11px]">
                  <span className="subtle nums">
                    {done} of {total} done
                  </span>
                  <span className="nums subtle">{pct}%</span>
                </span>
                <ProgressBar value={pct} gradient={!complete} height="h-1" />
              </span>
            ) : null}
          </span>

          <ChevronDown
            className={clsx(
              "subtle size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {/* tasks */}
        {open && total > 0 ? (
          <ul className="hairline divide-y divide-[var(--border)]">
            {milestone.tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function TaskRow({ task }: { task: RoadmapTask }) {
  const router = useRouter();
  const reward = useReward();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(task.status);

  const Icon = KIND_ICON[task.kind] ?? Circle;
  const isDone = status === "done";
  const isLocked = status === "locked";

  // Where the task leads, when it points at real content.
  const href =
    task.refType === "lesson"
      ? `/learn/${task.refSlug}`
      : task.refType === "course"
        ? `/learn/${task.refSlug}`
        : task.refType === "opportunity"
          ? "/opportunities"
          : null;

  async function toggle() {
    if (isLocked) return;
    setBusy(true);
    const previous = status;
    setStatus(isDone ? "todo" : "done");

    const result = await toggleRoadmapTaskAction(task.id);
    setBusy(false);

    if (!result.ok) {
      setStatus(previous);
      return;
    }
    setStatus(result.status ?? previous);
    if (result.status === "done") {
      reward({ achievements: result.newAchievements, message: "Roadmap task complete" });
    }
    router.refresh();
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <button
        type="button"
        onClick={toggle}
        disabled={busy || isLocked}
        aria-label={isDone ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        aria-pressed={isDone}
        className={clsx(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          isDone
            ? "border-[var(--color-done)] bg-[var(--color-done)] text-white"
            : isLocked
              ? "border-[var(--border)] subtle cursor-not-allowed"
              : "border-[var(--border-strong)] hover:border-[var(--color-done)] active:scale-90",
        )}
      >
        {busy ? (
          <Loader2 className="size-3 animate-spin" />
        ) : isDone ? (
          <Check className="size-3" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="size-2.5" />
        ) : null}
      </button>

      <Icon
        className="size-3.5 shrink-0"
        style={{
          color: isDone
            ? "var(--color-done)"
            : isLocked
              ? "var(--fg-subtle)"
              : `var(--color-kind-${task.kind === "apply" ? "opportunity" : task.kind === "action" ? "reflect" : task.kind})`,
        }}
      />

      <span
        className={clsx(
          "min-w-0 flex-1 text-[13px] leading-snug",
          isDone && "muted line-through decoration-1",
          isLocked && "subtle",
        )}
      >
        {task.title}
      </span>

      {href && !isLocked ? (
        <Link
          href={href}
          className="muted inline-flex shrink-0 items-center gap-1 text-[11px] font-medium transition-colors hover:text-[var(--fg)]"
        >
          Open
          <ArrowRight className="size-3" />
        </Link>
      ) : null}
    </li>
  );
}
