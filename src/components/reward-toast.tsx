"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Award, Check, Flame, Sparkles, TrendingUp } from "lucide-react";

import type { AwardedAchievement } from "@/lib/gamification";

/**
 * The reward layer: XP gains, new achievements, level-ups and day-complete.
 *
 * Deliberately restrained. The spec's line was "modern gamification, not a
 * children's game", so this is a small stack of cards that appear and leave,
 * with no confetti and no sound.
 */

export interface Reward {
  xp?: number;
  streak?: number;
  levelledUp?: boolean;
  dayComplete?: boolean;
  achievements?: AwardedAchievement[];
  message?: string;
}

/**
 * One card on screen. `achievement` is set for the per-achievement cards that
 * `push` splits out, so each card reports its own XP rather than borrowing the
 * triggering action's.
 */
interface Toast extends Omit<Reward, "achievements"> {
  id: number;
  achievement?: AwardedAchievement;
}

const RewardContext = createContext<(reward: Reward) => void>(() => {});

export function useReward(): (reward: Reward) => void {
  return useContext(RewardContext);
}

export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((reward: Reward) => {
    // Nothing happened worth announcing.
    if (
      !reward.xp &&
      !reward.levelledUp &&
      !reward.dayComplete &&
      !reward.message &&
      (reward.achievements?.length ?? 0) === 0
    ) {
      return;
    }

    const { achievements = [], ...base } = reward;
    const cards: Toast[] = [];
    let seq = 0;
    const nextId = () => Date.now() + seq++ + Math.random();

    // The action's own XP, on its own card.
    if (base.xp || base.levelledUp || base.dayComplete || base.message) {
      cards.push({ ...base, id: nextId() });
    }

    // Achievements carry XP of their own, separate from the action's. Giving
    // each its own card keeps the arithmetic on screen honest — a single card
    // showing "+15 XP" next to an achievement worth 20 more reads as a lie.
    for (const achievement of achievements) {
      cards.push({ id: nextId(), achievement, xp: achievement.xp });
    }

    setToasts((current) => [...current, ...cards]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <RewardContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-8 lg:left-60"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDone={() => dismiss(toast.id)} />
        ))}
      </div>
    </RewardContext.Provider>
  );
}

function ToastCard({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const achievement = toast.achievement;

  // Achievements and level-ups deserve a beat longer on screen.
  const lifetime = achievement || toast.levelledUp ? 4200 : 2600;

  useEffect(() => {
    const timer = setTimeout(onDone, lifetime);
    return () => clearTimeout(timer);
  }, [lifetime, onDone]);

  return (
    <div className="surface shadow-lift pointer-events-auto flex w-full max-w-sm animate-[pop_0.35s_both] items-center gap-3 px-4 py-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: achievement
            ? "color-mix(in oklab, var(--color-arc-mid) 15%, transparent)"
            : toast.levelledUp
              ? "color-mix(in oklab, var(--color-xp) 15%, transparent)"
              : "color-mix(in oklab, var(--color-done) 14%, transparent)",
          color: achievement
            ? "var(--color-arc-mid)"
            : toast.levelledUp
              ? "var(--color-xp)"
              : "var(--color-done)",
        }}
      >
        {achievement ? (
          <Award className="size-[18px]" />
        ) : toast.levelledUp ? (
          <TrendingUp className="size-[18px]" />
        ) : (
          <Check className="size-[18px]" strokeWidth={2.5} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {achievement
            ? `Achievement: ${achievement.title}`
            : toast.levelledUp
              ? "Level up"
              : toast.dayComplete
                ? "Day complete"
                : (toast.message ?? "Step completed")}
        </p>
        <p className="muted truncate text-xs">
          {achievement
            ? achievement.description
            : toast.dayComplete
              ? "Every step done — that is the streak protected."
              : toast.xp
                ? `+${toast.xp} XP`
                : "Progress saved"}
        </p>
      </div>

      {toast.xp ? (
        <span
          className="nums shrink-0 text-sm font-semibold"
          style={{ color: "var(--color-xp)" }}
        >
          +{toast.xp}
        </span>
      ) : null}

      {toast.streak && toast.streak > 1 && !achievement ? (
        <span
          className="nums flex shrink-0 items-center gap-1 text-xs font-medium"
          style={{ color: "var(--color-streak)" }}
        >
          <Flame className="size-3.5" />
          {toast.streak}
        </span>
      ) : null}

      {!toast.xp && !achievement && !toast.streak ? (
        <Sparkles className="subtle size-4 shrink-0" />
      ) : null}
    </div>
  );
}
