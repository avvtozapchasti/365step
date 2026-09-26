/**
 * UI primitives.
 *
 * Small, unopinionated pieces shared across every page. Written by hand in the
 * shadcn/ui idiom (composable, class-overridable, no runtime theming layer)
 * rather than generated, so there is no dependency to install and nothing
 * unused shipped to the client.
 */

import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

// ------------------------------------------------------------------ layout ---

export function Card({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={clsx("surface shadow-soft", className)} {...props}>
      {children}
    </div>
  );
}

export function Panel({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={clsx("surface-panel shadow-soft", className)} {...props}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {description ? (
          <p className="muted mt-1 max-w-2xl text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ------------------------------------------------------------------ button ---

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all " +
  "disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] whitespace-nowrap";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--btn-bg)] text-[var(--btn-fg)] shadow-soft hover:shadow-lift hover:opacity-90",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--bg-raised)] hover:bg-[var(--bg-sunken)]",
  ghost: "hover:bg-[var(--bg-sunken)]",
  danger:
    "border border-[color-mix(in_oklab,var(--color-urgent)_35%,transparent)] text-[var(--color-urgent)] hover:bg-[color-mix(in_oklab,var(--color-urgent)_8%,transparent)]",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return clsx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------- badge ---

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "done" | "urgent" | "soon" | "calm" | "xp" | "streak" | "outline";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "sunken muted",
    outline: "border border-[var(--border-strong)] muted",
    done: "bg-[color-mix(in_oklab,var(--color-done)_14%,transparent)] text-[var(--color-done)]",
    urgent:
      "bg-[color-mix(in_oklab,var(--color-urgent)_14%,transparent)] text-[var(--color-urgent)]",
    soon: "bg-[color-mix(in_oklab,var(--color-soon)_16%,transparent)] text-[color-mix(in_oklab,var(--color-soon)_80%,var(--fg))]",
    calm: "bg-[color-mix(in_oklab,var(--color-calm)_13%,transparent)] text-[var(--color-calm)]",
    xp: "bg-[color-mix(in_oklab,var(--color-xp)_14%,transparent)] text-[var(--color-xp)]",
    streak:
      "bg-[color-mix(in_oklab,var(--color-streak)_15%,transparent)] text-[var(--color-streak)]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- progress ---

export function ProgressBar({
  value,
  className,
  gradient = false,
  height = "h-2",
  label,
}: {
  value: number;
  className?: string;
  gradient?: boolean;
  height?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx("sunken w-full overflow-hidden rounded-full", height, className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          gradient
            ? "bg-[linear-gradient(90deg,var(--color-arc-start),var(--color-arc-mid)_55%,var(--color-arc-end))]"
            : "bg-[var(--fg)]",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * The 365-day arc. An SVG ring rather than a bar, because the whole product is
 * built on the idea of a year going round once.
 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 9,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-arc-start)" />
            <stop offset="50%" stopColor="var(--color-arc-mid)" />
            <stop offset="100%" stopColor="var(--color-arc-end)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-sunken)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#arc-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------- stat ---

export function Stat({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("surface p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {icon ? <span className="subtle">{icon}</span> : null}
      </div>
      <p className="nums mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="subtle mt-0.5 text-xs">{hint}</p> : null}
    </div>
  );
}

// ------------------------------------------------------------------ states ---

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "surface flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="sunken mb-4 flex size-12 items-center justify-center rounded-full subtle">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="muted mt-1.5 max-w-sm text-sm leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-[color-mix(in_oklab,var(--color-urgent)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-urgent)_7%,transparent)] px-3.5 py-2.5 text-sm text-[var(--color-urgent)]"
    >
      {children}
    </p>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface p-5">
      <div className="skeleton h-4 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-3" style={{ width: `${95 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ fields ---

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="subtle mt-1 block text-xs">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-raised)] px-3.5 py-2.5 " +
  "text-sm outline-none transition-colors placeholder:text-[var(--fg-subtle)] " +
  "focus:border-[var(--color-arc-end)]";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={clsx(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(inputClass, "resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={clsx(inputClass, "appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
}

// ------------------------------------------------------------------- misc ----

/** The urgency dot beside a deadline. */
export function UrgencyDot({ daysLeft }: { daysLeft: number | null }) {
  const colour =
    daysLeft === null
      ? "var(--color-ink-400)"
      : daysLeft < 0
        ? "var(--color-ink-400)"
        : daysLeft <= 7
          ? "var(--color-urgent)"
          : daysLeft <= 30
            ? "var(--color-soon)"
            : "var(--color-calm)";

  return (
    <span
      aria-hidden
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ background: colour }}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={clsx("hairline", className)} />;
}

/** The 365step wordmark. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={clsx("inline-flex items-baseline font-semibold tracking-tight", className)}>
      <span className="arc-text">365</span>
      {!compact ? <span>step</span> : null}
    </span>
  );
}
