"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import clsx from "clsx";

import { startApplicationAction, toggleSaveAction } from "@/actions/opportunities";
import { Button, buttonClass } from "./ui";
import { useReward } from "./reward-toast";

/**
 * Saves an opportunity. Optimistic on the icon, authoritative on refresh —
 * the deadline appearing on the dashboard is the real confirmation.
 */
export function SaveButton({
  opportunityId,
  saved,
  variant = "icon",
  className,
}: {
  opportunityId: string;
  saved: boolean;
  variant?: "icon" | "full";
  className?: string;
}) {
  const router = useRouter();
  const reward = useReward();
  const [optimistic, setOptimistic] = useState(saved);
  const [busy, setBusy] = useState(false);

  async function toggle(event: React.MouseEvent) {
    // These buttons sit inside link cards on the feed.
    event.preventDefault();
    event.stopPropagation();

    const next = !optimistic;
    setOptimistic(next);
    setBusy(true);

    const result = await toggleSaveAction(opportunityId);
    setBusy(false);

    if (!result.ok) {
      setOptimistic(!next); // roll back
      return;
    }

    setOptimistic(Boolean(result.saved));
    if (result.saved) {
      reward({
        xp: result.xpAwarded,
        achievements: result.newAchievements,
        message: "Saved — deadline added to your dashboard",
      });
    }
    router.refresh();
  }

  if (variant === "full") {
    return (
      <Button
        variant={optimistic ? "secondary" : "primary"}
        onClick={toggle}
        disabled={busy}
        className={className}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : optimistic ? (
          <BookmarkCheck className="size-4" />
        ) : (
          <Bookmark className="size-4" />
        )}
        {optimistic ? "Saved" : "Save opportunity"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={optimistic ? "Remove from saved" : "Save opportunity"}
      aria-pressed={optimistic}
      title={optimistic ? "Saved" : "Save"}
      className={clsx(
        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95",
        optimistic
          ? "border-[var(--color-arc-mid)] text-[var(--color-arc-mid)]"
          : "border-[var(--border-strong)] subtle hover:text-[var(--fg)]",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : optimistic ? (
        <BookmarkCheck className="size-3.5" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
    </button>
  );
}

/** Starts tracking an application. Separate from saving, and worth more XP. */
export function TrackApplicationButton({
  opportunityId,
  tracking,
}: {
  opportunityId: string;
  tracking: boolean;
}) {
  const router = useRouter();
  const reward = useReward();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(tracking);

  if (done) {
    return (
      <span className={buttonClass("secondary", "md", "pointer-events-none")}>
        <BookmarkCheck className="size-4" />
        Application tracked
      </span>
    );
  }

  return (
    <Button
      variant="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await startApplicationAction(opportunityId);
        setBusy(false);
        if (result.ok) {
          setDone(true);
          reward({
            xp: 40,
            achievements: result.newAchievements,
            message: "Application tracked",
          });
          router.refresh();
        }
      }}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
      I am applying to this
    </Button>
  );
}
