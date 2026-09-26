/**
 * Synchronous, dependency-light seeding used to auto-provision a brand-new
 * SQLite file at runtime — specifically, Vercel's ephemeral `/tmp` on a cold
 * start, which begins completely empty every time a fresh container spins up.
 *
 * Deliberately does NOT import from src/lib/db. This function runs *inside*
 * that module's own driver construction (see src/lib/db/index.ts), before the
 * driver promise it belongs to has resolved — calling back into that module's
 * `all()`/`run()` helpers from here would await a promise that cannot resolve
 * until the very function building it returns. So this talks to the raw
 * better-sqlite3 handle directly instead.
 *
 * This is intentionally a smaller seed than `db/seed.ts` (the CLI): the full
 * catalogue (courses, lessons, opportunities, achievements) plus a minimal,
 * freshly-onboarded demo account — not the 37-day history the CLI builds for
 * local development. It exists so a bare Vercel deploy with no DATABASE_URL
 * still opens to a working product instead of a 500 page.
 */

import { randomUUID } from "node:crypto";
import type BetterSqlite3 from "better-sqlite3";

import { ACHIEVEMENTS, COURSES, OPPORTUNITIES } from "./content";
import { hashPassword } from "../src/lib/password";

function nowIso(): string {
  return new Date().toISOString();
}

