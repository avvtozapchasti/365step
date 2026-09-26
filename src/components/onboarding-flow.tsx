"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

import { completeOnboardingAction, type OnboardingAnswers } from "@/actions/onboarding";
import {
  DAILY_MINUTES,
  GOALS,
  ROLES,
  SECONDARY_GOALS,
  SKILL_LEVELS,
  SUBJECTS,
  goalsForRole,
} from "@/lib/taxonomy";
import type { Role, SkillLevel } from "@/lib/types";
import { Button, ErrorNote, Input, Logo, Panel } from "./ui";

/**
 * Six-step onboarding.
 *
 * Kept as one client component with local state: the answers only become server
 * state at the end, so a half-finished onboarding leaves nothing behind, and the
 * back button genuinely works.
 */

const STEP_TITLES = [
  "Who are you?",
  "What is the goal?",
  "What interests you?",
  "How much time each day?",
  "Where are you starting?",
  "Anything else?",
];

const TOTAL_STEPS = STEP_TITLES.length;

export function OnboardingFlow({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [role, setRole] = useState<Role | null>(null);
  const [grade, setGrade] = useState("");
  const [goalSlug, setGoalSlug] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState(20);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [targetDate, setTargetDate] = useState("");
  const [secondary, setSecondary] = useState<string[]>([]);

  const roleOption = ROLES.find((r) => r.value === role);
  const availableGoals = useMemo(() => (role ? goalsForRole(role) : GOALS), [role]);
  const chosenGoal = GOALS.find((g) => g.slug === goalSlug);

  // Changing role can invalidate an already-chosen goal, so drop it.
  function chooseRole(next: Role) {
    setRole(next);
    setGrade("");
    if (goalSlug && !GOALS.find((g) => g.slug === goalSlug)?.roles.includes(next)) {
      setGoalSlug("");
    }
  }

  const canAdvance = [
    role !== null && grade !== "",
    goalSlug !== "",
    interests.length > 0,
    DAILY_MINUTES.some((d) => d.value === dailyMinutes),
    Boolean(skillLevel),
    true, // final step is optional
  ][step];

  function next() {
    setError(null);
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }
    submit();
  }

  function submit() {
    if (!role) return;
    const answers: OnboardingAnswers = {
      role,
      grade,
      goalSlug,
      interests,
      dailyMinutes,
      skillLevel,
      targetDate: targetDate || null,
      secondary,
    };

    startTransition(async () => {
      const result = await completeOnboardingAction(answers);
      // A successful run redirects; anything returned here is a validation error.
      if (result?.error) {
        setError(result.error);
        setStep(0);
      }
    });
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string, max = 99) {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else if (list.length < max) setList([...list, value]);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* progress */}
      <div className="mb-7">
        <div className="mb-3 flex items-center justify-between">
          <Logo className="text-lg" />
          <span className="subtle nums text-xs">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i <= step
                  ? "bg-[linear-gradient(90deg,var(--color-arc-start),var(--color-arc-end))]"
                  : "sunken",
              )}
            />
          ))}
        </div>
      </div>

      <Panel className="p-6 sm:p-8">
        <div key={step} className="animate-[rise_0.35s_both]">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {step === 0 ? `Hi ${firstName}. ${STEP_TITLES[0]}` : STEP_TITLES[step]}
          </h1>

          {/* ---------------------------------------------------- step 0: role */}
          {step === 0 ? (
            <div className="mt-6 space-y-6">
              <p className="muted text-sm">
                This decides which goals, courses and opportunities you see.
              </p>

              <div className="grid gap-2.5">
                {ROLES.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    selected={role === option.value}
                    onClick={() => chooseRole(option.value)}
                    title={option.label}
                    description={option.blurb}
                  />
                ))}
              </div>

              {roleOption ? (
                <div className="animate-[rise_0.3s_both]">
                  <p className="mb-2.5 text-sm font-medium">{roleOption.gradeLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {roleOption.grades.map((g) => (
                      <Chip
                        key={g.value}
                        selected={grade === g.value}
                        onClick={() => setGrade(g.value)}
                      >
                        {g.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ---------------------------------------------------- step 1: goal */}
          {step === 1 ? (
            <div className="mt-6 space-y-5">
              <p className="muted text-sm">
                Pick the one that matters most. Your roadmap is built from this, and you
                can change it later.
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {availableGoals.map((goal) => (
                  <ChoiceCard
                    key={goal.slug}
                    selected={goalSlug === goal.slug}
                    onClick={() => setGoalSlug(goal.slug)}
                    title={goal.title}
                    description={goal.blurb}
                  />
                ))}
              </div>

              {chosenGoal ? (
                <div className="sunken animate-[rise_0.3s_both] rounded-xl p-3.5">
                  <p className="text-sm">
                    <span className="eyebrow">Your dashboard will read</span>
                    <br />
                    <span className="mt-1 inline-block font-medium">{chosenGoal.headline}</span>
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ----------------------------------------------- step 2: interests */}
          {step === 2 ? (
            <div className="mt-6 space-y-5">
              <p className="muted text-sm">
                Choose up to six. This is what makes your opportunity feed yours rather
                than a generic list.
              </p>

              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <Chip
                    key={subject.slug}
                    selected={interests.includes(subject.slug)}
                    onClick={() => toggle(interests, setInterests, subject.slug, 6)}
                  >
                    <span aria-hidden className="mr-1">
                      {subject.emoji}
                    </span>
                    {subject.label}
                  </Chip>
                ))}
              </div>

              <p className="subtle nums text-xs">{interests.length} of 6 selected</p>
            </div>
          ) : null}

          {/* --------------------------------------------------- step 3: time */}
          {step === 3 ? (
            <div className="mt-6 space-y-5">
              <p className="muted text-sm">
                Be honest rather than ambitious — this sets how many steps land in your
                plan each day. Twenty minutes done daily beats two hours done once.
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {DAILY_MINUTES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDailyMinutes(option.value)}
                    className={clsx(
                      "rounded-xl border p-4 text-center transition-all",
                      dailyMinutes === option.value
                        ? "border-[var(--fg)] bg-[var(--bg-sunken)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]",
                    )}
                  >
                    <span className="nums block text-lg font-semibold">{option.label}</span>
                    <span className="subtle mt-0.5 block text-[11px] leading-tight">
                      {option.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* -------------------------------------------------- step 4: level */}
          {step === 4 ? (
            <div className="mt-6 space-y-5">
              <p className="muted text-sm">
                This sets the difficulty of the lessons we start you on.
              </p>

              <div className="grid gap-2.5">
                {SKILL_LEVELS.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    selected={skillLevel === option.value}
                    onClick={() => setSkillLevel(option.value)}
                    title={option.label}
                    description={option.blurb}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* ------------------------------------------------- step 5: extras */}
          {step === 5 ? (
            <div className="mt-6 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium">
                  Is there a date you are working towards?
                </p>
                <p className="subtle mb-2.5 text-xs">
                  Optional. A test date, an application deadline — anything real.
                </p>
                <Input
                  type="date"
                  value={targetDate}
                  min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Anything else you want out of the year?</p>
                <p className="subtle mb-2.5 text-xs">
                  Optional. These nudge your opportunity feed without changing your main
                  roadmap.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SECONDARY_GOALS.map((option) => (
                    <Chip
                      key={option.slug}
                      selected={secondary.includes(option.slug)}
                      onClick={() => toggle(secondary, setSecondary, option.slug)}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <Summary
                role={roleOption?.label ?? ""}
                grade={roleOption?.grades.find((g) => g.value === grade)?.label ?? ""}
                goal={chosenGoal?.headline ?? ""}
                interests={interests}
                dailyMinutes={dailyMinutes}
              />
            </div>
          ) : null}

          {error ? (
            <div className="mt-5">
              <ErrorNote>{error}</ErrorNote>
            </div>
          ) : null}
        </div>

        {/* navigation */}
        <div className="hairline mt-7 flex items-center justify-between gap-3 pt-5">
          <Button
            variant="ghost"
            onClick={() => {
              setError(null);
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0 || pending}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <Button onClick={next} disabled={!canAdvance || pending} size="lg">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending
              ? "Building your roadmap…"
              : step === TOTAL_STEPS - 1
                ? "Build my roadmap"
                : "Continue"}
            {pending ? null : step === TOTAL_STEPS - 1 ? (
              <Sparkles className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </Button>
        </div>
      </Panel>

      <p className="subtle mt-5 text-center text-xs">
        Nothing is saved until the last step, so you can change any answer on the way.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------- pieces ---

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-[var(--fg)] bg-[var(--bg-sunken)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]",
      )}
    >
      <span
        className={clsx(
          "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-all",
          selected ? "border-[var(--fg)] bg-[var(--fg)]" : "border-[var(--border-strong)]",
        )}
      >
        {selected ? <Check className="size-3 text-[var(--bg-raised)]" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-snug">{title}</span>
        <span className="muted mt-0.5 block text-xs leading-relaxed">{description}</span>
      </span>
    </button>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all active:scale-[0.97]",
        selected
          ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg-raised)]"
          : "border-[var(--border-strong)] hover:bg-[var(--bg-sunken)]",
      )}
    >
      {children}
    </button>
  );
}

function Summary({
  role,
  grade,
  goal,
  interests,
  dailyMinutes,
}: {
  role: string;
  grade: string;
  goal: string;
  interests: string[];
  dailyMinutes: number;
}) {
  const labels = interests
    .map((slug) => SUBJECTS.find((s) => s.slug === slug)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="sunken rounded-xl p-4">
      <p className="eyebrow mb-3">What we will build</p>
      <dl className="space-y-2 text-sm">
        <Row label="Goal" value={goal} />
        <Row label="Profile" value={[role, grade].filter(Boolean).join(" · ")} />
        <Row label="Focus" value={labels} />
        <Row label="Each day" value={`${dailyMinutes} minutes · 3–5 small steps`} />
        <Row label="Plan" value="12 monthly milestones over 365 days" />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="subtle w-16 shrink-0 text-xs">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{value}</dd>
    </div>
  );
}
