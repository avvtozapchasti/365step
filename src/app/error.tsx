"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button, ButtonLink, Logo, Panel } from "@/components/ui";

/**
 * The global error boundary.
 *
 * Most likely cause in practice is an unseeded database, so that possibility is
 * named directly rather than left to the user to guess at.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the server log for whoever is running the demo.
    console.error("365step error boundary:", error);
  }, [error]);

  const looksUnseeded = /no such table|relation .* does not exist|SQLITE_/i.test(error.message);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>

      <Panel className="w-full max-w-lg p-8">
        <div
          className="mb-5 flex size-12 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--color-urgent) 12%, transparent)",
            color: "var(--color-urgent)",
          }}
        >
          <AlertTriangle className="size-5" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>

        {looksUnseeded ? (
          <>
            <p className="muted mt-2.5 text-sm leading-relaxed">
              The database looks empty or missing its tables. Locally, seeding it should
              fix this:
            </p>
            <pre className="sunken mt-3 overflow-x-auto rounded-xl p-3.5 text-xs">
              <code>npm run db:reset</code>
            </pre>
            <p className="subtle mt-3 text-xs leading-relaxed">
              Deployed on Vercel? Set <code className="font-mono">DATABASE_URL</code> to a
              Postgres/Supabase connection string in the project&apos;s environment
              variables, then redeploy — see the README&apos;s Deployment section. Without
              it the app falls back to a temporary database that resets on every cold
              start.
            </p>
          </>
        ) : (
          <p className="muted mt-2.5 text-sm leading-relaxed">
            This is unexpected. Trying again usually works — the details are in the server
            log.
          </p>
        )}

        {error.digest ? (
          <p className="subtle mt-3 font-mono text-[11px]">digest: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <ButtonLink href="/dashboard" variant="secondary">
            Back to today
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
