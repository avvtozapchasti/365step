# 365step

**One year. 365 steps. One big goal.**

365step turns a big educational goal into small daily actions. You set a goal, get a
personalised twelve-month roadmap, and every day the product answers one question:
**what should I do today?** Usually the answer is ten to twenty minutes long.

Built for VentureHack EduTech.

```bash
npm install
npm run db:seed
npm run dev
```

Then open <http://localhost:3000> and click **Try the live demo** — no signup, no
credentials, no external services. The demo account is seeded on day 37 of its journey
with a 12-day streak, 14 completed lessons, four saved opportunities and two portfolio
projects, so the first screen means something.

**Deploying to Vercel with no setup?** It works — see
[Zero-config deploy](#zero-config-deploy-what-vercel-does-out-of-the-box) in Deployment for
what that gives you and where it stops.

---

## Contents

- [The problem](#the-problem)
- [The solution](#the-solution)
- [The demo flow](#the-demo-flow)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Database](#database)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Seed data](#seed-data)
- [AI integration](#ai-integration)
- [Deployment](#deployment)
- [Verification](#verification)
- [Design notes](#design-notes)
- [Deliberate limitations](#deliberate-limitations)
- [Future improvements](#future-improvements)

---

## The problem

> **Opportunities are everywhere. The problem is knowing which ones matter to you — and
> what to do next.**

Two problems, and almost every product solves only one:

**The discovery problem.** Olympiads, research programmes, summer schools, scholarships,
internships and competitions are scattered across dozens of sites, each with its own
deadline and eligibility rules. Most students never hear about the programme they would
have been perfect for.

**The execution problem.** Even after you find it, you face a mountain of theory, no
plan, and no idea what to do today. Motivation runs out around week two, progress is
invisible, and the deadline passes.

## The solution

365step joins the two together:

```
Discover → Plan → Learn → Practice → Apply → Achieve
```

A goal becomes a roadmap, the roadmap becomes today's three-to-five small steps, the
steps feed real learning and real applications, and progress is visible the whole way.

The design principle that governs everything: **never overload the person.** The product
does not say "study SAT for six hours." It says *today: 12 minutes on transitions.* It
does not say "write a research paper." It says *today: find one research question.*

---

## The demo flow

The single journey the product is built to do well:

1. **Landing** — the concept in one screen.
2. **Onboarding** — six questions: who you are, your goal, your interests, your daily
   minutes, your level, your target date.
3. **A personalised roadmap** is generated — twelve monthly milestones from the goal's
   template, with your own subject filled into the task copy.
4. **Dashboard** — your goal, day *N* of 365, your streak, and today's 3–5 steps.
5. **Complete a lesson** — short explanation, worked example, questions with instant
   feedback and explanations.
6. **Earn XP, extend the streak** — and watch the dashboard, roadmap and progress page
   all change, because the lesson closed its roadmap task and its daily step too.
7. **Opportunities** — a feed ranked against your profile, every card carrying its own
   *why this matches you*.
8. **Save one** — it appears on your dashboard with a live countdown.
9. **The assistant** reads the new state and tells you the next three things to do.

Every one of those steps writes to the database. None of it is mocked.

---

## Features

### The 365-day daily plan

Three to five small actions a day, generated from real state: the next unfinished lesson
on the most relevant course, retrieval practice on the last thing you learned, an open
task from the current roadmap milestone, and the best-matching opportunity you have not
looked at yet. Trimmed to the daily minutes you asked for — never a backlog of twenty
tasks.

Completing a step awards XP, extends the streak, records daily progress, and closes the
roadmap task it points at. Undo reverses the XP.

### Learning

Nine courses, 36 lessons, 109 questions across five tracks — SAT, IELTS, Research,
Projects and Career. Every lesson follows the same contract:

> **Learn → Practice → Feedback**

A short explanation (two or three paragraphs, never a textbook), one worked example, then
three to five questions where the explanation appears the moment you answer. Quizzes are
keyboard-driven: `1`–`4` to choose, `Enter` to continue.

Curated external material (Khan Academy, GitHub Docs) is linked where it helps — but
watching a video never completes a step. The questions do. That is deliberate.

### Opportunities

33 opportunities, 31 of them real programmes linked to their official pages: MIT PRIMES,
RSI, MITES, Regeneron ISEF and STS, Simons, Stanford SIMR, IMO, IOI, the US Physics Team,
FIRST Robotics, Conrad Challenge, Technovation, CERN, DAAD RISE, Google Summer of Code,
Google STEP, ETH Zurich, Erasmus+, Chevening, Fulbright, Knight-Hennessy, Rhodes, Hult
Prize, Kaggle, freeCodeCamp and more.

The feed is ranked by a transparent scoring function over your profile — role, grade,
subjects, goal, cost, format and deadline urgency — and **every card states its own
reasons**:

> Matches your interests in Engineering and Physics
> Advances your goal: get into a top engineering university
> Open to Grade 10 students

A Grade 10 engineering student and a second-year CS undergraduate get genuinely different
feeds; in the verification suite their top eight have zero overlap.

Saving an opportunity puts its deadline on your dashboard with a live countdown and a
red/amber/green urgency band. **Applications always happen on the organisation's own
site** — 365step helps you find it and prepare for it, and never pretends to collect an
application.

### Roadmap

Twelve monthly milestones generated from your goal, each with three to four tasks. Tasks
can point at real lessons and courses, so they are clickable rather than decorative.
Finishing a lesson ticks its task automatically. Completed months collapse, the current
month opens, future months are visible but locked.

Eight goal templates — university admissions, SAT, IELTS, research, portfolio,
internship, competitions, career skills — each a different twelve-month arc.

### Gamification

XP, 15 levels, daily streaks, 18 achievements. Restrained on purpose: it should feel like
a well-made product, not a children's game.

The award table is deliberately stingy — a lesson is worth more than a tap, shipping a
project is worth more than saving a bookmark — and the level curve is calibrated against
it, so a full 365 days of consistent use lands near level 15 rather than maxing out in
month five. Achievements are checked against real counters, so none of them can be
clicked into existence.

### Compete: friends, battles and the daily SAT challenge

One nav destination, three tabs, so the mobile tab bar doesn't have to grow by three.

**Friends.** Add someone by email, accept or decline requests, remove a friend. Stored as
one row per pair (`user_a < user_b`, canonically ordered) rather than two directional rows,
so "are these two friends" is always a single unambiguous query.

**Battles.** Challenge a friend to a head-to-head SAT quiz — five questions, the same set
for both players, chosen once at creation so neither side gets an easier draw. Whoever
scores higher wins; a tie is broken by speed. Correct answers are never sent to the client
before a player submits — the question payload carries only prompt and options, and the
grading breakdown arrives solely in the response to that one submission — so a battle
can't be solved by reading the page source.

**Daily SAT Challenge.** One fixed set of five SAT questions everyone sees that calendar
day, with a leaderboard ranked by score then speed. The set is chosen by a seeded shuffle
of the date string itself (a small dependency-free PRNG), so it is reproducible without
being precomputed and identical across SQLite and Postgres without leaning on either
dialect's own `RANDOM()`.

Both battles and the daily challenge share one quiz component
([`multi-question-quiz.tsx`](src/components/multi-question-quiz.tsx)): answer every
question, submit once, see the breakdown. Winning a battle, playing the daily challenge,
and making a friend all award XP and can unlock achievements — checked for whichever
player actually crossed the threshold, even when that isn't the one who triggered the
check (a battle you *lose* can still complete your opponent's fifth win and hand them
Battle Champion in the same request).

### Projects and portfolio

Full CRUD over a portfolio, plus a portfolio strength score weighted the way someone
reviewing it actually reads it: does it exist, is any of it finished, is it explained, can
I see the work. The score comes with specific advice on what would move it.

### Progress

Total XP, level ladder, streak, steps, lessons, learning minutes, saved opportunities,
applications, projects, achievements, a 28-day activity chart, a per-track learning
breakdown, and goal progress with a pace projection based on your actual rate rather than
an ideal one.

### AI Growth Assistant

See [AI integration](#ai-integration). Short version: it is a layer over your data, not a
chatbot, and it works with no API key.

### Error, empty and loading states

Skeletons on every route, empty states that explain the next action rather than just
saying "nothing here", an error boundary that recognises an unseeded database and prints
the command to fix it, and a 404 that offers somewhere useful to go.

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language  | TypeScript, `strict` |
| Styling   | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| UI        | Hand-written primitives in the shadcn/ui idiom |
| Icons     | lucide-react |
| Database  | SQLite locally, PostgreSQL / Supabase in production |
| Auth      | Email + password, scrypt, opaque server-side sessions |
| AI        | Anthropic Claude (`claude-opus-5`), optional |

Nine runtime dependencies in total, and `npm audit` reports zero vulnerabilities.

### Two decisions worth explaining

**1. SQLite locally, Postgres in production — not Supabase-only.**

The brief specified Supabase. A Supabase-only build cannot run until someone creates a
project, runs the SQL and sets credentials, which for a hackathon means the product is
only as reliable as the conference Wi-Fi. So the data layer is one async interface with
two drivers ([`src/lib/db/index.ts`](src/lib/db/index.ts)):

- no `DATABASE_URL` → SQLite file, zero setup
- `DATABASE_URL` set → PostgreSQL / Supabase

Queries are written once, in the SQL subset both dialects accept, with `?` placeholders
rewritten to `$1..$n` for Postgres. [`db/schema.sql`](db/schema.sql) is a single file that
applies unchanged to both. Pointing this at Supabase is one environment variable.

**2. Credentials auth rather than Supabase Auth.**

Same reasoning: Supabase Auth requires Supabase. The app uses email and password with
scrypt hashing and an opaque 256-bit session token stored server-side, so there is no
client-readable claim to forge and signing out genuinely revokes access. Everything
outside [`src/lib/auth.ts`](src/lib/auth.ts) depends only on `currentUser()` and
`requireUser()`, so swapping in Supabase Auth means rewriting one file.

Both are trades of stack conformance for a product that works the moment it is cloned. If
you want the Supabase path, it is one env var away — see
[Deployment](#deployment).

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                      Landing
│   ├── error.tsx  not-found.tsx      Global error and 404 states
│   ├── (auth)/signin  signup         Auth pages
│   ├── onboarding/                   Six-step onboarding
│   └── (app)/                        Everything behind a session
│       ├── layout.tsx                Auth + onboarding gate, app shell
│       ├── loading.tsx               Route skeleton
│       ├── dashboard/                Today: goal, arc, steps, assistant, deadlines
│       ├── learn/                    Catalogue → course → lesson player
│       ├── opportunities/            Matched feed → detail
│       ├── compete/                  Daily challenge · battles · friends, tabbed
│       │   └── battles/[id]/         One battle's accept/play/results flow
│       ├── roadmap/  projects/  progress/
│
├── actions/                          Server actions (the only write path)
│   auth · onboarding · steps · lessons · opportunities · projects · roadmap
│   friends · battles · daily-challenge
│
├── components/                       UI. Client components marked "use client"
│   ui.tsx  app-shell  today-steps  lesson-player  opportunity-card
│   roadmap-timeline  project-manager  ai-panel  reward-toast
│   compete-tabs  friends-panel  battles-panel  battle-quiz
│   daily-challenge-panel  multi-question-quiz  …
│
└── lib/                              Domain logic. No React, no JSX.
    ├── db/index.ts                   Two-driver data layer
    ├── auth.ts  accounts.ts  password.ts   Sessions, registration, hashing
    ├── queries.ts                    All reads, mapped to domain types
    ├── gamification.ts               XP, streaks, achievements — all writes
    ├── steps.ts                      Daily plan generation
    ├── match.ts                      Opportunity scoring and reasons
    ├── roadmap.ts  roadmap-templates.ts
    ├── friends.ts                    Friend requests, one row per pair
    ├── battles.ts  battle-topics.ts  Friend battles; topics split out client-safe
    ├── daily-challenge.ts            The daily SAT challenge and its leaderboard
    ├── ai.ts                         Growth assistant
    ├── taxonomy.ts                   Roles, goals, subjects — the shared vocabulary
    ├── xp.ts  date.ts  portfolio.ts  step-display.ts
    └── types.ts

db/
├── schema.sql                        One schema, valid in SQLite and Postgres
├── seed.ts                           CLI: catalogue + the demo account's 37 days
├── seed-runtime.ts                   Runtime fallback: raw-sqlite bootstrap for
│                                      a serverless cold start (see Deployment)
└── content/                          The curriculum and the opportunity catalogue
    sat · ielts · research · projects · career · opportunities · achievements
```

Some conventions that hold throughout:

- **Reads go through `lib/queries.ts`, writes through `lib/gamification.ts`.** Row shape
  is mapped to domain types in exactly one place.
- **No derived state is stored.** XP is the sum of an append-only `xp_events` ledger;
  levels, snapshots and roadmap statuses are computed on read. They cannot drift from the
  truth because there is no second copy of it.
- **Server actions are thin.** They authenticate, call one domain function, revalidate,
  and return a typed result. The logic lives in `lib/`, where it can be tested directly.
- **The server never trusts a client tally.** Quiz scores are recomputed from the stored
  correct answers, so a tampered request cannot award a perfect-quiz bonus.
- **`lib/taxonomy.ts` is the single vocabulary.** Onboarding renders from it, the matcher
  scores against it, and the roadmap generator branches on it — which is what makes "your
  answers change the product" true rather than aspirational.
- **Account operations have no request-scoped dependency.** `lib/accounts.ts` (validation,
  registration, credential checks) never imports `next/headers`; `lib/auth.ts` builds
  sessions and cookies on top of it. Splitting them is what lets a plain script — the
  verification suite, the seed script — register and authenticate a user without a request
  to hang the call on.
- **Achievements are checked for whoever actually earned them, not just the caller.** A
  battle's win-count achievement can complete on the *loser's* submission, since that is
  the request that pushes the winner's tally over the threshold — `submitBattleAnswers`
  checks the winner's achievements too, not only the submitting player's.

---

## Database

22 tables. [`db/schema.sql`](db/schema.sql) is the single source of truth and applies to
both SQLite and PostgreSQL unchanged.

```
users ──┬── sessions
        ├── profiles                (onboarding answers — drives all personalisation)
        ├── goals ──── learning_paths ──── roadmap_milestones ──── roadmap_tasks
        ├── daily_steps             (the 365 plan, one row per step per day)
        ├── daily_progress          (per-day rollup)
        ├── xp_events               (append-only ledger; XP is its SUM)
        ├── streaks
        ├── lesson_progress ────────── lessons
        ├── user_achievements ──────── achievements
        ├── saved_opportunities ────┐
        ├── applications ───────────┼── opportunities
        ├── user_deadlines ─────────┘
        ├── projects
        ├── friendships              (one row per pair, user_a < user_b canonically)
        ├── battles ──────────────── battle_results
        └── daily_challenge_attempts ── daily_challenges

courses ──── lessons ──┬── questions
                       └── resources     (curated external material)
```

Portability conventions: ids are UUID `TEXT`, dates are ISO `YYYY-MM-DD` `TEXT`,
timestamps are ISO 8601 `TEXT`, booleans are `INTEGER` 0/1 (avoiding SQLite/Postgres
boolean coercion drift), and JSON is `TEXT` holding a document. Foreign keys cascade from
`users`, so deleting an account removes everything belonging to it.

---

## Local setup

**Requirements:** Node.js 20 or newer. Nothing else — no database server, no accounts, no
API keys.

```bash
git clone <this-repo>
cd 365step

npm install          # installs deps and compiles better-sqlite3
npm run db:seed      # creates ./data/365step.db, loads content + demo account
npm run dev          # http://localhost:3000
```

Click **Try the live demo**, or sign in as `alex@365step.app` / `demo1234`. To see
onboarding instead, create a new account.

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run db:seed` | Apply schema, load content, create the demo account if absent |
| `npm run db:reset` | Delete the database file, then seed from scratch |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next's linter |

`db:seed` is idempotent for content: re-running updates courses, lessons, questions and
opportunities in place and leaves existing user data alone. Use `db:reset` when you want
a clean slate — including fresh relative deadlines.

---

## Environment variables

All optional. See [`.env.example`](.env.example).

| Variable | Default | Effect |
|----------|---------|--------|
| `DATABASE_URL` | unset | Unset → SQLite. Set → PostgreSQL / Supabase. |
| `SQLITE_PATH` | `./data/365step.db` | Where the SQLite file lives. |
| `ANTHROPIC_API_KEY` | unset | Lets Claude write the assistant's headline. Without it, the deterministic writer does. |

---

## Seed data

Written to look like a product someone has been using, because an empty dashboard
demonstrates nothing.

**Curriculum** — 9 courses, 36 lessons, 109 questions, across SAT (Reading, Writing,
Math), IELTS (Writing, Reading, Speaking), Research Fundamentals (a ten-lesson course
from "what research actually is" to presenting it), Building Your First Project, and
Applications & CV. All of it written for this project.

**Opportunities** — 33 entries. 31 are real programmes with their official URLs.

**The demo account** — `alex@365step.app` / `demo1234`. A Grade 10 student in Kazakhstan
interested in engineering, physics and maths, aiming at a top engineering university, on
day 37 of 365 with: a 12-day streak, 30 active days with believable gaps before them,
3,229 XP at level 7 (Explorer), 14 completed lessons with realistic scores (including a
67% that the assistant notices and tells you to redo), 101 completed steps, four saved
opportunities with live countdowns, one application in progress, two portfolio projects,
10 earned achievements, and today's plan left open so you can complete it live.

### On accuracy

Real programmes and invented ones are not mixed silently:

- **31 real programmes.** `officialUrl` points at the programme's own official page,
  never an aggregator. Descriptions stay at the level the organisers themselves state.
- **2 illustrative examples**, rendered with a visible **Demo example** badge, a warning
  panel on the detail page, and no outbound apply link. They exist to show a regional
  qualifier and an unadvertised departmental placement — the two most overlooked kinds of
  opportunity — without inventing a fake programme name and presenting it as real.
- **Deadline dates are indicative.** Real application windows move every cycle, so
  asserting exact future dates would be stating something false. Each entry instead
  carries an offset in days from seed time, which keeps every countdown live for the demo
  while the feed banner, every card and every detail page say the date is indicative and
  must be confirmed on the official site. `source_note` records the provenance of each
  entry.

---

## AI integration

The brief was explicit that 365step is not a chatbot, and that AI should be an
intelligent layer over the roadmap, learning, opportunities and progress. So the
assistant has one job — **answer "what should I do today?"** — and runs in two stages, in
this order:

**Stage 1 — deterministic analysis** ([`src/lib/ai.ts`](src/lib/ai.ts)). Always runs,
needs no API key. It reads the user's own rows and computes:

- balance across tracks, preferring a track you *started and dropped* over one you have
  never opened, because "you stopped" is a more useful thing to hear than "you have not
  begun"
- lessons scored below 70%, worth another pass
- saved deadlines inside 7 and 21 days
- streak state and minutes remaining today
- strong opportunity matches you have not saved
- portfolio gaps

From those it produces the insights and the concrete next steps. **This is the product.**
It is what generates lines like:

> You completed 2 lessons this week, but nothing in Projects yet.
> You scored 67% on Quadratic functions. Worth one more pass.
> FIRST Robotics Competition closes in 5 days.

**Stage 2 — Claude, optional.** If `ANTHROPIC_API_KEY` is set, `claude-opus-5` is given
the computed factual summary and asked for one sentence of coaching prose for the
headline. The model is shown only the summary and instructed to use no numbers that are
not in it, so it cannot invent facts; its output is presentational. If the key is absent,
the call fails, the response is refused, or the text comes back the wrong length, the
deterministic headline stands and the panel's badge reads *Offline analysis* instead of
*Claude*.

The result is a feature whose worst case is "slightly less warmly worded" rather than
"broken" — and every number on screen comes from stage 1 either way.

---

## Deployment

### Zero-config deploy (what Vercel does out of the box)

Connect the repo to Vercel and deploy with **no environment variables set** and the site
opens: the landing page, sign-up, onboarding, learning, opportunities, Compete, all of it.
This is deliberate — see [Serverless SQLite fallback](#serverless-sqlite-fallback) below
for how — but it comes with a real limitation worth understanding before you rely on it
for anything beyond a first look:

- Data lives in `/tmp`, which Vercel wipes on every cold start and does **not** share
  across concurrent function instances. Two people using the site at the same moment can
  land on different instances with different data. For a single visitor clicking around,
  this is invisible; for the friends/battles features specifically — which need two
  different accounts to see the *same* row — it will misbehave under any real concurrency.
- **Set `DATABASE_URL` before relying on this for a demo with more than one person, or for
  anything you want to persist.** The steps are below and take about five minutes.

### Vercel + Supabase (real persistence)

1. Create a Supabase project.
2. Apply the schema: paste [`db/schema.sql`](db/schema.sql) into the Supabase SQL editor
   and run it. No edits needed.
3. Load the content: run the seed against Supabase from your machine —

   ```bash
   DATABASE_URL="postgresql://…" npm run db:seed
   ```

4. In the Vercel project's environment variables, set `DATABASE_URL` to that same
   connection string (plus `ANTHROPIC_API_KEY` if you want the Claude headline), then
   redeploy. Use the **pooled** connection string on port `6543`; the direct connection
   exhausts its limit under serverless.

The app is Vercel-ready as it stands: every route is `force-dynamic` because every page
is per-user, and `better-sqlite3` is declared in `serverExternalPackages` so it is never
bundled.

> **Note on RLS.** The app connects to Postgres directly as the database owner, so
> row-level security is not the security boundary — every query scopes by `user_id`, and
> the verification suite checks that cross-user reads and writes fail. If you expose the
> database to untrusted clients (a mobile app using the Supabase client, say), add RLS
> policies before doing so; the schema is shaped for it, but they are not written.

### Serverless SQLite fallback

With no `DATABASE_URL`, the SQLite driver ([`src/lib/db/index.ts`](src/lib/db/index.ts))
detects a serverless host (`process.env.VERCEL` or `AWS_LAMBDA_FUNCTION_NAME`) and:

1. Points at `/tmp/365step.db` instead of `./data/365step.db` — the only writable path on
   a Vercel function; writing to `./data` there throws, which was the original cause of
   "the site won't open" on a bare deploy.
2. On a brand-new file (every cold start), applies `db/schema.sql` and seeds the full
   catalogue plus a minimal demo account, using
   [`db/seed-runtime.ts`](db/seed-runtime.ts) — a small, dependency-light seeder kept
   deliberately separate from the CLI's own `db/seed.ts`. It talks to the raw
   better-sqlite3 handle rather than this module's own query helpers, because those route
   through the very driver promise this code is constructing; calling back into them here
   would await a promise that can't resolve until the function returns.

This path is **only for serverless** — it never runs for local development. `npm run
db:seed`'s first call into the database layer would otherwise hit this same "brand-new
file" branch and pre-create a bare demo account before the CLI script's own richer,
37-day-history seeding gets a chance to run, which is exactly the kind of double-seeding
bug this guard exists to prevent.

If something still looks wrong after deploying, the global error boundary
([`src/app/error.tsx`](src/app/error.tsx)) recognises the "missing table" shape of error
and prints next steps directly on the page, including the `DATABASE_URL` reminder above.

### Local SQLite in production (self-hosted, not serverless)

If you run `npm start` yourself on a persistent server (not Vercel/Lambda), local SQLite
at `./data/365step.db` works fine and persists normally — the serverless fallback above
never triggers because `VERCEL`/`AWS_LAMBDA_FUNCTION_NAME` aren't set. Postgres is still
recommended for anything with real users.

---

## Verification

Checked before shipping, not assumed:

- `npm run typecheck` — clean, `strict` mode.
- `npm run build` — clean, all 16 routes.
- `npm audit` — 0 vulnerabilities.
- **67 end-to-end logic checks** against the real database, driving the real server
  modules: onboarding a second user with a different profile, roadmap generation from the
  right template with `{subject}` slots filled, daily plan generation (count, budget,
  idempotency), step completion (XP ledger arithmetic to the point, streak, achievement,
  double-completion, undo), lesson completion (score storage, perfect-quiz bonus, no XP
  on redo, roadmap task auto-close, attempt counting), opportunity save (deadline
  mirroring, live countdown, unsave cleanup), application tracking, the assistant's
  fallback path, snapshot arithmetic, level-curve calibration, and cross-user data
  isolation.
- **61 further checks for friends, battles and the daily challenge**: rejecting a request
  to a non-account or to yourself, both directions of a friendship reading back correctly,
  battles refusing a non-friend or an invalid topic, the opponent-only accept/decline gate,
  questions withholding the correct answer until submission, the winner determined
  correctly on score then speed, no re-submission either flow, XP awarded exactly once per
  action, the daily challenge producing an identical question set for every user that day,
  the leaderboard ranking correctly, and achievements unlocking for the actual winner even
  when they are not the one who triggered the completing request.
- **A full serverless-deploy simulation**: production build, `VERCEL=1`, no
  `DATABASE_URL`, a completely fresh `/tmp` — landing page, demo login, dashboard and
  Compete all return 200, confirming the fix for the original "site won't open" failure.
- **HTTP checks** — every route returns 200 for a signed-in user and 307 to `/signin` for
  a signed-out one; server actions (including friend requests, battle creation, accepting,
  submitting, and the daily challenge) were invoked over real HTTP between two real
  accounts and their database side effects confirmed.

Bugs the verification caught and fixed: a double-count in the quiz score display (the
server's authoritative score is used now); a reward toast that conflated an action's XP
with an achievement's (separate cards now, each reporting its own); a client component
that imported a value (not just a type) from a server-only module, pulling `better-sqlite3`
and `postgres` into the browser bundle and breaking the production build; and the
serverless auto-seed initially running unconditionally, which caused the local `npm run
db:seed` CLI to see a pre-existing minimal demo account on its very first run and skip
building the real 37-day history — now gated to serverless hosts only.

---

## Design notes

Neutral structure, near-black on warm off-white, with colour reserved for things that
carry meaning: the 365-day arc (a dawn-to-dusk gradient), the streak, XP, and deadline
urgency. A dense product stays calm that way.

- **The 365 arc** is an SVG ring rather than a bar, because the whole product is built on
  a year going round once.
- **Dark mode** follows the system and is a first-class path, not an inversion.
- **Mobile-first**, tested at 320px: a rail on desktop becomes a bottom tab bar on
  mobile, and the persistent header carries day, streak and level on every page.
- **Tabular numerals** everywhere a number changes, so nothing jitters.
- **`prefers-reduced-motion`** is respected — all animation collapses.
- **Keyboard**: quizzes answer with `1`–`4` and advance with `Enter`; focus rings are
  visible throughout; interactive controls carry `aria-pressed`, `aria-expanded` and
  labels.
- **System font stack** rather than a web font, so there is no network dependency at build
  or first paint.

---

## Deliberate limitations

Stated plainly, because a hackathon MVP that claims completeness is less trustworthy than
one that says where it stops:

- **No email verification or password reset.** Sessions are real, but account recovery is
  not built.
- **No RLS policies.** See the note in [Deployment](#deployment).
- **Opportunity data is static seed content.** There is no scraper or ingestion pipeline;
  keeping the catalogue current is manual today.
- **Deadlines are indicative, not live.** Covered in [Seed data](#seed-data).
- **No spaced repetition.** Practice steps point at the most recent lesson rather than
  scheduling by a forgetting curve.
- **Streaks have no freeze or grace day**, so one missed day resets the count.
- **Roadmaps are template-driven**, not generated per user by a model. Eight templates
  with subject substitution — predictable and inspectable, but not infinitely bespoke.
- **No tests in CI.** The verification suite was run against the real database during
  development; it is not wired into a CI pipeline or committed as a test suite.
- **The zero-config Vercel deploy is single-instance in spirit.** It answers "does the site
  open with no setup" honestly, but `/tmp` is ephemeral and not shared across concurrent
  function instances — real use, especially of friends/battles, needs `DATABASE_URL` set.
  Covered in [Deployment](#deployment).
- **No battle rematch or expiry sweep.** A pending battle past its `expires_at` is not
  automatically marked expired anywhere yet — the column exists, nothing reads it.
- **Friend battles offer four fixed topics** (Reading, Writing, Math, Mixed), not an
  arbitrary course — battles pull from SAT content specifically, since that is where the
  question bank is deepest.

## Future improvements

1. **Opportunity ingestion** — a scraper plus review queue, so deadlines are real and
   current rather than indicative. The highest-value next thing by a distance.
2. **Spaced repetition** for practice steps, scheduling by recall probability instead of
   recency.
3. **Mentor matching** — the research course teaches cold outreach; the product could
   close the loop and track the conversations.
4. **Application workspace** — checklists, document drafts and recommendation-letter
   tracking per application, rather than a status field.
5. **Model-generated roadmaps** for goals outside the eight templates, with the template
   library as the guardrail.
6. **Cohorts** — a shared 365 with a small group, since the failure mode of any habit
   product is doing it alone.
7. **Email and push nudges** on the streak and on deadlines inside seven days.
8. **RLS and a public API**, so a mobile client can talk to Supabase directly.
9. **Localisation** — Russian and Kazakh first, given the initial audience.
10. **Battle rematch and a friends leaderboard** — head-to-head history is tracked per
    battle already; a per-friend win/loss record and a one-tap rematch are a small step
    from what is there.
11. **Expire stale battles** — a scheduled sweep (or a check on read) that marks a battle
    past its `expires_at` as `expired` rather than leaving it pending indefinitely.
12. **Battle topics beyond SAT** — IELTS and Research have question banks too; opening
    battles to them is mostly relaxing `BATTLE_TOPICS`' track filter.

---

## Licence

Written for the VentureHack EduTech hackathon.

Programme names and trademarks referenced in the opportunity catalogue belong to their
respective organisations. 365step links to official pages and is not affiliated with,
endorsed by, or partnered with any of them.
