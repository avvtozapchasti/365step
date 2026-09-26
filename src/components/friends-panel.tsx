"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Swords, UserMinus, UserPlus, Users, X } from "lucide-react";

import {
  removeFriendAction,
  respondToFriendRequestAction,
  sendFriendRequestAction,
} from "@/actions/friends";
import type { FriendshipRow } from "@/lib/friends";
import { useReward } from "./reward-toast";
import { Badge, Button, Card, EmptyState, ErrorNote, Input, SectionHeader } from "./ui";

export function FriendsPanel({
  friends,
  incoming,
  outgoing,
  onBattle,
}: {
  friends: FriendshipRow[];
  incoming: FriendshipRow[];
  outgoing: FriendshipRow[];
  /** Opens the "challenge this friend" flow in the parent (the Battles tab). */
  onBattle: (friendId: string, friendName: string) => void;
}) {
  const router = useRouter();
  const reward = useReward();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function send() {
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const result = await sendFriendRequestAction(email);
    setSending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send that request.");
      return;
    }
    setEmail("");
    router.refresh();
  }

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    const result = await respondToFriendRequestAction(id, accept);
    setBusyId(null);
    if (result.ok && accept) {
      reward({ xp: 15, achievements: result.newAchievements, message: "New friend added" });
    }
    router.refresh();
  }

  async function remove(id: string) {
    setBusyId(id);
    await removeFriendAction(id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-5">
        <p className="eyebrow mb-3 flex items-center gap-1.5">
          <UserPlus className="size-3.5" />
          Add a friend
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="sm:flex-1"
          />
          <Button onClick={send} disabled={sending || !email.trim()}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : null}
            Send request
          </Button>
        </div>
        {error ? (
          <div className="mt-3">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
        <p className="subtle mt-2.5 text-xs">
          They need an existing 365step account under that email.
        </p>
      </Card>

      {incoming.length > 0 ? (
        <section>
          <SectionHeader eyebrow={`${incoming.length} pending`} title="Friend requests" />
          <ul className="space-y-2">
            {incoming.map((request) => (
              <li key={request.id} className="surface flex items-center gap-3 p-3.5">
                <span className="sunken flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {request.friend.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{request.friend.name}</span>
                  <span className="subtle block truncate text-xs">{request.friend.email}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => respond(request.id, true)}
                    aria-label={`Accept ${request.friend.name}`}
                    className="flex size-8 items-center justify-center rounded-full border border-[var(--color-done)] text-[var(--color-done)] transition-all hover:bg-[color-mix(in_oklab,var(--color-done)_10%,transparent)] active:scale-95"
                  >
                    {busyId === request.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" strokeWidth={3} />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => respond(request.id, false)}
                    aria-label={`Decline ${request.friend.name}`}
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

      {outgoing.length > 0 ? (
        <section>
          <p className="eyebrow mb-2.5">Sent, awaiting a reply</p>
          <ul className="space-y-2">
            {outgoing.map((request) => (
              <li key={request.id} className="surface flex items-center gap-3 p-3 opacity-70">
                <span className="min-w-0 flex-1 truncate text-sm">{request.friend.name}</span>
                <Badge tone="neutral">Pending</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <SectionHeader eyebrow={`${friends.length} friends`} title="Your friends" />
        {friends.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="No friends yet"
            description="Add a friend by email to compare progress and start a SAT battle."
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {friends.map((friend) => (
              <li key={friend.id} className="surface flex items-center gap-3 p-3.5">
                <span className="sunken flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {friend.friend.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{friend.friend.name}</span>
                  <span className="subtle block truncate text-xs">{friend.friend.email}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onBattle(friend.friend.id, friend.friend.name)}
                    aria-label={`Battle ${friend.friend.name}`}
                    title="Start a battle"
                    className="flex size-8 items-center justify-center rounded-full border border-[var(--border-strong)] transition-all hover:border-[var(--color-arc-mid)] hover:text-[var(--color-arc-mid)] active:scale-95"
                  >
                    <Swords className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === friend.id}
                    onClick={() => remove(friend.id)}
                    aria-label={`Remove ${friend.friend.name}`}
                    title="Remove friend"
                    className="subtle flex size-8 items-center justify-center rounded-full transition-all hover:text-[var(--color-urgent)] active:scale-95"
                  >
                    {busyId === friend.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="size-3.5" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
