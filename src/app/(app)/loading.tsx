import { SkeletonCard } from "@/components/ui";

/**
 * Shown while a signed-in page's data resolves. Shaped like the dashboard, which
 * is where most navigation lands, so the transition does not jump.
 */
export default function AppLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="skeleton h-3 w-28" />
        <div className="mt-4 flex items-center gap-5">
          <div className="skeleton size-32 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-full max-w-sm" />
            <div className="flex gap-2">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-7 w-44" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
