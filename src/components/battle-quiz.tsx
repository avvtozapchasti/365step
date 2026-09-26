"use client";

import { useRouter } from "next/navigation";
import { Award, Handshake, Swords, Trophy, Zap } from "lucide-react";

import { submitBattleAction } from "@/actions/battles";
import type { BattleView } from "@/lib/battles";
import type { PublicQuizQuestion } from "@/lib/types";
import { MultiQuestionQuiz } from "./multi-question-quiz";
import { useReward } from "./reward-toast";
import { Badge, Panel } from "./ui";

export function BattleQuiz({
  battleId,
  questions,
  opponentName,
}: {
  battleId: string;
  questions: PublicQuizQuestion[];
  opponentName: string;
}) {
  const router = useRouter();
  const reward = useReward();

  return (
    <MultiQuestionQuiz
      questions={questions}
      submitLabel="Submit and see the result"
      onSubmit={async (answers, seconds) => {
        const result = await submitBattleAction(battleId, answers, seconds);
        if (result.ok) {
          reward({
            xp: result.xpAwarded,
            achievements: result.newAchievements,
            message:
              result.battleComplete === false
                ? "Answers submitted — waiting on your opponent"
                : result.won
                  ? "You won the battle"
                  : result.won === null
                    ? "Battle ended in a draw"
                    : "Battle complete",
          });
          router.refresh();
        }
        return result;
      }}
      renderSummary={(result) => (
        <Panel className="p-5 text-center sm:p-6">
          <div
            className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full"
            style={{
              background:
                result.battleComplete && result.won
                  ? "color-mix(in oklab, var(--color-done) 13%, transparent)"
                  : result.battleComplete
                    ? "color-mix(in oklab, var(--color-soon) 14%, transparent)"
                    : "color-mix(in oklab, var(--color-arc-mid) 13%, transparent)",
              color:
                result.battleComplete && result.won
                  ? "var(--color-done)"
                  : result.battleComplete
                    ? "var(--color-soon)"
                    : "var(--color-arc-mid)",
            }}
          >
            {!result.battleComplete ? (
              <Swords className="size-6" />
            ) : result.won ? (
              <Trophy className="size-6" />
            ) : result.won === null ? (
              <Handshake className="size-6" />
            ) : (
              <Award className="size-6" />
            )}
          </div>
          <h3 className="text-lg font-semibold">
            {!result.battleComplete
              ? `Waiting for ${opponentName}`
              : result.won
                ? "You won"
                : result.won === null
                  ? "Draw"
                  : `${opponentName} won`}
          </h3>
          <p className="muted nums mt-1 text-sm">
            You scored {result.correct} of {result.total}
            {!result.battleComplete
              ? ` — ${opponentName} has not submitted yet. Check back, or come back from Compete → Battles.`
              : ""}
          </p>
          {result.xpAwarded ? (
            <div className="mt-3 flex justify-center">
              <Badge tone="xp">
                <Zap className="size-3" />+{result.xpAwarded} XP
              </Badge>
            </div>
          ) : null}
        </Panel>
      )}
    />
  );
}
