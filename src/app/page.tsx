import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  LineChart,
  Map,
  Microscope,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

import { DemoLoginButton } from "@/components/demo-login-button";
import { Badge, ButtonLink, Logo, ProgressRing } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { scalar } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * The landing page has one job: make a first-time visitor understand what this
 * is, who it is for, and how it works — before they scroll. Everything below the
 * hero is there to answer the follow-up questions, in the order they come.
 */
export default async function LandingPage() {
  // Someone already signed in has no use for the pitch.
  if (await currentUser()) redirect("/dashboard");

  // Real counts, read from the database. The point of putting them on the
  // landing page is that they are not marketing numbers — they are what is
  // actually in the product.
  const [lessons, courses, opportunities, realOpportunities] = await Promise.all([
    scalar("SELECT COUNT(*) FROM lessons"),
    scalar("SELECT COUNT(*) FROM courses"),
    scalar("SELECT COUNT(*) FROM opportunities"),
    scalar("SELECT COUNT(*) FROM opportunities WHERE is_demo = 0"),
  ]);

  return (
    <div className="relative overflow-hidden">
      {/* Ambient gradient — subtle, and behind everything. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[72rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-arc-mid), var(--color-arc-end) 55%, transparent)",
        }}
      />

      <SiteNav />

      {/* ================================================================ hero */}
      <header className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="animate-[rise_0.5s_both]">
            <Badge tone="outline" className="mb-5">
              <Sparkles className="size-3" />
              A personal path of development, every single day
            </Badge>

            <h1 className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.1rem]">
              One year.
              <br />
              <span className="arc-text">365 steps.</span>
              <br />
              One big goal.
            </h1>

            <p className="muted mt-6 max-w-lg text-[1.0625rem] leading-relaxed sm:text-lg">
              Turn your ambitions into small daily actions. 365step takes the goal that
              feels too big — a top university, a research paper, your first
              internship — and gives you the ten minutes that move it forward today.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/signup" size="lg" className="group">
                Start your journey
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </ButtonLink>
              <DemoLoginButton size="lg" variant="secondary">
                Try the live demo
              </DemoLoginButton>
            </div>

            <p className="subtle mt-4 text-xs">
              The demo opens a seeded account on day 37 of its journey — a real dashboard,
              not a screenshot.
            </p>
          </div>

          <HeroPreview />
        </div>
      </header>

      {/* ============================================================= the arc */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow mb-6 text-center">How a goal becomes a result</p>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Discover", icon: Compass },
            { label: "Plan", icon: Map },
            { label: "Learn", icon: BookOpen },
            { label: "Practice", icon: Target },
            { label: "Apply", icon: Trophy },
            { label: "Achieve", icon: GraduationCap },
          ].map(({ label, icon: Icon }, i) => (
            <li
              key={label}
              className="surface flex items-center gap-2.5 px-3.5 py-3"
              style={{ animation: `rise 0.4s ${i * 0.06}s both` }}
            >
              <Icon className="size-4 shrink-0" style={{ color: "var(--color-arc-mid)" }} />
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ========================================================== the problem */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">The problem</p>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
            Opportunities are everywhere. The problem is knowing{" "}
            <span className="arc-text">which ones matter to you</span> — and what to do
            next.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="surface-panel p-7">
            <Badge tone="urgent" className="mb-4">
              Discovery problem
            </Badge>
            <h3 className="text-lg font-semibold">You do not know what exists</h3>
            <p className="muted mt-2.5 text-sm leading-relaxed">
              Olympiads, research programmes, summer schools, scholarships, internships —
              scattered across dozens of sites, each with its own deadline. Most students
              never hear about the programme they would have been perfect for.
            </p>
          </article>

          <article className="surface-panel p-7">
            <Badge tone="soon" className="mb-4">
              Execution problem
            </Badge>
            <h3 className="text-lg font-semibold">Knowing is not enough</h3>
            <p className="muted mt-2.5 text-sm leading-relaxed">
              Even when you find it, you face a mountain of theory, no plan, and no idea
              what to do today. Motivation runs out somewhere in week two, and the
              deadline passes.
            </p>
          </article>
        </div>
      </section>

      {/* ========================================================= four pillars */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow mb-3 text-center">What is inside</p>
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Four things, joined up
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Pillar
            icon={<BookOpen className="size-5" />}
            colour="var(--color-kind-learn)"
            title="Learning"
            body="Short lessons built as explanation, example, then questions with real feedback. Never a wall of theory."
            stat={`${lessons} lessons · ${courses} courses`}
          />
          <Pillar
            icon={<Compass className="size-5" />}
            colour="var(--color-kind-opportunity)"
            title="Opportunities"
            body="A feed ranked by your profile, each card saying why it matches you. Applications happen on the official site."
            stat={`${realOpportunities} real programmes`}
          />
          <Pillar
            icon={<Layers className="size-5" />}
            colour="var(--color-kind-build)"
            title="Projects"
            body="A portfolio that grows a little at a time, because a finished small project beats an abandoned ambitious one."
            stat="Portfolio tracking"
          />
          <Pillar
            icon={<LineChart className="size-5" />}
            colour="var(--color-kind-practice)"
            title="Progress"
            body="XP, streaks, levels and a roadmap you can actually see — so the year of small steps adds up visibly."
            stat="365-day view"
          />
        </div>
      </section>

      {/* ============================================================ the shift */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="surface-panel overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-[var(--border)] p-8 md:border-b-0 md:border-r sm:p-10">
              <p className="eyebrow mb-5">What other products say</p>
              <ul className="space-y-4">
                {[
                  "Study SAT for six hours.",
                  "Write a research paper.",
                  "Apply to the programme.",
                  "Build a portfolio.",
                ].map((text) => (
                  <li key={text} className="subtle flex items-start gap-3 text-[15px]">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--fg-subtle)]" />
                    <span className="line-through decoration-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 sm:p-10">
              <p className="eyebrow mb-5" style={{ color: "var(--color-arc-mid)" }}>
                What 365step says
              </p>
              <ul className="space-y-4">
                {[
                  "Today: 12 minutes on transitions.",
                  "Today: find one research question.",
                  "Today: check eligibility.",
                  "Today: name the problem your project solves.",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-[15px] font-medium">
                    <Timer
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--color-arc-mid)" }}
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <p className="muted mt-6 text-sm leading-relaxed">
                Same destination. The difference is that one of these is something you can
                actually do before dinner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== who it's for */}
      <section id="who" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow mb-3 text-center">Who it is for</p>
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          One system, three starting points
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Audience
            icon={<GraduationCap className="size-5" />}
            title="School students"
            body="University admissions, SAT and IELTS, olympiads, first research, summer programmes, scholarships, portfolio."
          />
          <Audience
            icon={<Microscope className="size-5" />}
            title="University students"
            body="Internships, research positions, exchange programmes, competitions, CV and interview preparation."
          />
          <Audience
            icon={<Trophy className="size-5" />}
            title="Graduates"
            body="Entry-level roles, fellowships, certifications, professional development and portfolio work."
          />
        </div>
      </section>

      {/* ============================================================== the AI */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="surface-panel grid gap-8 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge tone="xp" className="mb-4">
              <Sparkles className="size-3" />
              AI Growth Assistant
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Not a chatbot. A layer that reads your actual progress.
            </h2>
            <p className="muted mt-4 text-sm leading-relaxed">
              The assistant looks at what you have finished, where your scores are weak,
              which deadlines are closing and what you have saved — then answers one
              question: <strong className="font-semibold text-[var(--fg)]">what should I
              do today?</strong> Every number it cites comes from your own data.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              "You completed 4 SAT Math lessons this week, but nothing in Reading yet.",
              "You have 3 research opportunities closing within 14 days.",
              "You scored 62% on Command of Evidence. Worth one more pass.",
            ].map((text, i) => (
              <div
                key={text}
                className="surface flex items-start gap-3 p-4"
                style={{ animation: `rise 0.4s ${0.1 + i * 0.08}s both` }}
              >
                <Sparkles
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: "var(--color-xp)" }}
                />
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <ProgressRing value={10} size={92} stroke={7}>
            <span className="nums text-lg font-semibold">1</span>
            <span className="subtle text-[10px]">of 365</span>
          </ProgressRing>

          <h2 className="mt-8 text-balance text-3xl font-semibold tracking-tight sm:text-[2.6rem]">
            The first step is the only one you have to take today.
          </h2>
          <p className="muted mx-auto mt-4 max-w-lg text-[15px] leading-relaxed">
            Answer six questions, get a roadmap built around your goal, and find out what
            your ten minutes should go on.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg" className="group">
              Start your journey
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <DemoLoginButton size="lg" variant="secondary">
              Explore the demo account
            </DemoLoginButton>
          </div>

          <p className="subtle mt-10 text-xs leading-relaxed">
            {realOpportunities} of the {opportunities} opportunities in this build are real
            programmes linked to their official pages. Illustrative examples are labelled
            as such. Deadline dates shown in the demo are indicative — always confirm on
            the official site.
          </p>
        </div>
      </section>

      <footer className="hairline mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Logo className="text-sm" />
          <p className="subtle text-xs">
            Built for VentureHack EduTech · turning ambition into consistent action
          </p>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------------- pieces ---

function SiteNav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Logo className="text-xl" />
      <div className="flex items-center gap-1.5 sm:gap-3">
        <Link
          href="#how"
          className="muted hidden rounded-full px-3 py-2 text-sm transition-colors hover:text-[var(--fg)] sm:block"
        >
          How it works
        </Link>
        <Link
          href="#who"
          className="muted hidden rounded-full px-3 py-2 text-sm transition-colors hover:text-[var(--fg)] sm:block"
        >
          Who it is for
        </Link>
        <ButtonLink href="/signin" variant="ghost" size="sm">
          Sign in
        </ButtonLink>
        <ButtonLink href="/signup" size="sm">
          Get started
        </ButtonLink>
      </div>
    </nav>
  );
}

/**
 * A static preview of the real dashboard. Deliberately hand-built rather than a
 * screenshot so it stays in step with the product's visual language, and so it
 * renders crisply at any width.
 */
function HeroPreview() {
  const steps = [
    { n: "01", kind: "Learn", context: "SAT Reading", title: "Transition words", mins: 8 },
    { n: "02", kind: "Practice", context: "5 questions", title: "Apply what you read", mins: 10 },
    { n: "03", kind: "Build", context: "Research", title: "Find one research topic", mins: 15 },
    { n: "04", kind: "Opportunity", context: "MIT PRIMES", title: "Check eligibility", mins: 3 },
  ];

  const kindColour: Record<string, string> = {
    Learn: "var(--color-kind-learn)",
    Practice: "var(--color-kind-practice)",
    Build: "var(--color-kind-build)",
    Opportunity: "var(--color-kind-opportunity)",
  };

  return (
    <div className="animate-[drift_0.6s_0.15s_both]">
      <div className="surface-panel shadow-lift overflow-hidden p-5 sm:p-6">
        {/* header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="subtle text-xs">Good morning, Alex</p>
            <p className="mt-0.5 truncate text-sm font-semibold">
              Get into a top engineering university
            </p>
          </div>
          <Badge tone="streak">
            <Flame className="size-3" />
            12 day streak
          </Badge>
        </div>

        {/* arc */}
        <div className="mt-5 flex items-center gap-5">
          <ProgressRing value={(37 / 365) * 100} size={104} stroke={8}>
            <span className="nums text-2xl font-semibold leading-none">37</span>
            <span className="subtle text-[10px]">of 365</span>
          </ProgressRing>

          <div className="min-w-0 flex-1 space-y-2.5">
            <MiniStat label="Level 7 · Explorer" value="3,229 XP" pct={41} />
            <MiniStat label="Lessons complete" value="14" pct={39} />
            <MiniStat label="Today" value="36 min planned" pct={0} />
          </div>
        </div>

        {/* today's steps */}
        <div className="hairline mt-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Today&apos;s steps</p>
            <span className="subtle text-[11px]">4 small actions</span>
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.n} className="sunken flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="nums subtle w-5 shrink-0 text-[11px] font-semibold">
                  {step.n}
                </span>
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: kindColour[step.kind] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight">{step.title}</p>
                  <p className="subtle truncate text-[11px]">
                    {step.kind} · {step.context}
                  </p>
                </div>
                <span className="nums subtle shrink-0 text-[11px]">{step.mins}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* deadline */}
        <div className="hairline mt-4 flex items-center gap-2.5 pt-4">
          <Calendar className="size-3.5 shrink-0" style={{ color: "var(--color-urgent)" }} />
          <p className="min-w-0 flex-1 truncate text-[12px]">
            <span className="font-medium">Simons Summer Research</span>
            <span className="subtle"> · closes soon</span>
          </p>
          <Badge tone="urgent">12 days</Badge>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="subtle truncate text-[11px]">{label}</span>
        <span className="nums shrink-0 text-[11px] font-semibold">{value}</span>
      </div>
      <div className="sunken h-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-arc-start),var(--color-arc-end))]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Pillar({
  icon,
  colour,
  title,
  body,
  stat,
}: {
  icon: React.ReactNode;
  colour: string;
  title: string;
  body: string;
  stat: string;
}) {
  return (
    <article className="surface flex flex-col p-6">
      <div
        className="mb-4 flex size-10 items-center justify-center rounded-xl"
        style={{
          background: `color-mix(in oklab, ${colour} 13%, transparent)`,
          color: colour,
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="muted mt-2 flex-1 text-sm leading-relaxed">{body}</p>
      <p className="subtle mt-4 text-[11px] font-medium uppercase tracking-wider">{stat}</p>
    </article>
  );
}

function Audience({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="surface-panel p-7">
      <div className="sunken mb-4 flex size-10 items-center justify-center rounded-xl">{icon}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="muted mt-2 text-sm leading-relaxed">{body}</p>
    </article>
  );
}
