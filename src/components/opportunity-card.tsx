import Link from "next/link";
import { ArrowRight, Globe, MapPin, Sparkles, Wallet } from "lucide-react";

import { deadlineLabel, formatDate } from "@/lib/date";
import { opportunityTypeLabel } from "@/lib/taxonomy";
import type { MatchedOpportunity } from "@/lib/types";
import { SaveButton } from "./save-button";
import { Badge, Card, UrgencyDot } from "./ui";

/**
 * One opportunity in the feed.
 *
 * The "why this matches you" line is not decoration — it is the difference
 * between a ranked list and a list that happens to be in an order. Every card
 * has to be able to justify its own position.
 */
export function OpportunityCard({ opportunity }: { opportunity: MatchedOpportunity }) {
  const tone =
    opportunity.daysLeft === null
      ? "neutral"
      : opportunity.daysLeft < 0
        ? "neutral"
        : opportunity.daysLeft <= 7
          ? "urgent"
          : opportunity.daysLeft <= 30
            ? "soon"
            : "calm";

  return (
    <Card className="group relative flex flex-col p-5 transition-all hover:shadow-lift">
      {/* type + deadline */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge tone="outline">{opportunityTypeLabel(opportunity.type)}</Badge>
          {opportunity.isDemo ? (
            <Badge tone="neutral" className="text-[10px]">
              Demo example
            </Badge>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={tone}>
            <UrgencyDot daysLeft={opportunity.daysLeft} />
            {deadlineLabel(opportunity.daysLeft)}
          </Badge>
          <SaveButton opportunityId={opportunity.id} saved={opportunity.saved} />
        </div>
      </div>

      {/* title */}
      <Link href={`/opportunities/${opportunity.slug}`} className="min-w-0">
        <h3 className="text-[17px] font-semibold leading-snug">{opportunity.title}</h3>
        <p className="subtle mt-0.5 truncate text-xs">{opportunity.organization}</p>
      </Link>

      <p className="muted mt-2.5 flex-1 text-[13px] leading-relaxed">{opportunity.summary}</p>

      {/* why it matches — the point of the whole feed */}
      {opportunity.reasons.length > 0 ? (
        <div className="sunken mt-4 rounded-xl p-3">
          <p className="eyebrow mb-1.5 flex items-center gap-1.5">
            <Sparkles className="size-3" />
            Why this matches you
          </p>
          <ul className="space-y-1">
            {opportunity.reasons.map((reason) => (
              <li key={reason} className="text-[12px] leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* facts */}
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
        <div className="subtle flex items-center gap-1.5">
          {opportunity.format === "remote" ? (
            <Globe className="size-3" />
          ) : (
            <MapPin className="size-3" />
          )}
          <span className="truncate">{opportunity.country}</span>
        </div>
        <div className="subtle flex items-center gap-1.5">
          <Wallet className="size-3" />
          <span className="truncate">{opportunity.cost}</span>
        </div>
        {opportunity.deadline ? (
          <div className="subtle">{formatDate(opportunity.deadline)}</div>
        ) : null}
      </dl>

      <div className="hairline mt-4 flex items-center justify-between gap-3 pt-3.5">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="subtle text-[10px]">
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-70"
        >
          View
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
