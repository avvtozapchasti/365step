import Link from "next/link";

import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-arc-mid), var(--color-arc-end) 60%, transparent)",
        }}
      />

      <header className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <Link href="/" className="inline-block">
          <Logo className="text-xl" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md animate-[rise_0.45s_both]">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <p className="subtle text-center text-xs">
          One year. 365 steps. One big goal.
        </p>
      </footer>
    </div>
  );
}
