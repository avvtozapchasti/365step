"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Calendar, Check, Crown, Timer, Trophy, Zap } from "lucide-react";
import clsx from "clsx";

import { submitDailyChallengeAction } from "@/actions/daily-challenge";
import type { LeaderboardEntry } from "@/lib/daily-challenge";
import type { PublicQuizQuestion } from "@/lib/types";
import { MultiQuestionQuiz } from "./multi-question-quiz";
import { useReward } from "./reward-toast";
import { Badge, Card, EmptyState, Panel } from "./ui";

export function DailyChallengePanel({
  date,
  questions,
  attempted,
  myResult,
  leaderboard,
}: {
  date: string;
  questions: PublicQuizQuestion[];
  attempted: boolean;
  myResult: { correct: number; total: number; seconds: number } | null;
  leaderboard: LeaderboardEntry[];
}) {
  const router = useRouter();
  const reward = useReward();
  const [justSubmitted, setJustSubmitted] = useState<{ correct: number; total: number } | null>(
    null,
  );

  if (questions.length === 0 && !attempted) {
    return (
      <EmptyState
        icon={<Calendar className="size-5" />}
        title="Not available yet"
        description="There are not enough SAT questions seeded to build today's challenge."
      />
    );
  }

  if (attempted) {
    return (
      <div className="space-y-5">
        <ResultCard result={justSubmitted ?? myResult} date={date} />
        <Leaderboard entries={leaderboard} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel className="flex items-start gap-3 p-4 sm:p-5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--color-kind-opportunity) 14%, transparent)",
            color: "var(--color-kind-opportunity)",
          }}
        >
          <Zap className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Today&apos;s SAT Challenge</p>
          <p className="muted mt-0.5 text-xs leading-relaxed">
            {questions.length} mixed SAT questions, the same set everyone sees today. One
            attempt — answer them all, then submit.
          </p>
        </div>
      </Panel>

      <MultiQuestionQuiz
        questions={questions}
        submitLabel="Submit today's challenge"
        onSubmit={async (answers, seconds) => {
          const result = await submitDailyChallengeAction(answers, seconds);
          if (result.ok) {
            setJustSubmitted({ correct: result.correct ?? 0, total: result.total ?? 0 });
            reward({
              xp: result.xpAwarded,
              achievements: result.newAchievements,
              message: result.perfect ? "Perfect score today" : "Daily challenge complete",
            });
            router.refresh();
          }
          return result;
        }}
        renderSummary={(result) => (
          <ResultCard
            result={{ correct: result.correct ?? 0, total: result.total ?? 0 }}
            date={date}
            xpAwarded={result.xpAwarded}
            perfect={result.perfect}
          />
        )}
      />
    </div>
  );
}

function ResultCard({
  result,
  date,
  xpAwarded,
  perfect,
}: {
  result: { correct: number; total: number } | null;
  date: string;
  xpAwarded?: number;
  perfect?: boolean;
}) {
  if (!result) return null;
  const pct = result.total === 0 ? 0 : Math.round((result.correct / result.total) * 100);

  return (
    <Panel className="p-5 text-center sm:p-6">
      <div
        className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full"
        style={{
          background:
            pct >= 80
              ? "color-mix(in oklab, var(--color-done) 13%, transparent)"
              : "color-mix(in oklab, var(--color-soon) 14%, transparent)",
          color: pct >= 80 ? "var(--color-done)" : "var(--color-soon)",
        }}
      >
        <Award className="size-6" />
      </div>
      <h3 className="text-lg font-semibold">
        {perfect ? "Perfect score" : "Challenge complete"}
      </h3>
      <p className="muted nums mt-1 text-sm">
        {result.correct} of {result.total} correct · {pct}%
      </p>
      <p className="subtle mt-1 text-xs">Today&apos;s challenge · {date}</p>
      {xpAwarded ? (
        <div className="mt-3 flex justify-center">
          <Badge tone="xp">
            <Zap className="size-3" />+{xpAwarded} XP
          </Badge>
        </div>
      ) : null}
    </Panel>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="size-5" />}
        title="No one has played yet today"
        description="Be the first name on today's leaderboard."
      />
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <p className="eyebrow mb-3 flex items-center gap-1.5">
        <Trophy className="size-3.5" />
        Today&apos;s leaderboard
      </p>
      <ol className="space-y-1.5">
        {entries.map((entry) => (
          <li
            key={`${entry.rank}-${entry.name}`}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2",
              entry.isMe ? "sunken ring-1 ring-[var(--color-arc-mid)]" : "",
            )}
          >
            <span
              className={clsx(
                "nums flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                entry.rank === 1
                  ? "bg-[color-mix(in_oklab,var(--color-streak)_18%,transparent)] text-[var(--color-streak)]"
                  : "sunken subtle",
              )}
            >
              {entry.rank === 1 ? <Crown className="size-3.5" /> : entry.rank}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {entry.name}
              {entry.isMe ? <span className="subtle font-normal"> (you)</span> : null}
            </span>
            <span className="nums subtle inline-flex items-center gap-1 text-xs">
              <Check className="size-3" />
              {entry.correct}/{entry.total}
            </span>
            <span className="nums subtle inline-flex items-center gap-1 text-xs">
              <Timer className="size-3" />
              {entry.seconds}s
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
