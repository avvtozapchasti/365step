"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Briefcase, GraduationCap, Loader2, Play, School } from "lucide-react";
import clsx from "clsx";

import { demoLoginAction } from "@/actions/auth";
import type { DemoPersona } from "@/lib/demo";
import { Button, ErrorNote } from "./ui";

const PERSONAS: {
  value: DemoPersona;
  label: string;
  blurb: string;
  icon: typeof School;
}[] = [
  { value: "school", label: "School student", blurb: "Grade 10 · aiming for a top university", icon: School },
  { value: "university", label: "University student", blurb: "Year 2 · looking for an internship", icon: GraduationCap },
  { value: "graduate", label: "Graduate / working", blurb: "1–2 years in · building career skills", icon: Briefcase },
];

/**
 * Opens a demo account. Without `persona`, first asks which of the three
 * scenarios to open. On success the action redirects, so only errors render.
 */
export function DemoLoginButton({
  children = "Try the demo",
  persona,
  variant = "secondary",
  size = "md",
  className,
}: {
  children?: React.ReactNode;
  persona?: DemoPersona;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<DemoPersona | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function launch(value: DemoPersona) {
    setChosen(value);
    startTransition(async () => {
      setError(null);
      const result = await demoLoginAction(value);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div ref={root} className={clsx("relative", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={pending}
        aria-haspopup={persona ? undefined : "menu"}
        aria-expanded={persona ? undefined : open}
        onClick={() => (persona ? launch(persona) : setOpen((v) => !v))}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-3.5" />}
        {pending ? "Opening demo…" : children}
      </Button>

      {open && !persona ? (
        <div
          role="menu"
          className="surface-panel shadow-lift absolute left-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] p-1.5 text-left"
        >
          <p className="subtle px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide">
            Pick a scenario
          </p>
          {PERSONAS.map(({ value, label, blurb, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              disabled={pending}
              onClick={() => launch(value)}
              className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-sunken)] disabled:opacity-50"
            >
              <span className="sunken mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
                {pending && chosen === value ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="muted block text-xs">{blurb}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      ) : null}
    </div>
  );
}