function todayIso(): string {
  return nowIso().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEMO_EMAIL = "alex@365step.app";
const DEMO_PASSWORD = "demo1234";

export async function seedRawSqlite(db: BetterSqlite3.Database): Promise<void> {
  const insertCourse = db.prepare(
    `INSERT INTO courses (id, slug, track, title, subtitle, description, difficulty,
       subjects, audiences, goal_slugs, accent, order_index)
     VALUES (@id,@slug,@track,@title,@subtitle,@description,@difficulty,
       @subjects,@audiences,@goal_slugs,@accent,@order_index)`,
  );
  const insertLesson = db.prepare(
    `INSERT INTO lessons (id, course_id, slug, title, objective, est_minutes, xp,
       theory, example, takeaway, order_index)
     VALUES (@id,@course_id,@slug,@title,@objective,@est_minutes,@xp,
       @theory,@example,@takeaway,@order_index)`,
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (id, lesson_id, prompt, options, correct_index, explanation, order_index)
     VALUES (@id,@lesson_id,@prompt,@options,@correct_index,@explanation,@order_index)`,
  );
  const insertResource = db.prepare(
    `INSERT INTO resources (id, lesson_id, course_id, title, source, url,
       duration_min, topic, difficulty, order_index)
     VALUES (@id,@lesson_id,@course_id,@title,@source,@url,
       @duration_min,@topic,@difficulty,@order_index)`,
  );
  const insertOpportunity = db.prepare(
    `INSERT INTO opportunities (id, slug, title, organization, type, summary, description,
       audiences, subjects, goal_slugs, tags, eligibility, country, location, format,
       deadline, cost, min_grade, max_grade, official_url, is_demo, source_note, prestige, order_index)
     VALUES (@id,@slug,@title,@organization,@type,@summary,@description,
       @audiences,@subjects,@goal_slugs,@tags,@eligibility,@country,@location,@format,
       @deadline,@cost,@min_grade,@max_grade,@official_url,@is_demo,@source_note,@prestige,@order_index)`,
  );
  const insertAchievement = db.prepare(
    `INSERT INTO achievements (id, code, title, description, icon, xp, metric, threshold, order_index)
     VALUES (@id,@code,@title,@description,@icon,@xp,@metric,@threshold,@order_index)`,
  );

  const seedContent = db.transaction(() => {
    for (let ci = 0; ci < COURSES.length; ci++) {
      const course = COURSES[ci];
      const courseId = randomUUID();

      insertCourse.run({
        id: courseId,
        slug: course.slug,
        track: course.track,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        difficulty: course.difficulty,
        subjects: JSON.stringify(course.subjects),
        audiences: JSON.stringify(course.audiences),
        goal_slugs: JSON.stringify(course.goalSlugs),
        accent: course.accent,
        order_index: ci,
      });

      for (let li = 0; li < course.lessons.length; li++) {
        const lesson = course.lessons[li];
        const lessonId = randomUUID();

        insertLesson.run({
          id: lessonId,
          course_id: courseId,
          slug: lesson.slug,
          title: lesson.title,
          objective: lesson.objective,
          est_minutes: lesson.estMinutes,
          xp: lesson.xp ?? 25,
          theory: lesson.theory,
          example: lesson.example ?? null,
          takeaway: lesson.takeaway ?? null,
          order_index: li,
        });

        for (let qi = 0; qi < lesson.questions.length; qi++) {
          const q = lesson.questions[qi];
          insertQuestion.run({
            id: randomUUID(),
            lesson_id: lessonId,
            prompt: q.prompt,
            options: JSON.stringify(q.options),
            correct_index: q.correctIndex,
            explanation: q.explanation,
            order_index: qi,
          });
        }

        for (let ri = 0; ri < (lesson.resources ?? []).length; ri++) {
          const r = (lesson.resources ?? [])[ri];
          insertResource.run({
            id: randomUUID(),
            lesson_id: lessonId,
            course_id: courseId,
            title: r.title,
            source: r.source,
            url: r.url,
            duration_min: r.durationMin ?? null,
            topic: r.topic ?? null,
            difficulty: r.difficulty ?? "beginner",
            order_index: ri,
          });
        }
      }
    }

    const today = todayIso();
    for (let i = 0; i < OPPORTUNITIES.length; i++) {
      const o = OPPORTUNITIES[i];
      insertOpportunity.run({
        id: randomUUID(),
        slug: o.slug,
        title: o.title,
        organization: o.organization,
        type: o.type,
        summary: o.summary,
        description: o.description,
        audiences: JSON.stringify(o.audiences),
        subjects: JSON.stringify(o.subjects),
        goal_slugs: JSON.stringify(o.goalSlugs),
        tags: JSON.stringify(o.tags),
        eligibility: JSON.stringify(o.eligibility),
        country: o.country,
        location: o.location,
        format: o.format ?? "in_person",
        deadline: o.deadlineInDays === null ? null : addDays(today, o.deadlineInDays),
        cost: o.cost,
        min_grade: o.minGrade ?? null,
        max_grade: o.maxGrade ?? null,
        official_url: o.officialUrl,
        is_demo: o.isDemo ? 1 : 0,
        source_note: o.sourceNote,
        prestige: o.prestige ?? 2,
        order_index: i,
      });
    }

    for (let i = 0; i < ACHIEVEMENTS.length; i++) {
      const a = ACHIEVEMENTS[i];
      insertAchievement.run({
        id: randomUUID(),
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xp: a.xp,
        metric: a.metric,
        threshold: a.threshold,
        order_index: i,
      });
    }
  });
  seedContent();

  // A minimal demo account so "Try the demo" works immediately on a fresh
  // deploy. No 37-day history here (that logic lives in the async, upsert-based
  // db/seed.ts and depends on src/lib, which this raw-sqlite bootstrap
  // deliberately avoids — see the module comment). No roadmap is generated
  // either; the app already renders a graceful "no roadmap yet" empty state,
  // and re-running onboarding produces one normally through the real app.
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const userId = randomUUID();
  const startDate = addDays(todayIso(), -3);

  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(userId, DEMO_EMAIL, passwordHash, "Alex", nowIso());

  db.prepare(
    `INSERT INTO profiles (user_id, role, grade, country, daily_minutes, skill_level,
       interests, secondary, onboarded_at, timezone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    userId,
    "school",
    "10",
    "Kazakhstan",
    20,
    "beginner",
    JSON.stringify(["engineering", "physics", "math"]),
    JSON.stringify(["research", "portfolio"]),
    nowIso(),
    "UTC",
  );

  const goalId = randomUUID();
  db.prepare(
    `INSERT INTO goals (id, user_id, slug, title, category, start_date, target_date, status, is_primary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
  ).run(
    goalId,
    userId,
    "get-into-university",
    "Get into a top engineering university",
    "admissions",
    startDate,
    addDays(startDate, 364),
    nowIso(),
  );

  db.prepare(
    `INSERT INTO streaks (user_id, current_days, longest_days, last_active_date, updated_at)
     VALUES (?, 0, 0, NULL, ?)`,
  ).run(userId, nowIso());
}
