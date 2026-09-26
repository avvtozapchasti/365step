import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe,
  GraduationCap,
  Info,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { RewardProvider } from "@/components/reward-toast";
import { SaveButton, TrackApplicationButton } from "@/components/save-button";
import {
  Badge,
  Card,
  Panel,
  SectionHeader,
  UrgencyDot,
  buttonClass,
} from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { deadlineLabel, formatDateLong, urgency } from "@/lib/date";
import { rankOpportunities, scoreOpportunity } from "@/lib/match";
import {
  getOpportunities,
  getOpportunityBySlug,
  getPrimaryGoal,
  getProfile,
  getSavedOpportunityIds,
  hasApplication,
} from "@/lib/queries";
import { opportunityTypeLabel, subjectLabel } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  return { title: opportunity?.title ?? "Opportunity" };
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [user, { slug }] = await Promise.all([currentUser(), params]);
  if (!user) redirect("/signin");

  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) notFound();

  const [profile, goal, savedIds, tracking, all] = await Promise.all([
    getProfile(user.id),
    getPrimaryGoal(user.id),
    getSavedOpportunityIds(user.id),
    hasApplication(user.id, opportunity.id),
    getOpportunities(),
  ]);
  if (!profile) redirect("/onboarding");

  const context = {
    profile,
    goalSlug: goal?.slug ?? null,
    goalTitle: goal?.title ?? null,
    savedIds,
  };

  const matched = scoreOpportunity(opportunity, context);
  const band = urgency(matched.daysLeft);

  // Related: same type or overlapping subjects, ranked for this user.
  const related = rankOpportunities(
    all.filter(
      (o) =>
        o.id !== opportunity.id &&
        (o.type === opportunity.type ||
          o.subjects.some((s) => opportunity.subjects.includes(s))),
    ),
    context,
    { limit: 3, minScore: 40 },
  );

  return (
    <RewardProvider>
      <div className="space-y-7">
        <Link
          href="/opportunities"
          className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft className="size-3.5" />
          Opportunities
        </Link>

        {/* ===================================================== demo notice */}
        {opportunity.isDemo ? (
          <Card
            className="flex items-start gap-3 p-4"
            style={{
              borderColor: "color-mix(in oklab, var(--color-soon) 40%, transparent)",
              background: "color-mix(in oklab, var(--color-soon) 6%, transparent)",
            }}
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "var(--color-soon)" }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold">This is a demo example, not a real programme</p>
              <p className="muted mt-1 text-xs leading-relaxed">{opportunity.sourceNote}</p>
            </div>
          </Card>
        ) : null}

        {/* ========================================================== header */}
        <header>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="outline">{opportunityTypeLabel(opportunity.type)}</Badge>
            <Badge tone={matched.score >= 85 ? "calm" : matched.score >= 60 ? "outline" : "neutral"}>
              {matched.matchLabel}
            </Badge>
            {opportunity.deadline ? (
              <Badge
                tone={
                  band === "critical"
                    ? "urgent"
                    : band === "soon"
                      ? "soon"
                      : band === "closed"
                        ? "neutral"
                        : "calm"
                }
              >
                <UrgencyDot daysLeft={matched.daysLeft} />
                {deadlineLabel(matched.daysLeft)}
              </Badge>
            ) : (
              <Badge tone="neutral">Rolling applications</Badge>
            )}
          </div>

          <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
            {opportunity.title}
          </h1>

          <p className="muted mt-2 flex items-center gap-1.5 text-sm">
            <Building2 className="size-3.5" />
            {opportunity.organization}
          </p>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">{opportunity.summary}</p>

          {/* actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {opportunity.isDemo ? (
              <span
                className={buttonClass("secondary", "md", "pointer-events-none opacity-60")}
                title="Demo entries have no application link"
              >
                No application link — demo entry
              </span>
            ) : (
              <a
                href={opportunity.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "md")}
              >
                Open the official site
                <ExternalLink className="size-3.5" />
              </a>
            )}

            <SaveButton opportunityId={opportunity.id} saved={matched.saved} variant="full" />

            {matched.saved ? (
              <TrackApplicationButton opportunityId={opportunity.id} tracking={tracking} />
            ) : null}
          </div>

          <p className="subtle mt-3 max-w-xl text-xs leading-relaxed">
            365step helps you find the opportunity and prepare for it. The application
            itself always happens on the organisation&apos;s own site.
          </p>
        </header>

        {/* ================================================= why it matches */}
        {matched.reasons.length > 0 ? (
          <Panel className="p-5 sm:p-6">
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Why this matches you
            </p>
            <ul className="space-y-2">
              {matched.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: "var(--color-done)" }}
                  />
                  <span className="text-sm leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {/* ============================================================ facts */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact
            icon={<CalendarDays className="size-4" />}
            label="Deadline"
            value={opportunity.deadline ? formatDateLong(opportunity.deadline) : "Rolling"}
            hint={
              opportunity.deadline
                ? `${deadlineLabel(matched.daysLeft)} · indicative, confirm officially`
                : "Check the official site for the current window"
            }
          />
          <Fact
            icon={
              opportunity.format === "remote" ? (
                <Globe className="size-4" />
              ) : (
                <MapPin className="size-4" />
              )
            }
            label="Location"
            value={opportunity.location}
            hint={opportunity.country}
          />
          <Fact
            icon={<Wallet className="size-4" />}
            label="Cost"
            value={opportunity.cost}
          />
          <Fact
            icon={<Users className="size-4" />}
            label="Open to"
            value={opportunity.audiences
              .map((a) =>
                a === "school" ? "School students" : a === "university" ? "University" : "Graduates",
              )
              .join(", ")}
            hint={
              opportunity.minGrade || opportunity.maxGrade
                ? `Grades ${opportunity.minGrade ?? "any"}–${opportunity.maxGrade ?? "any"}`
                : undefined
            }
          />
        </div>

        {/* ====================================================== description */}
        <section>
          <SectionHeader eyebrow="About" title="What it is" />
          <Card className="p-5 sm:p-6">
            <p className="text-[15px] leading-relaxed">{opportunity.description}</p>
          </Card>
        </section>

        {/* ====================================================== eligibility */}
        {opportunity.eligibility.length > 0 ? (
          <section>
            <SectionHeader
              eyebrow="Before you apply"
              title="Eligibility"
              description="Checking this takes three minutes and saves you from writing an application you cannot submit."
            />
            <Card className="p-5 sm:p-6">
              <ul className="space-y-2.5">
                {opportunity.eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <GraduationCap className="subtle mt-0.5 size-4 shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ) : null}

        {/* ============================================================= tags */}
        {opportunity.tags.length > 0 || opportunity.subjects.length > 0 ? (
          <section>
            <p className="eyebrow mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => (
                <Badge key={tag} tone="neutral">
                  {tag}
                </Badge>
              ))}
              {opportunity.subjects.map((subject) => (
                <Badge key={subject} tone="outline">
                  {subjectLabel(subject)}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {/* ========================================================= sourcing */}
        {opportunity.sourceNote && !opportunity.isDemo ? (
          <Card className="flex items-start gap-3 p-4">
            <Info className="subtle mt-0.5 size-4 shrink-0" />
            <p className="muted text-xs leading-relaxed">{opportunity.sourceNote}</p>
          </Card>
        ) : null}

        {/* ========================================================== related */}
        {related.length > 0 ? (
          <section>
            <SectionHeader
              eyebrow="Also worth a look"
              title="Related to this"
              description="Same kind of opportunity, or overlapping with your subjects."
            />
            <ul className="space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/opportunities/${item.slug}`}
                    className="surface group flex items-center gap-3 p-4 transition-all hover:shadow-soft"
                  >
                    <UrgencyDot daysLeft={item.daysLeft} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="subtle truncate text-[11px]">
                        {item.organization} · {opportunityTypeLabel(item.type)}
                      </span>
                    </span>
                    <Badge tone="outline" className="shrink-0">
                      {deadlineLabel(item.daysLeft)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </RewardProvider>
  );
}

function Fact({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="subtle mb-2 flex items-center gap-2">
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <p className="text-sm font-medium leading-snug">{value}</p>
      {hint ? <p className="subtle mt-0.5 text-[11px] leading-relaxed">{hint}</p> : null}
    </Card>
  );
}
