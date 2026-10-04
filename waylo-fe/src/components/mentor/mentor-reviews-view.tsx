"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {
  MentorReviewQueueItem,
  MentorReviewVerdict,
  SubmitMentorReviewInput,
} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatLongDate} from "@/lib/format";

export function MentorReviewsView() {
  const t = useTranslations("mentor.reviews");
  const tc = useTranslations("common");

  const query = useApiQuery<MentorReviewQueueItem[]>(
    queryKeys.mentor.reviews,
    "/mentor/reviews",
  );

  const [activeItem, setActiveItem] = useState<MentorReviewQueueItem | null>(null);
  const [score, setScore] = useState("85");
  const [verdict, setVerdict] = useState<MentorReviewVerdict>("recommended");
  const [feedback, setFeedback] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const reviewMutation = useApiMutation<unknown, SubmitMentorReviewInput>({
    invalidateKeys: [queryKeys.mentor.reviews, queryKeys.mentor.dashboard],
    mapVariables: (body) => ({
      path: `/mentor/reviews/${activeItem?.referenceId}?type=${
        activeItem?.type === "project_submission" ? "project" : "candidate"
      }`,
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setSuccessMessage(true);
      setActiveItem(null);
      setFeedback("");
      setTimeout(() => setSuccessMessage(false), 4000);
    },
  });

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    void reviewMutation.mutateAsync({
      score: score ? Number(score) : undefined,
      verdict,
      technicalFeedback: feedback.trim(),
    });
  }

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:task-line"
    >
      {(items) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          {successMessage ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success">
              <Icon name="mingcute:check-circle-line" className="text-lg" />
              <span>{t("reviewSubmittedSuccess")}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Queue List (6 cols) */}
            <div className="flex flex-col gap-4 lg:col-span-6">
              <h2 className="text-lg font-medium text-black">
                {t("queueTitle")} ({items.length})
              </h2>

              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <Card
                      key={item.id}
                      className={`flex cursor-pointer flex-col gap-2 p-5 transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-secondary/15 shadow-sm"
                          : "hover:border-primary/40"
                      }`}
                      onClick={() => {
                        setActiveItem(item);
                        setFeedback("");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-black">{item.candidateName}</span>
                        <Chip tone={item.type === "candidate_screening" ? "status" : "skill"}>
                          {item.type === "candidate_screening"
                            ? t("typeScreening")
                            : t("typeProject")}
                        </Chip>
                      </div>

                      <p className="text-sm text-[var(--text-secondary)]">{item.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{item.details}</p>

                      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-[var(--muted-foreground)]">
                        <span>{formatLongDate(item.submittedAt)}</span>
                        <span className="font-medium text-primary">{t("startReview")} →</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Review Evaluation Form (6 cols) */}
            <div className="lg:col-span-6">
              {activeItem ? (
                <Card className="flex flex-col gap-5 p-6 sm:p-7">
                  <div className="border-b border-border pb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {t("reviewingCandidate")}
                    </span>
                    <h3 className="text-xl font-bold text-black">{activeItem.candidateName}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{activeItem.title}</p>
                  </div>

                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
                    {/* Score Field */}
                    <Field
                      id="score"
                      type="number"
                      label={t("scoreLabel")}
                      placeholder="85"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                    />

                    {/* Verdict Selector */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-primary">
                        {t("verdictLabel")}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            {key: "recommended", tone: "success"},
                            {key: "needs_improvement", tone: "status"},
                            {key: "not_recommended", tone: "muted"},
                          ] as const
                        ).map(({key}) => {
                          const isSelected = verdict === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setVerdict(key)}
                              className={`rounded-xl border p-2.5 text-center text-xs font-medium capitalize transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-white shadow-sm"
                                  : "border-border bg-white text-black hover:border-primary/30"
                              }`}
                            >
                              {t(`verdict.${key}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technical Feedback Textarea */}
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-primary">
                        {t("technicalFeedbackLabel")} *
                      </span>
                      <Textarea
                        rows={5}
                        required
                        placeholder={t("technicalFeedbackPlaceholder")}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="text-sm"
                      />
                    </label>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveItem(null)}
                      >
                        {tc("cancel")}
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={reviewMutation.isPending || !feedback.trim()}
                      >
                        {reviewMutation.isPending ? tc("loading") : t("submitReviewCTA")}
                        <Icon name="mingcute:check-line" className="ml-1 text-base" />
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                  <Icon name="mingcute:cursor-line" className="text-4xl text-[var(--muted-foreground)]" />
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    {t("selectQueuePrompt")}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}
