"use client";

import { useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import clsx from "clsx";

import type { PublicQuizQuestion, QuizBreakdownItem } from "@/lib/types";
import { Button, ErrorNote, Panel } from "./ui";

/**
 * A generic "answer N questions, submit once" quiz — the shape shared by the
 * daily SAT challenge and friend battles.
 *
 * Unlike the lesson player, every question is shown at once and answered
 * before a single submission, and the correct answers are never in the initial
 * props: `questions` carries only prompt/options, and the grading breakdown
 * arrives solely in the response to that one submission. This is what stops a
 * competitive quiz from being solved by reading the page source.
 */
export function MultiQuestionQuiz<T extends { ok: boolean; error?: string; breakdown?: QuizBreakdownItem[] }>({
  questions,
  onSubmit,
  renderSummary,
  submitLabel = "Submit answers",
}: {
  questions: PublicQuizQuestion[];
  onSubmit: (answers: number[], seconds: number) => Promise<T>;
  renderSummary: (result: T) => React.ReactNode;
  submitLabel?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const startedAt = useRef(Date.now());

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const ordered = questions.map((_, i) => answers[i]);
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));

    const response = await onSubmit(ordered, seconds);
    setSubmitting(false);

    if (!response.ok) {
      setError(response.error ?? "Could not submit your answers.");
      return;
    }
    setResult(response);
  }

  if (result) {
    const breakdownByQuestion = new Map((result.breakdown ?? []).map((b) => [b.questionId, b]));

    return (
      <div className="space-y-5">
        {renderSummary(result)}

        <div>
          <p className="eyebrow mb-3">Review</p>
          <ol className="space-y-2.5">
            {questions.map((question, i) => {
              const b = breakdownByQuestion.get(question.id);
              return (
                <li key={question.id} className="surface p-4">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={clsx(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white",
                        b?.isCorrect ? "bg-[var(--color-done)]" : "bg-[var(--color-urgent)]",
                      )}
                    >
                      {b?.isCorrect ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : (
                        <X className="size-3" strokeWidth={3} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-relaxed">{question.prompt}</p>
                      {b ? (
                        <>
                          <p className="muted mt-1.5 text-xs leading-relaxed">
                            Your answer:{" "}
                            <span className={b.isCorrect ? "" : "text-[var(--color-urgent)]"}>
                              {question.options[b.chosenIndex] ?? "No answer"}
                            </span>
                            {!b.isCorrect ? (
                              <>
                                {" "}
                                · Correct:{" "}
                                <span className="text-[var(--color-done)]">
                                  {question.options[b.correctIndex]}
                                </span>
                              </>
                            ) : null}
                          </p>
                          <p className="subtle mt-1 text-xs leading-relaxed">{b.explanation}</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {questions.map((question, qi) => (
          <li key={question.id}>
            <Panel className="p-4 sm:p-5">
              <p className="mb-3 flex items-start gap-2 text-[15px] font-medium leading-relaxed">
                <span className="subtle nums shrink-0 text-sm">{qi + 1}.</span>
                <span>{question.prompt}</span>
              </p>
              <div className="space-y-2" role="radiogroup" aria-label={`Question ${qi + 1} options`}>
                {question.options.map((option, oi) => {
                  const selected = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAnswers((current) => ({ ...current, [qi]: oi }))}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all",
                        selected
                          ? "border-[var(--fg)] bg-[var(--bg-sunken)]"
                          : "border-[var(--border)] hover:border-[var(--border-strong)]",
                      )}
                    >
                      <span
                        className={clsx(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          selected
                            ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg-raised)]"
                            : "border-[var(--border-strong)] subtle",
                        )}
                      >
                        {oi + 1}
                      </span>
                      <span className="min-w-0 flex-1 leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </li>
        ))}
      </ol>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <Button size="lg" onClick={submit} disabled={!allAnswered || submitting} className="w-full sm:w-auto">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {allAnswered
          ? submitLabel
          : `Answer all ${questions.length} to submit (${Object.keys(answers).length}/${questions.length})`}
      </Button>
    </div>
  );
}
