"use client";

import { useState, useTransition } from "react";
import { Loader2, Play } from "lucide-react";

import { demoLoginAction } from "@/actions/auth";
import { Button, ErrorNote } from "./ui";

/**
 * Signs into the seeded demo account.
 *
 * On success the action redirects, so this component only ever renders an error
 * — which in practice means "the database has not been seeded".
 */
export function DemoLoginButton({
  children = "Try the demo",
  variant = "secondary",
  size = "md",
  className,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await demoLoginAction();
            if (result?.error) setError(result.error);
          })
        }
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Play className="size-3.5" />
        )}
        {pending ? "Opening demo…" : children}
      </Button>

      {error ? (
        <div className="mt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      ) : null}
    </div>
  );
}
