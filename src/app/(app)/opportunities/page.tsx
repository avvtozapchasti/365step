import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Compass, Info } from "lucide-react";

import { OpportunityCard } from "@/components/opportunity-card";
import { OpportunityFilters } from "@/components/opportunity-filters";
import { RewardProvider } from "@/components/reward-toast";
import { Badge, Card, EmptyState, SkeletonCard } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { rankOpportunities } from "@/lib/match";
import {
  getOpportunities,
  getPrimaryGoal,
  getProfile,
  getSavedOpportunityIds,
} from "@/lib/queries";
import { subjectLabel } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Opportunities" };
export const dynamic = "force-dynamic";

export default function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; filter?: string; q?: string }>;
}) {
  return (
    <RewardProvider>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </RewardProvider>
  );
}

async function Feed({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; filter?: string; q?: string }>;
}) {
  const [user, query] = await Promise.all([currentUser(), searchParams]);
  if (!user) redirect("/signin");

  const [profile, goal] = await Promise.all([getProfile(user.id), getPrimaryGoal(user.id)]);
  if (!profile) redirect("/onboarding");

  const [opportunities, savedIds] = await Promise.all([
    getOpportunities(),
    getSavedOpportunityIds(user.id),
  ]);

  const context = {
    profile,
    goalSlug: goal?.slug ?? null,
    goalTitle: goal?.title ?? null,
    savedIds,
  };

  const view = query.filter ?? "";

  const matched = rankOpportunities(opportunities, context, {
    type: query.type ?? null,
    search: query.q ?? null,
    savedOnly: view === "saved",
    closingWithinDays: view === "closing" ? 30 : null,
    // The default view is the personalised one; "Everything" drops the floor.
    minScore: view === "" ? 30 : undefined,
  });

  // Counts for the filter chips, computed against the current view so the
  // numbers match what clicking one would actually show.
  const scopeForCounts = rankOpportunities(opportunities, context, {
    savedOnly: view === "saved",
    closingWithinDays: view === "closing" ? 30 : null,
    minScore: view === "" ? 30 : undefined,
  });

  const counts: Record<string, number> = { saved: savedIds.size };
  for (const opportunity of scopeForCounts) {
    counts[opportunity.type] = (counts[opportunity.type] ?? 0) + 1;
  }

  const strong = matched.filter((o) => o.score >= 85).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1.5">Opportunities</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {view === "saved"
            ? "Saved opportunities"
            : view === "closing"
              ? "Closing within 30 days"
              : view === "all"
                ? "Every opportunity"
                : "Matched to you"}
        </h1>

        <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
          {view === "saved" ? (
            <>
              Everything you have saved, with a live countdown. Saved deadlines also
              appear on your dashboard.
            </>
          ) : view === "all" ? (
            <>
              The full catalogue, still ranked by fit but with nothing filtered out.
            </>
          ) : (
            <>
              Ranked against your profile —{" "}
              <strong className="font-semibold text-[var(--fg)]">
                {profile.role === "school"
                  ? `Grade ${profile.grade}`
                  : profile.role === "university"
                    ? "university student"
                    : "graduate"}
              </strong>
              {profile.interests.length > 0 ? (
                <>
                  , interested in{" "}
                  <strong className="font-semibold text-[var(--fg)]">
                    {profile.interests.slice(0, 3).map(subjectLabel).join(", ")}
                  </strong>
                </>
              ) : null}
              {goal ? (
                <>
                  , working towards{" "}
                  <strong className="font-semibold text-[var(--fg)]">
                    {goal.title.toLowerCase()}
                  </strong>
                </>
              ) : null}
              . Every card explains its own position.
            </>
          )}
        </p>

        {strong > 0 && view === "" ? (
          <div className="mt-3">
            <Badge tone="calm">
              {strong} strong {strong === 1 ? "match" : "matches"}
            </Badge>
          </div>
        ) : null}
      </header>

      <OpportunityFilters counts={counts} />

      {/* Provenance, stated once and plainly. */}
      <Card className="flex items-start gap-3 p-4">
        <Info className="subtle mt-0.5 size-4 shrink-0" />
        <p className="muted text-xs leading-relaxed">
          Apply buttons lead to each programme&apos;s <strong>official site</strong> —
          365step never collects an application itself. Deadline dates in this build are
          indicative for the demo, so always confirm the real date on the official page.
          Entries marked <em>Demo example</em> are illustrations, not real programmes.
        </p>
      </Card>

      {matched.length === 0 ? (
        <EmptyState
          icon={<Compass className="size-5" />}
          title={view === "saved" ? "Nothing saved yet" : "No matches for those filters"}
          description={
            view === "saved"
              ? "Save an opportunity and it will appear here, with its deadline on your dashboard."
              : "Try clearing a filter, or switch to Everything to see the full catalogue."
          }
        />
      ) : (
        <>
          <p className="subtle nums text-xs">
            {matched.length} {matched.length === 1 ? "opportunity" : "opportunities"}
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {matched.map((opportunity, i) => (
              <div
                key={opportunity.id}
                style={{ animation: `rise 0.4s ${Math.min(i, 8) * 0.04}s both` }}
              >
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-8 w-64" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    </div>
  );
}
