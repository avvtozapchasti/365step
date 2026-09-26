"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Compass,
  Flame,
  FolderKanban,
  Home,
  Loader2,
  LogOut,
  Map,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

import { signOutAction } from "@/actions/auth";
import { Badge, Logo } from "./ui";

/**
 * `short` is the label the mobile tab bar uses. Six tabs at phone width leaves
 * roughly 50px each, which "Opportunities" does not fit into — it clips to
 * "Opportuni…", so the tab gets its own shorter name rather than a truncation.
 */
const NAV = [
  { href: "/dashboard", label: "Today", short: "Today", icon: Home },
  { href: "/learn", label: "Learn", short: "Learn", icon: Sparkles },
  { href: "/opportunities", label: "Opportunities", short: "Explore", icon: Compass },
  { href: "/compete", label: "Compete", short: "Compete", icon: Swords },
  { href: "/roadmap", label: "Roadmap", short: "Roadmap", icon: Map },
  { href: "/projects", label: "Projects", short: "Projects", icon: FolderKanban },
  { href: "/progress", label: "Progress", short: "Progress", icon: TrendingUp },
];

export interface ShellUser {
  name: string;
  level: number;
  levelTitle: string;
  totalXp: number;
  streak: number;
  dayIndex: number;
}

/**
 * The application chrome: a rail on desktop, a bottom tab bar on mobile.
 *
 * The persistent header carries day, streak and level, because the whole premise
 * is that the user always knows where they are in the 365 — not only when they
 * happen to be on the dashboard.
 */
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-dvh">
      {/* ------------------------------------------------------ desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[var(--border)] bg-[var(--bg-raised)] px-4 py-5 lg:flex">
        <Link href="/dashboard" className="mb-1 px-2">
          <Logo className="text-xl" />
        </Link>
        <p className="subtle mb-6 px-2 text-[11px]">
          Day {user.dayIndex} of 365
        </p>

        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive(href)
                  ? "bg-[var(--bg-sunken)] font-medium"
                  : "muted hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-3">
          <div className="sunken rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">Level {user.level}</span>
              <Badge tone="streak">
                <Flame className="size-3" />
                {user.streak}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm font-semibold">{user.levelTitle}</p>
            <p className="nums subtle text-xs">{user.totalXp.toLocaleString("en-US")} XP</p>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <span className="muted min-w-0 truncate text-xs">{user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-raised)]/85 px-4 py-3 backdrop-blur-lg lg:hidden">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <Logo className="text-lg" />
          <span className="subtle nums text-[11px]">Day {user.dayIndex}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone="streak">
            <Flame className="size-3" />
            {user.streak}
          </Badge>
          <Badge tone="xp">L{user.level}</Badge>
          <SignOutButton />
        </div>
      </header>

      {/* ------------------------------------------------------------ content */}
      <main className="pb-24 lg:pb-10 lg:pl-60">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>

      {/* ------------------------------------------------- mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-raised)]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch">
          {NAV.map(({ href, label, short, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={clsx(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[9.5px] transition-colors",
                isActive(href) ? "font-medium text-[var(--fg)]" : "subtle",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="max-w-full truncate">{short}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void signOutAction())}
        className="rounded-full px-2.5 py-1 text-[11px] font-medium text-[var(--color-urgent)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-urgent)_10%,transparent)]"
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : "Confirm"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label="Sign out"
      title="Sign out"
      className="subtle rounded-full p-1.5 transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]"
    >
      <LogOut className="size-4" />
    </button>
  );
}
