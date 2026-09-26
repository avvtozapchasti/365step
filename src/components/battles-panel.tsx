"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Swords, X } from "lucide-react";
import clsx from "clsx";

import { createBattleAction, respondToBattleAction } from "@/actions/battles";
import { BATTLE_TOPICS } from "@/lib/battle-topics";
import type { BattleView } from "@/lib/battles";
import type { FriendUser } from "@/lib/friends";
import { useReward } from "./reward-toast";
import { Badge, Button, Card, EmptyState, ErrorNote, Select } from "./ui";

/** Passed in from the Compete page when the Friends tab's "Battle" button was pressed. */
export interface PendingChallenge {
  friendId: string;
  friendName: string;
}

export function BattlesPanel({
  battles,
  friends,
  currentUserId,
  pendingChallenge,
  onChallengeHandled,
}: {
  battles: BattleView[];
  friends: FriendUser[];
  currentUserId: string;
  pendingChallenge: PendingChallenge | null;
  onChallengeHandled: () => void;
}) {
  const router = useRouter();
  const reward = useReward();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(pendingChallenge !== null);
  const [friendId, setFriendId] = useState(pendingChallenge?.friendId ?? friends[0]?.id ?? "");
  const [topic, setTopic] = useState<string>(BATTLE_TOPICS[3].value);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingChallenge) {
      setFriendId(pendingChallenge.friendId);
      setShowForm(true);
    }
  }, [pendingChallenge]);

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    await respondToBattleAction(id, accept);
    setBusyId(null);
    router.refresh();
  }

  async function create() {
    if (!friendId) return;
    setCreating(true);
    setError(null);
    const result = await createBattleAction(friendId, topic);
    setCreating(false);
    if (!result.ok) {
      setError(result.error ?? "Could not start that battle.");
      return;
    }
    setShowForm(false);
    onChallengeHandled();
    router.refresh();
  }

  const incoming = battles.filter((b) => b.status === "pending" && !b.isChallenger);
  const outgoing = battles.filter((b) => b.status === "pending" && b.isChallenger);
  const active = battles.filter((b) => b.status === "active");
  const finished = battles.filter((b) => b.status === "completed" || b.status === "declined");

  return (
    <div className="space-y-6">
      {friends.length === 0 ? (
        <EmptyState
          icon={<Swords className="size-5" />}
          title="Add a friend first"
          description="Battles are friend-only — add someone from the Friends tab, then challenge them here."
        />
      ) : (
        <Card className="p-4 sm:p-5">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Swords className="size-4" />
              Challenge a friend
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="eyebrow flex items-center gap-1.5">
                <Swords className="size-3.5" />
                New battle
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={friendId} onChange={(e) => setFriendId(e.target.value)}>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </Select>
                <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {BATTLE_TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              {error ? <ErrorNote>{error}</ErrorNote> : null}
              <div className="flex items-center gap-2.5">
                <Button onClick={create} disabled={creating || !friendId}>
                  {creating ? <Loader2 className="size-4 animate-spin" /> : null}
                  Send challenge
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {incoming.length > 0 ? (
        <section>
          <p className="eyebrow mb-2.5">Challenges waiting for you</p>
          <ul className="space-y-2">
            {incoming.map((battle) => (
              <li key={battle.id} className="surface flex items-center gap-3 p-3.5">
                <Swords className="subtle size-4 shrink-0" />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{battle.challenger.name}</span> challenged you to{" "}
                  {battle.topicLabel}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busyId === battle.id}
                    onClick={() => respond(battle.id, true)}
                    aria-label="Accept battle"
                    className="flex size-8 items-center justify-center rounded-full border border-[var(--color-done)] text-[var(--color-done)] transition-all hover:bg-[color-mix(in_oklab,var(--color-done)_10%,transparent)] active:scale-95"
                  >
                    {busyId === battle.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" strokeWidth={3} />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === battle.id}
                    onClick={() => respond(battle.id, false)}
                    aria-label="Decline battle"
                    className="flex size-8 items-center justify-center rounded-full border border-[var(--border-strong)] subtle transition-all hover:border-[var(--color-urgent)] hover:text-[var(--color-urgent)] active:scale-95"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {active.length > 0 ? (
        <section>
          <p className="eyebrow mb-2.5">Active</p>
          <ul className="space-y-2">
            {active.map((battle) => (
              <BattleRow key={battle.id} battle={battle} currentUserId={currentUserId} />
            ))}
          </ul>
        </section>
      ) : null}

      {outgoing.length > 0 ? (
        <section>
          <p className="eyebrow mb-2.5">Sent, awaiting a reply</p>
          <ul className="space-y-2">
            {outgoing.map((battle) => (
              <li key={battle.id} className="surface flex items-center gap-3 p-3 opacity-70">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {battle.topicLabel} vs {battle.opponent.name}
                </span>
                <Badge tone="neutral">
                  <Clock className="size-3" />
                  Pending
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {finished.length > 0 ? (
        <section>
          <p className="eyebrow mb-2.5">History</p>
          <ul className="space-y-2">
            {finished.map((battle) => (
              <BattleRow key={battle.id} battle={battle} currentUserId={currentUserId} />
            ))}
          </ul>
        </section>
      ) : null}

      {battles.length === 0 && friends.length > 0 ? (
        <EmptyState
          icon={<Swords className="size-5" />}
          title="No battles yet"
          description="Challenge a friend above to start one."
        />
      ) : null}
    </div>
  );
}

function BattleRow({ battle, currentUserId }: { battle: BattleView; currentUserId: string }) {
  const opponent = battle.isChallenger ? battle.opponent : battle.challenger;
  const iWon = battle.winnerId === currentUserId;
  const isDraw = battle.status === "completed" && battle.winnerId === null;
  const waitingOnOpponent = battle.status === "active" && battle.myResult !== null && battle.opponentResult === null;

  return (
    <Link
      href={`/compete/battles/${battle.id}`}
      className="surface flex items-center gap-3 p-3.5 transition-all hover:shadow-soft"
    >
      <span
        className={clsx(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          battle.status === "completed"
            ? iWon
              ? "bg-[color-mix(in_oklab,var(--color-done)_14%,transparent)] text-[var(--color-done)]"
              : isDraw
                ? "sunken subtle"
                : "bg-[color-mix(in_oklab,var(--color-urgent)_10%,transparent)] text-[var(--color-urgent)]"
            : "sunken subtle",
        )}
      >
        <Swords className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {battle.topicLabel} vs {opponent.name}
        </span>
        <span className="subtle block text-xs">
          {battle.status === "completed"
            ? iWon
              ? "You won"
              : isDraw
                ? "Draw"
                : "You lost"
            : waitingOnOpponent
              ? "Waiting for your opponent"
              : battle.status === "declined"
                ? "Declined"
                : "Your turn — answer the questions"}
        </span>
      </span>
      {battle.myResult ? (
        <span className="nums subtle shrink-0 text-xs">
          {battle.myResult.correct}/{battle.myResult.total}
        </span>
      ) : null}
    </Link>
  );
}
