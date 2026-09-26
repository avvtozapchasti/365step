import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Clock, Swords, Timer, Trophy, X } from "lucide-react";

import { BattleQuiz } from "@/components/battle-quiz";
import { RewardProvider } from "@/components/reward-toast";
import { Badge, ButtonLink, Card, EmptyState, Panel } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getBattle, getBattleQuestions } from "@/lib/battles";
import { acceptBattleAction, declineBattleAction } from "@/actions/battles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Battle · ${id.slice(0, 8)}` };
}

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([currentUser(), params]);
  if (!user) redirect("/signin");

  const battle = await getBattle(user.id, id);
  if (!battle) notFound();

  const opponent = battle.isChallenger ? battle.opponent : battle.challenger;
  const iWon = battle.winnerId === user.id;
  const isDraw = battle.status === "completed" && battle.winnerId === null;
  const alreadySubmitted = battle.myResult !== null;

  return (
    <RewardProvider>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/compete?tab=battles"
          className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft className="size-3.5" />
          Battles
        </Link>

        <header>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="outline">
              <Swords className="size-3" />
              {battle.topicLabel}
            </Badge>
            <Badge
              tone={
                battle.status === "completed"
                  ? iWon
                    ? "done"
                    : isDraw
                      ? "neutral"
                      : "urgent"
                  : battle.status === "declined"
                    ? "neutral"
                    : "soon"
              }
            >
              {battle.status === "pending"
                ? "Waiting to be accepted"
                : battle.status === "active"
                  ? "In progress"
                  : battle.status === "declined"
                    ? "Declined"
                    : iWon
                      ? "You won"
                      : isDraw
                        ? "Draw"
                        : "You lost"}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            vs {opponent.name}
          </h1>
        </header>

        {battle.status === "pending" && !battle.isChallenger ? (
          <PendingResponse battleId={battle.id} challengerName={battle.challenger.name} />
        ) : null}

        {battle.status === "pending" && battle.isChallenger ? (
          <EmptyState
            icon={<Clock className="size-5" />}
            title="Waiting for a reply"
            description={`${opponent.name} has not accepted this challenge yet.`}
          />
        ) : null}

        {battle.status === "declined" ? (
          <EmptyState
            icon={<X className="size-5" />}
            title="Declined"
            description={`${opponent.name} declined this battle.`}
          />
        ) : null}

        {battle.status === "active" && !alreadySubmitted ? (
          <BattleContent battleId={battle.id} userId={user.id} opponentName={opponent.name} />
        ) : null}

        {battle.status === "active" && alreadySubmitted ? (
          <Card className="p-5 text-center">
            <Clock className="subtle mx-auto mb-2 size-6" />
            <p className="text-sm font-medium">Waiting for {opponent.name}</p>
            <p className="muted mt-1 text-xs">
              You scored {battle.myResult?.correct}/{battle.myResult?.total}. The result
              appears here once they submit too.
            </p>
          </Card>
        ) : null}

        {battle.status === "completed" ? (
          <ResultsPanel battle={battle} opponentName={opponent.name} iWon={iWon} isDraw={isDraw} />
        ) : null}
      </div>
    </RewardProvider>
  );
}

async function BattleContent({
  battleId,
  userId,
  opponentName,
}: {
  battleId: string;
  userId: string;
  opponentName: string;
}) {
  const questions = await getBattleQuestions(userId, battleId);
  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon={<Swords className="size-5" />}
        title="This battle has no questions"
        description="Something went wrong setting it up — start a new one from the Battles tab."
      />
    );
  }
  return <BattleQuiz battleId={battleId} questions={questions} opponentName={opponentName} />;
}

function PendingResponse({ battleId, challengerName }: { battleId: string; challengerName: string }) {
  // Two separate forms, side by side — nesting one <form> inside another is
  // invalid HTML and would leave the inner one unable to submit.
  return (
    <Panel className="p-5 text-center sm:p-6">
      <Swords className="mx-auto mb-3 size-8" style={{ color: "var(--color-arc-mid)" }} />
      <h2 className="text-lg font-semibold">{challengerName} challenged you</h2>
      <p className="muted mt-1.5 text-sm">
        Five questions, same set you both see. Accept to start.
      </p>
      <div className="mt-5 flex justify-center gap-2.5">
        <form action={acceptBattleAction.bind(null, battleId)}>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--btn-bg)] px-5 text-sm font-medium text-[var(--btn-fg)] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Check className="size-4" />
            Accept
          </button>
        </form>
        <form action={declineBattleAction.bind(null, battleId)}>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 text-sm font-medium transition-all hover:bg-[var(--bg-sunken)] active:scale-[0.98]"
          >
            <X className="size-4" />
            Decline
          </button>
        </form>
      </div>
    </Panel>
  );
}

function ResultsPanel({
  battle,
  opponentName,
  iWon,
  isDraw,
}: {
  battle: NonNullable<Awaited<ReturnType<typeof getBattle>>>;
  opponentName: string;
  iWon: boolean;
  isDraw: boolean;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-center gap-3 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-full"
          style={{
            background: iWon
              ? "color-mix(in oklab, var(--color-done) 13%, transparent)"
              : isDraw
                ? "var(--bg-sunken)"
                : "color-mix(in oklab, var(--color-urgent) 10%, transparent)",
            color: iWon ? "var(--color-done)" : isDraw ? "var(--fg-subtle)" : "var(--color-urgent)",
          }}
        >
          <Trophy className="size-6" />
        </div>
      </div>
      <h2 className="text-center text-lg font-semibold">
        {iWon ? "You won" : isDraw ? "It was a draw" : `${opponentName} won`}
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ScoreCard label="You" result={battle.myResult} highlighted={iWon} />
        <ScoreCard label={opponentName} result={battle.opponentResult} highlighted={!iWon && !isDraw} />
      </div>
    </Panel>
  );
}

function ScoreCard({
  label,
  result,
  highlighted,
}: {
  label: string;
  result: { correct: number; total: number; seconds: number } | null;
  highlighted: boolean;
}) {
  return (
    <Card className={highlighted ? "ring-1 ring-[var(--color-arc-mid)]" : ""}>
      <div className="p-4 text-center">
        <p className="subtle text-xs">{label}</p>
        <p className="nums mt-1 text-2xl font-semibold">
          {result ? `${result.correct}/${result.total}` : "—"}
        </p>
        {result ? (
          <p className="subtle nums mt-0.5 inline-flex items-center gap-1 text-[11px]">
            <Timer className="size-3" />
            {result.seconds}s
          </p>
        ) : null}
      </div>
    </Card>
  );
}
