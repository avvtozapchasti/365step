import Link from "next/link";
import { CalendarCheck2, ExternalLink } from "lucide-react";

import { deadlineLabel, formatDate } from "@/lib/date";
import type { UserDeadline } from "@/lib/types";
import { Badge, EmptyState, UrgencyDot } from "./ui";

/**
 * The user's tracked deadlines, soonest first. Saving an opportunity with a
 * deadline adds it here automatically, which is what makes the save button on
 * the opportunity page worth pressing.
 */
export function DeadlineList({
  deadlines,
  limit,
}: {
  deadlines: UserDeadline[];
  limit?: number;
}) {
  const shown = limit ? deadlines.slice(0, limit) : deadlines;

  if (shown.length === 0) {
    return (
      <EmptyState
        icon={<CalendarCheck2 className="size-5" />}
        title="No deadlines tracked"
        description="Save an opportunity and its deadline appears here with a live countdown."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {shown.map((deadline) => {
        const tone =
          deadline.daysLeft < 0
            ? "neutral"
            : deadline.daysLeft <= 7
              ? "urgent"
              : deadline.daysLeft <= 30
                ? "soon"
                : "calm";

        const body = (
          <>
            <UrgencyDot daysLeft={deadline.daysLeft} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-snug">
                {deadline.title}
              </span>
              <span className="subtle block text-[11px]">{formatDate(deadline.dueDate)}</span>
            </span>
            <Badge tone={tone} className="shrink-0">
              {deadlineLabel(deadline.daysLeft)}
            </Badge>
            {deadline.opportunitySlug ? (
              <ExternalLink className="subtle size-3.5 shrink-0" />
            ) : null}
          </>
        );

        return (
          <li key={deadline.id}>
            {deadline.opportunitySlug ? (
              <Link
                href={`/opportunities/${deadline.opportunitySlug}`}
                className="surface flex items-center gap-3 px-3.5 py-3 transition-all hover:shadow-soft"
              >
                {body}
              </Link>
            ) : (
              <div className="surface flex items-center gap-3 px-3.5 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
