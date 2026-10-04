"use client";

import {useState, useEffect, useMemo, useRef} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {
  AssessmentDetail,
  AssessmentGradedResult,
  Question,
  SubmitAssessmentInput,
} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Icon} from "@/components/ui/icon";
import {DataState} from "@/components/shared/data-state";

type AnswersState = Record<string, string | string[]>;

export function AssessmentQuizView({id}: {id: string}) {
  const t = useTranslations("learner.assessments");
  const tc = useTranslations("common");

  const query = useApiQuery<AssessmentDetail>(
    queryKeys.learner.assessment(id),
    `/learner/assessments/${id}`,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [result, setResult] = useState<AssessmentGradedResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const submitMutation = useApiMutation<AssessmentGradedResult, SubmitAssessmentInput>({
    invalidateKeys: [
      queryKeys.learner.assessment(id),
      queryKeys.learner.assessmentResults,
      queryKeys.learner.dashboard,
    ],
    mapVariables: (body) => ({
      path: `/learner/assessments/${id}/submit`,
      method: "POST",
      body,
    }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const timerInitializedRef = useRef(false);

  // Timer countdown
  useEffect(() => {
    if (!timerInitializedRef.current && query.data && query.data.durationMinutes > 0) {
      timerInitializedRef.current = true;
      setTimeLeft(query.data.durationMinutes * 60);
    }
  }, [query.data]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result !== null) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, result]);

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(assessment) => {
        const questions = assessment.questions;
        if (questions.length === 0) {
          return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-lg text-[var(--muted-foreground)]">
                {t("noQuestions")}
              </p>
              <Button asChild variant="outline">
                <Link href="/learner/assessments">{tc("back")}</Link>
              </Button>
            </div>
          );
        }

        // Results screen
        if (result) {
          return (
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-8 text-center">
              <span
                className={`flex size-20 items-center justify-center rounded-full text-4xl ${
                  result.passed
                    ? "bg-green-100 text-success"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                <Icon
                  name={
                    result.passed
                      ? "mingcute:check-circle-line"
                      : "mingcute:alert-line"
                  }
                />
              </span>

              <h2 className="text-3xl font-medium text-black">
                {result.passed ? t("resultPassed") : t("resultFailed")}
              </h2>

              <p className="text-lg text-[var(--muted-foreground)]">
                {t("resultScore", {
                  score: result.scorePercent,
                  correct: result.correctCount,
                  total: result.totalQuestions,
                })}
              </p>

              {result.verifiedSkill ? (
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/30 px-5 py-2 text-sm font-medium text-primary">
                  <Icon name="mingcute:badge-line" className="text-lg" />
                  {t("skillVerified", {skill: result.verifiedSkill})}
                </div>
              ) : null}

              <div className="mt-4 flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/learner/assessments">{t("backToList")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/learner/roadmap">{t("viewRoadmap")}</Link>
                </Button>
              </div>
            </div>
          );
        }

        const currentQuestion = questions[currentIndex];
        const isLast = currentIndex === questions.length - 1;
        const currentAnswer = answers[currentQuestion.id];

        function handleAnswer(val: string | string[]) {
          setAnswers((prev) => ({...prev, [currentQuestion.id]: val}));
        }

        function handleSubmit() {
          const payload: SubmitAssessmentInput = {
            answers: Object.entries(answers).map(([questionId, answer]) => ({
              questionId,
              answer,
            })),
          };
          void submitMutation.mutateAsync(payload);
        }

        // Format timer MM:SS
        const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
        const seconds = timeLeft !== null ? timeLeft % 60 : 0;
        const timerStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        return (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {/* Header bar */}
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/learner/assessments">
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {assessment.title}
                </Link>
              </Button>

              {timeLeft !== null ? (
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm">
                  <Icon name="mingcute:time-line" className="text-sm" />
                  {timerStr}
                </span>
              ) : null}
            </div>

            {/* Question progress pills */}
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary text-white shadow-sm"
                        : isAnswered
                        ? "border border-primary/40 bg-secondary text-primary"
                        : "border border-border bg-white text-[var(--muted-foreground)] hover:border-primary/20"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <Card className="flex flex-col gap-6 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("questionOf", {
                    current: currentIndex + 1,
                    total: questions.length,
                  })}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {currentQuestion.points} poin
                </span>
              </div>

              <h3 className="text-xl font-medium leading-snug text-black">
                {currentQuestion.prompt}
              </h3>

              {/* Question Renderer based on type */}
              <div className="mt-2">
                {currentQuestion.type === "multiple_choice" && (
                  <MultipleChoiceRenderer
                    question={currentQuestion}
                    value={(currentAnswer as string) ?? ""}
                    onChange={handleAnswer}
                  />
                )}

                {currentQuestion.type === "true_false" && (
                  <TrueFalseRenderer
                    value={(currentAnswer as string) ?? ""}
                    onChange={handleAnswer}
                  />
                )}

                {currentQuestion.type === "multiple_select" && (
                  <MultipleSelectRenderer
                    question={currentQuestion}
                    value={(currentAnswer as string[]) ?? []}
                    onChange={handleAnswer}
                  />
                )}

                {currentQuestion.type === "short_answer" && (
                  <ShortAnswerRenderer
                    value={(currentAnswer as string) ?? ""}
                    onChange={handleAnswer}
                    placeholder={t("shortAnswerPlaceholder")}
                  />
                )}

                {currentQuestion.type === "ordering" && (
                  <OrderingRenderer
                    question={currentQuestion}
                    value={(currentAnswer as string[]) ?? []}
                    onChange={handleAnswer}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {tc("back")}
                </Button>

                {isLast ? (
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? tc("loading") : t("submitQuiz")}
                    <Icon name="mingcute:check-line" className="ml-1 text-base" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  >
                    {t("nextQuestion")}
                    <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        );
      }}
    </DataState>
  );
}

// ---------------------------------------------------------------------------
// Question Type Renderers
// ---------------------------------------------------------------------------

function MultipleChoiceRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options?.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${
              isSelected
                ? "border-primary bg-secondary/30 font-medium text-primary shadow-sm"
                : "border-border bg-white text-black hover:border-primary/30"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border text-[var(--muted-foreground)]"
              }`}
            >
              {opt.key.toUpperCase()}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TrueFalseRenderer({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {["true", "false"].map((val) => {
        const isSelected = value === val;
        const label = val === "true" ? "Benar" : "Salah";
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-6 text-base font-medium transition-all ${
              isSelected
                ? "border-primary bg-secondary/40 text-primary shadow-sm"
                : "border-border bg-white text-black hover:border-primary/30"
            }`}
          >
            <Icon
              name={val === "true" ? "mingcute:check-line" : "mingcute:close-line"}
              className="text-2xl"
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MultipleSelectRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  function toggle(key: string) {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {question.options?.map((opt) => {
        const isSelected = value.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${
              isSelected
                ? "border-primary bg-secondary/30 font-medium text-primary shadow-sm"
                : "border-border bg-white text-black hover:border-primary/30"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white"
              }`}
            >
              {isSelected ? <Icon name="mingcute:check-line" className="text-xs" /> : null}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ShortAnswerRenderer({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-14 text-base"
    />
  );
}

function OrderingRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const options = useMemo(() => question.options ?? [], [question.options]);

  // Initialize order if empty
  useEffect(() => {
    if (value.length === 0 && options.length > 0) {
      onChange(options.map((o) => o.key));
    }
  }, [value, options, onChange]);

  const orderedKeys = value.length > 0 ? value : options.map((o) => o.key);
  const optionMap = new Map(options.map((o) => [o.key, o]));

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedKeys.length) return;
    const next = [...orderedKeys];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {orderedKeys.map((key, idx) => {
        const opt = optionMap.get(key);
        if (!opt) return null;
        return (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-border bg-white p-3.5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-black">{opt.label}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="size-8 p-0"
              >
                <Icon name="mingcute:arrow-up-line" className="text-sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => move(idx, 1)}
                disabled={idx === orderedKeys.length - 1}
                className="size-8 p-0"
              >
                <Icon name="mingcute:arrow-down-line" className="text-sm" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
