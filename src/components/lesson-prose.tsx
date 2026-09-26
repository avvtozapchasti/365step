import type { ReactNode } from "react";

/**
 * A deliberately tiny renderer for lesson bodies.
 *
 * Lesson content is authored as plain text with three conventions — `**bold**`,
 * backtick `code`, and lines starting with a bullet character — which is all the
 * curriculum needs. A full markdown dependency would be several times the size
 * of the feature it serves.
 *
 * Because it only ever renders seeded curriculum text (never user input) and
 * emits React elements rather than HTML strings, there is no injection surface:
 * nothing here goes near dangerouslySetInnerHTML.
 */

const BULLET_PREFIXES = ["• ", "- ", "* "];

export function LessonProse({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className={`prose-lesson ${className ?? ""}`}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBulletBlock = lines.every((line) =>
          BULLET_PREFIXES.some((prefix) => line.trimStart().startsWith(prefix)),
        );

        if (isBulletBlock) {
          return (
            <div key={i} className="mb-4 last:mb-0">
              {lines.map((line, j) => {
                const content = stripBullet(line);
                return (
                  <div key={j} className="bullet">
                    <span
                      aria-hidden
                      className="mt-[0.55rem] size-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--color-arc-mid)" }}
                    />
                    <span>{inline(content)}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        // A block mixing prose lines and bullets keeps its line breaks.
        return (
          <p key={i}>
            {lines.map((line, j) => {
              const bulleted = BULLET_PREFIXES.some((p) => line.trimStart().startsWith(p));
              return (
                <span key={j}>
                  {j > 0 ? <br /> : null}
                  {bulleted ? (
                    <span className="inline-flex gap-2">
                      <span aria-hidden>•</span>
                      <span>{inline(stripBullet(line))}</span>
                    </span>
                  ) : (
                    inline(line)
                  )}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

function stripBullet(line: string): string {
  const trimmed = line.trimStart();
  for (const prefix of BULLET_PREFIXES) {
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return trimmed;
}

/** Applies `**bold**` and `` `code` `` within a single line. */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // One pass over both markers, so nesting order cannot produce stray asterisks.
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
