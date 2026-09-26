"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";

import { OPPORTUNITY_TYPES } from "@/lib/taxonomy";
import { inputClass } from "./ui";

/**
 * Feed filters, held in the URL.
 *
 * Keeping state in the query string means a filtered view is shareable, the
 * back button behaves, and the filtering itself stays on the server where the
 * matching logic lives.
 */
export function OpportunityFilters({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type") ?? "";
  const filter = params.get("filter") ?? "";
  const q = params.get("q") ?? "";

  const [search, setSearch] = useState(q);

  // Keep the box in step when navigation changes the query from elsewhere.
  useEffect(() => setSearch(q), [q]);

  function apply(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") merged.delete(key);
      else merged.set(key, value);
    }
    router.push(merged.toString() ? `/opportunities?${merged}` : "/opportunities");
  }

  // Debounce so typing does not fire a navigation per keystroke.
  useEffect(() => {
    if (search === q) return;
    const timer = setTimeout(() => apply({ q: search || null }), 320);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const views = [
    { value: "", label: "For you" },
    { value: "saved", label: `Saved${counts.saved ? ` (${counts.saved})` : ""}` },
    { value: "closing", label: "Closing soon" },
    { value: "all", label: "Everything" },
  ];

  const hasFilters = Boolean(type || filter || q);

  return (
    <div className="space-y-3">
      {/* view tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Opportunity views">
        {views.map((view) => (
          <button
            key={view.value}
            type="button"
            role="tab"
            aria-selected={filter === view.value}
            onClick={() => apply({ filter: view.value || null })}
            className={clsx(
              "rounded-full px-3.5 py-2 text-[13px] font-medium transition-all",
              filter === view.value
                ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                : "muted hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]",
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* search */}
      <div className="relative">
        <Search className="subtle pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, organisation, country or subject…"
          aria-label="Search opportunities"
          className={clsx(inputClass, "pl-10")}
        />
      </div>

      {/* type chips */}
      <div className="flex flex-wrap gap-1.5">
        <TypeChip active={type === ""} onClick={() => apply({ type: null })}>
          All types
        </TypeChip>
        {OPPORTUNITY_TYPES.filter((t) => (counts[t.value] ?? 0) > 0).map((t) => (
          <TypeChip
            key={t.value}
            active={type === t.value}
            onClick={() => apply({ type: type === t.value ? null : t.value })}
          >
            {t.label}
            <span className="nums subtle ml-1">{counts[t.value]}</span>
          </TypeChip>
        ))}
      </div>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.push("/opportunities")}
          className="muted inline-flex items-center gap-1 text-xs transition-colors hover:text-[var(--fg)]"
        >
          <X className="size-3" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

function TypeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-[var(--fg)] bg-[var(--bg-sunken)]"
          : "border-[var(--border)] muted hover:border-[var(--border-strong)] hover:text-[var(--fg)]",
      )}
    >
      {children}
    </button>
  );
}
