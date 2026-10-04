"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Assessment, CreateQuestionInput, QuestionType} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function AdminAssessmentsView() {
  const t = useTranslations("admin.assessments");
  const tc = useTranslations("common");

  const query = useApiQuery<Assessment[]>(queryKeys.learner.assessments, "/learner/assessments");
  const assessments = query.data ?? [];

  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [prompt, setPrompt] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState("1");
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Simple options for MC
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");

  const addQuestionMutation = useApiMutation<unknown, CreateQuestionInput>({
    invalidateKeys: [queryKeys.learner.assessments],
    mapVariables: (body) => ({
      path: "/admin/questions",
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setSuccessMessage(true);
      setPrompt("");
      setCorrectAnswer("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setShowAddForm(false);
      setTimeout(() => setSuccessMessage(false), 4000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssessmentId || !prompt.trim() || !correctAnswer.trim()) return;

    let options = null;
    if (questionType === "multiple_choice" || questionType === "multiple_select") {
      options = [
        {key: "a", label: optA.trim() || "Pilihan A"},
        {key: "b", label: optB.trim() || "Pilihan B"},
        {key: "c", label: optC.trim() || "Pilihan C"},
        {key: "d", label: optD.trim() || "Pilihan D"},
      ];
    } else if (questionType === "true_false") {
      options = [
        {key: "true", label: "Benar"},
        {key: "false", label: "Salah"},
      ];
    }

    void addQuestionMutation.mutateAsync({
      assessmentId: selectedAssessmentId,
      type: questionType,
      prompt: prompt.trim(),
      options,
      correctAnswer: correctAnswer.trim().toLowerCase(),
      points: Number(points) || 1,
    });
  }

  const assessmentOptions = [
    {value: "", label: t("chooseAssessmentPrompt")},
    ...assessments.map((a) => ({value: a.id, label: a.title})),
  ];

  const typeOptions = [
    {value: "multiple_choice", label: t("typeMC")},
    {value: "true_false", label: t("typeTF")},
    {value: "multiple_select", label: t("typeMS")},
    {value: "short_answer", label: t("typeSA")},
    {value: "ordering", label: t("typeOrder")},
  ];

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(items) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button onClick={() => setShowAddForm((s) => !s)}>
                <Icon name="mingcute:add-circle-line" className="mr-1 text-base" />
                {t("addQuestionCTA")}
              </Button>
            }
          />

          {successMessage ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success">
              <Icon name="mingcute:check-circle-line" className="text-lg" />
              <span>{t("questionAddedSuccess")}</span>
            </div>
          ) : null}

          {showAddForm ? (
            <Card className="flex flex-col gap-5 p-6 sm:p-8">
              <h2 className="text-lg font-medium text-black">{t("addFormTitle")}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary">
                      {t("targetAssessmentLabel")} *
                    </span>
                    <Select
                      value={selectedAssessmentId}
                      onChange={(v) => setSelectedAssessmentId(v)}
                      options={assessmentOptions}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary">
                      {t("questionTypeLabel")} *
                    </span>
                    <Select
                      value={questionType}
                      onChange={(v) => setQuestionType(v as QuestionType)}
                      options={typeOptions}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-primary">
                    {t("promptLabel")} *
                  </span>
                  <Textarea
                    rows={3}
                    placeholder={t("promptPlaceholder")}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </label>

                {(questionType === "multiple_choice" || questionType === "multiple_select") && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      id="optA"
                      label="Pilihan A"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      required
                    />
                    <Field
                      id="optB"
                      label="Pilihan B"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      required
                    />
                    <Field
                      id="optC"
                      label="Pilihan C"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                    />
                    <Field
                      id="optD"
                      label="Pilihan D"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="correctAnswer"
                    label={t("correctAnswerLabel")}
                    placeholder={
                      questionType === "true_false"
                        ? "true / false"
                        : questionType === "multiple_choice"
                        ? "a / b / c / d"
                        : "Jawaban tepat"
                    }
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    required
                  />

                  <Field
                    id="points"
                    type="number"
                    label={t("pointsLabel")}
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    min={1}
                    max={10}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={addQuestionMutation.isPending || !selectedAssessmentId}>
                    {addQuestionMutation.isPending ? tc("loading") : tc("save")}
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          {/* Assessments Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((assessment) => (
              <Card key={assessment.id} className="flex flex-col justify-between p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon name="mingcute:clipboard-line" className="text-xl" />
                    </span>
                    <Chip tone="status" className="capitalize">
                      {assessment.type.replace(/_/g, " ")}
                    </Chip>
                  </div>

                  <h3 className="text-lg font-bold text-black">{assessment.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{assessment.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-[var(--muted-foreground)]">
                  <span>{assessment.durationMinutes} menit</span>
                  <span>{assessment.questionCount} soal</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  );
}
