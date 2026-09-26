import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Compass,
  Flame,
  Layers,
  Scale,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
} from "lucide-react";

import type { GrowthAnalysis, Insight, InsightTone } from "@/lib/ai";
import { Badge, Panel } from "./ui";

const ICONS: Record<string, LucideIcon> = {
  "alarm-clock": AlarmClock,
  "calendar-clock": CalendarClock,
  "check-circle": CheckCircle2,
  compass: Compass,
  flame: Flame,
  layers: Layers,
  scale: Scale,
  target: Target,
  "trending-down": TrendingDown,
};

const TONE_COLOUR: Record<InsightTone, string> = {
  positive: "var(--color-done)",
  warning: "var(--color-soon)",
  urgent: "var(--color-urgent)",
  neutral: "var(--color-xp)",
};

/**
 * The AI Growth Assistant panel.
 *
 * A server component: the analysis is computed on the server from the user's own
 * rows, so nothing about it ships to the client beyond the rendered result.
 */
export function AiPanel({ analysis }: { analysis: GrowthAnalysis }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-start gap-3.5 p-5 sm:p-6">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--color-xp) 14%, transparent)",
            color: "var(--color-xp)",
          }}
        >
          <Sparkles className="size-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <p className="eyebrow">Growth assistant</p>
            {analysis.narration === "rules" ? (
              <Badge tone="neutral" className="text-[10px]">
                Offline analysis
              </Badge>
            ) : (
              <Badge tone="xp" className="text-[10px]">
                Claude
              </Badge>
            )}
          </div>

          <p className="text-[15px] font-medium leading-relaxed">{analysis.headline}</p>
        </div>
      </div>

      {analysis.insights.length > 0 ? (
        <ul className="hairline divide-y divide-[var(--border)]">
          {analysis.insights.map((insight, i) => (
            <InsightRow key={i} insight={insight} />
          ))}
        </ul>
      ) : null}

      {analysis.suggestions.length > 0 ? (
        <div className="hairline sunken p-5 sm:p-6">
          <p className="eyebrow mb-3">What should I do today?</p>
          <ol className="space-y-2">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i}>
                <Link
                  href={suggestion.href}
                  className="group flex items-start gap-3 rounded-xl bg-[var(--bg-raised)] p-3.5 transition-all hover:shadow-soft"
                >
                  <span className="nums subtle mt-0.5 shrink-0 text-[11px] font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-medium leading-snug">{suggestion.title}</span>
                      <span className="subtle nums inline-flex items-center gap-1 text-[11px]">
                        <Timer className="size-3" />
                        {suggestion.minutes} min
                      </span>
                    </span>
                    <span className="muted mt-0.5 block text-xs leading-relaxed">
                      {suggestion.detail}
                    </span>
                  </span>
                  <ArrowRight className="subtle mt-1 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </Panel>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const Icon = ICONS[insight.icon] ?? Sparkles;
  const colour = TONE_COLOUR[insight.tone];

  return (
    <li className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color: colour }} />
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed">
        {insight.text}
        {insight.href ? (
          <>
            {" "}
            <Link
              href={insight.href}
              className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 transition-colors hover:decoration-[var(--fg)]"
            >
              {insight.linkLabel ?? "Open"}
            </Link>
          </>
        ) : null}
      </p>
    </li>
  );
}
