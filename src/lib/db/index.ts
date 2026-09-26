/**
 * Database access for 365step.
 *
 * One async interface, two drivers:
 *
 *   * no DATABASE_URL   ->  SQLite file at ./data/365step.db (better-sqlite3).
 *                           Zero setup: clone, seed, run.
 *   * DATABASE_URL set  ->  PostgreSQL / Supabase (postgres.js).
 *
 * Queries are written once, in the SQL subset both dialects accept, with `?`
 * placeholders. For Postgres they are rewritten to $1..$n on the way out.
 *
 * Server-side only — it touches node:fs and native addons. It is imported by
 * server components, server actions, and the seed script (which runs outside
 * Next, so this module deliberately avoids Next-specific imports).
 */

import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs";
import path from "node:path";

export type SqlParam = string | number | null;
export type Row = Record<string, unknown>;

/** A thing that can run a parameterised statement: the pool, or one connection. */
interface Executor {
  all(sql: string, params: SqlParam[]): Promise<Row[]>;
  run(sql: string, params: SqlParam[]): Promise<void>;
}

interface Driver extends Executor {
  dialect: "sqlite" | "postgres";
  /** Runs `fn` so that either every write inside it lands, or none do. */
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  exec(sql: string): Promise<void>;
}

/**
 * The connection an open transaction has reserved, scoped to the async call
 * tree that opened it. Concurrent requests each get their own view, so one
 * request's transaction can never capture another request's queries.
 */
const txContext = new AsyncLocalStorage<Executor>();

/** `?, ?` -> `$1, $2`. Our queries never contain `?` inside a string literal. */
function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// --------------------------------------------------------------- sqlite ----

async function createSqliteDriver(): Promise<Driver> {
  const { default: Database } = await import("better-sqlite3");

  const file = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "365step.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  let depth = 0;

  return {
    dialect: "sqlite",
    async all(sql, params) {
      return db.prepare(sql).all(...params) as Row[];
    },
    async run(sql, params) {
      db.prepare(sql).run(...params);
    },
    async transaction(fn) {
      // better-sqlite3's own transaction() helper cannot wrap async work, so
      // drive the statements directly. `depth` makes nesting a no-op rather
      // than a "cannot start a transaction within a transaction" error.
      if (depth > 0) return fn();
      depth++;
      db.exec("BEGIN");
      try {
        const result = await fn();
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      } finally {
        depth--;
      }
    },
    async exec(sql) {
      db.exec(sql);
    },
  };
}

// ------------------------------------------------------------- postgres ----

type PgConnection = {
  unsafe(q: string, p?: unknown[]): Promise<unknown>;
};
type PgPool = PgConnection & {
  reserve(): Promise<PgConnection & { release(): void }>;
};

async function createPostgresDriver(url: string): Promise<Driver> {
  const { default: postgres } = await import("postgres");

  const local = url.includes("localhost") || url.includes("127.0.0.1");
  const pool = postgres(url, {
    max: 5,
    idle_timeout: 20,
    // Supabase requires TLS; a local Postgres over loopback does not have it.
    ssl: local ? false : "require",
  }) as unknown as PgPool;

  const wrap = (conn: PgConnection): Executor => ({
    async all(sql, params) {
      return (await conn.unsafe(toPgPlaceholders(sql), params)) as Row[];
    },
    async run(sql, params) {
      await conn.unsafe(toPgPlaceholders(sql), params);
    },
  });

  const poolExecutor = wrap(pool);

  return {
    dialect: "postgres",
    all: (sql, params) => poolExecutor.all(sql, params),
    run: (sql, params) => poolExecutor.run(sql, params),
    async transaction(fn) {
      if (txContext.getStore()) return fn(); // already inside one
      // Hold one pooled connection for the whole block, so BEGIN/COMMIT and the
      // writes between them cannot land on different connections.
      const held = await pool.reserve();
      try {
        await held.unsafe("BEGIN");
        try {
          const result = await txContext.run(wrap(held), fn);
          await held.unsafe("COMMIT");
          return result;
        } catch (error) {
          await held.unsafe("ROLLBACK");
          throw error;
        }
      } finally {
        held.release();
      }
    },
    async exec(sql) {
      await pool.unsafe(sql);
    },
  };
}

// -------------------------------------------------------------- singleton ---

const globalForDb = globalThis as unknown as { __step365Driver?: Promise<Driver> };

function driver(): Promise<Driver> {
  if (!globalForDb.__step365Driver) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    globalForDb.__step365Driver = url ? createPostgresDriver(url) : createSqliteDriver();
  }
  return globalForDb.__step365Driver;
}

export async function dialect(): Promise<"sqlite" | "postgres"> {
  return (await driver()).dialect;
}

/** Every matching row. */
export async function all<T = Row>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  const target = txContext.getStore() ?? (await driver());
  return (await target.all(sql, params)) as T[];
}

/** The first matching row, or null. */
export async function one<T = Row>(sql: string, params: SqlParam[] = []): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}

/** A write. */
export async function run(sql: string, params: SqlParam[] = []): Promise<void> {
  const target = txContext.getStore() ?? (await driver());
  await target.run(sql, params);
}

/** A single numeric aggregate (COUNT, SUM, ...), coerced past driver types. */
export async function scalar(sql: string, params: SqlParam[] = []): Promise<number> {
  const row = await one<Record<string, unknown>>(sql, params);
  if (!row) return 0;
  const value = Object.values(row)[0];
  return value === null || value === undefined ? 0 : Number(value);
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  return (await driver()).transaction(fn);
}

export async function exec(sql: string): Promise<void> {
  await (await driver()).exec(sql);
}

// ----------------------------------------------------------------- helpers --

/** Parses a TEXT column holding JSON, falling back to `fallback` on junk. */
export function json<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** 0/1 INTEGER columns -> boolean, across both drivers. */
export function bool(value: unknown): boolean {
  return value === 1 || value === true || value === "1" || value === "t";
}

export function num(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function str(value: unknown, fallback = ""): string {
  return value === null || value === undefined ? fallback : String(value);
}

/** Applies db/schema.sql. Both dialects accept it verbatim. */
export async function applySchema(): Promise<void> {
  const file = path.join(process.cwd(), "db", "schema.sql");
  await exec(fs.readFileSync(file, "utf8"));
}
