"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {
  Career,
  CompleteOnboardingInput,
  GetRecommendationsInput,
  OnboardingQuestion,
  OnboardingRecommendation,
  SkillLevel,
} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

type OnboardingMode = "undecided" | "direct" | "quiz";

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();

  // Queries
  const careersQuery = useApiQuery<Career[]>(
    queryKeys.catalogue.careers,
    "/careers",
  );
  const questionsQuery = useApiQuery<OnboardingQuestion[]>(
    queryKeys.learner.onboardingQuestions,
    "/learner/onboarding/questions",
  );

  // Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<OnboardingMode>("undecided");

  // Selection State
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<SkillLevel>("beginner");

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<OnboardingRecommendation[] | null>(null);

  // Mutations
  const recommendMutation = useApiMutation<OnboardingRecommendation[], GetRecommendationsInput>({
    mapVariables: (body) => ({
      path: "/learner/onboarding/recommendations",
      method: "POST",
      body,
    }),
    onSuccess: (data) => {
      setRecommendations(data);
      if (data.length > 0) {
        setSelectedCareerId(data[0].careerId);
      }
    },
  });

  const completeMutation = useApiMutation<
    {roadmapId: string; trackTitle: string},
    CompleteOnboardingInput
  >({
    invalidateKeys: [
      queryKeys.learner.dashboard,
      queryKeys.learner.roadmap,
      queryKeys.learner.profile,
    ],
    mapVariables: (body) => ({
      path: "/learner/onboarding/complete",
      method: "POST",
      body,
    }),
    onSuccess: () => {
      router.push("/learner/roadmap");
    },
  });

  const careers = careersQuery.data ?? [];
  const selectedCareer = careers.find((c) => c.id === selectedCareerId);

  function handleAnswer(questionId: string, optionKey: string) {
    setQuizAnswers((prev) => ({...prev, [questionId]: optionKey}));
  }

  function handleCalculateRecommendations() {
    const questions = questionsQuery.data ?? [];
    const answers = Object.entries(quizAnswers).map(([questionId, optionKey]) => ({
      questionId,
      optionKey,
    }));
    if (answers.length < questions.length) return;
    void recommendMutation.mutateAsync({answers});
  }

  function handleFinish() {
    if (!selectedCareerId) return;
    void completeMutation.mutateAsync({
      careerId: selectedCareerId,
      experienceLevel,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-4 sm:py-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Stepper indicator */}
      <div className="flex items-center justify-between border-b border-border pb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        <span className={step >= 1 ? "text-primary" : ""}>
          1. {t("stepDecision")}
        </span>
        <span className="h-px w-10 bg-border sm:w-20" />
        <span className={step >= 2 ? "text-primary" : ""}>
          2. {t("stepDiscovery")}
        </span>
        <span className="h-px w-10 bg-border sm:w-20" />
        <span className={step >= 3 ? "text-primary" : ""}>
          3. {t("stepConfirm")}
        </span>
      </div>

      {/* STEP 1: Branching Decision */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-black sm:text-3xl">
              {t("step1Title")}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] sm:text-base">
              {t("step1Subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Branch A: Already know */}
            <Card
              className="flex cursor-pointer flex-col justify-between p-6 transition-all hover:border-primary/50 hover:shadow-md"
              onClick={() => {
                setMode("direct");
                setStep(2);
              }}
            >
              <div className="flex flex-col gap-3">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-3xl text-primary">
                  <Icon name="mingcute:compass-line" />
                </span>
                <h3 className="text-xl font-medium text-black">{t("branchKnownTitle")}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t("branchKnownDesc")}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
                <span>{t("branchKnownCTA")}</span>
                <Icon name="mingcute:arrow-right-line" />
              </div>
            </Card>

            {/* Branch B: Recommend for me */}
            <Card
              className="flex cursor-pointer flex-col justify-between border-2 border-primary/30 p-6 transition-all hover:border-primary hover:shadow-md"
              onClick={() => {
                setMode("quiz");
                setStep(2);
              }}
            >
              <div className="flex flex-col gap-3">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-cta text-3xl text-white">
                  <Icon name="mingcute:sparkles-line" />
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium text-black">{t("branchQuizTitle")}</h3>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {t("recommended")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t("branchQuizDesc")}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">
                <span>{t("branchQuizCTA")}</span>
                <Icon name="mingcute:arrow-right-line" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 2A: Direct Career Picker */}
      {step === 2 && mode === "direct" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium text-black">{t("selectCareerTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {t("selectCareerSubtitle")}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              {tc("back")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {careers.map((c) => {
              const isSelected = selectedCareerId === c.id;
              return (
                <Card
                  key={c.id}
                  className={`flex cursor-pointer flex-col justify-between p-5 transition-all ${
                    isSelected
                      ? "border-2 border-primary bg-secondary/15 shadow-sm"
                      : "hover:border-primary/40"
                  }`}
                  onClick={() => setSelectedCareerId(c.id)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon name="mingcute:briefcase-line" />
                      </span>
                      {isSelected ? (
                        <Icon name="mingcute:check-circle-line" className="text-xl text-primary" />
                      ) : null}
                    </div>
                    <h3 className="text-base font-medium text-black">{c.title}</h3>
                    <p className="line-clamp-2 text-xs text-[var(--text-secondary)]">
                      {c.summary}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Experience level selector */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-base font-medium text-black">{t("expLevelTitle")}</h3>
            <p className="text-xs text-[var(--muted-foreground)]">{t("expLevelSubtitle")}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["beginner", "intermediate", "advanced"] as const).map((lvl) => {
                const isSelected = experienceLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-secondary/30 text-primary"
                        : "border-border text-black hover:border-primary/30"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-primary bg-primary text-white" : "border-border"
                      }`}
                    >
                      {isSelected ? <Icon name="mingcute:check-line" className="text-xs" /> : null}
                    </span>
                    <span className="capitalize">{t(`level.${lvl}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              {tc("back")}
            </Button>
            <Button
              disabled={!selectedCareerId}
              onClick={() => setStep(3)}
            >
              {t("nextConfirm")}
              <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2B: Mini-Quiz Discovery */}
      {step === 2 && mode === "quiz" && (
        <DataState
          query={questionsQuery}
          data={questionsQuery.data}
          emptyTitle={t("emptyTitle")}
          emptyBody={t("emptyBody")}
        >
          {(questions) => {
            const answeredCount = Object.keys(quizAnswers).length;
            const allAnswered = answeredCount === questions.length;

            return (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-black">{t("quizTitle")}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {t("quizSubtitle", {answered: answeredCount, total: questions.length})}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    {tc("back")}
                  </Button>
                </div>

                {!recommendations ? (
                  <div className="flex flex-col gap-6">
                    {questions.map((q, qIdx) => (
                      <Card key={q.id} className="flex flex-col gap-4 p-6 sm:p-7">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {t("questionIndex", {index: qIdx + 1})}
                        </span>
                        <h3 className="text-lg font-medium text-black">{q.prompt}</h3>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {q.options.map((opt) => {
                            const isSelected = quizAnswers[q.id] === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleAnswer(q.id, opt.key)}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${
                                  isSelected
                                    ? "border-primary bg-secondary/30 font-medium text-primary"
                                    : "border-border bg-white text-black hover:border-primary/30"
                                }`}
                              >
                                <span
                                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs ${
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
                      </Card>
                    ))}

                    <div className="flex justify-between border-t border-border pt-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        {tc("back")}
                      </Button>
                      <Button
                        disabled={!allAnswered || recommendMutation.isPending}
                        onClick={handleCalculateRecommendations}
                        size="lg"
                      >
                        {recommendMutation.isPending ? tc("loading") : t("calculateRecommendations")}
                        <Icon name="mingcute:sparkles-line" className="ml-2 text-xl" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Recommendation Results */
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-xl font-medium text-black">
                        {t("recommendationsResultTitle")}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {t("recommendationsResultSubtitle")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {recommendations.map((rec, idx) => {
                        const isSelected = selectedCareerId === rec.careerId;
                        return (
                          <Card
                            key={rec.careerId}
                            className={`flex cursor-pointer flex-col gap-4 p-6 transition-all sm:flex-row sm:items-center sm:justify-between ${
                              isSelected
                                ? "border-2 border-primary bg-secondary/15 shadow-sm"
                                : "hover:border-primary/40"
                            }`}
                            onClick={() => setSelectedCareerId(rec.careerId)}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  #{idx + 1}
                                </span>
                                <h4 className="text-lg font-medium text-black">{rec.title}</h4>
                                <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-success">
                                  {rec.matchPercent}% Match
                                </span>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)]">{rec.summary}</p>

                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {rec.keySkills.map((s) => (
                                  <Chip key={s} tone="skill">
                                    {s}
                                  </Chip>
                                ))}
                              </div>
                            </div>

                            <Button
                              variant={isSelected ? "primary" : "outline"}
                              size="sm"
                              className="shrink-0 self-start sm:self-center"
                            >
                              {isSelected ? t("selected") : t("chooseCareer")}
                            </Button>
                          </Card>
                        );
                      })}
                    </div>

                    <div className="flex justify-between border-t border-border pt-4">
                      <Button variant="outline" onClick={() => setRecommendations(null)}>
                        {t("retestQuiz")}
                      </Button>
                      <Button
                        disabled={!selectedCareerId}
                        onClick={() => setStep(3)}
                      >
                        {t("nextConfirm")}
                        <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        </DataState>
      )}

      {/* STEP 3: Roadmap Generation & Confirmation */}
      {step === 3 && selectedCareer && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <span className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-secondary text-3xl text-primary">
              <Icon name="mingcute:route-line" />
            </span>
            <h2 className="mt-4 text-2xl font-medium text-black sm:text-3xl">
              {t("confirmTitle")}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] sm:text-base">
              {t("confirmSubtitle")}
            </p>
          </div>

          <Card className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-1 border-b border-border pb-4">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {t("targetRoleLabel")}
              </span>
              <h3 className="text-2xl font-bold text-black">{selectedCareer.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{selectedCareer.summary}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {t("startingLevelLabel")}
                </span>
                <p className="text-base font-semibold capitalize text-primary">
                  {t(`level.${experienceLevel}`)}
                </p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {t("curriculumTypeLabel")}
                </span>
                <p className="text-base font-semibold text-black">
                  {t("curriculumTypeValue")}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-secondary/30 p-4 text-sm text-primary">
              <div className="flex items-start gap-2.5">
                <Icon name="mingcute:information-line" className="mt-0.5 text-lg shrink-0" />
                <p>{t("roadmapGenerationNotice")}</p>
              </div>
            </div>

            <div className="flex justify-between border-t border-border pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                {tc("back")}
              </Button>
              <Button
                size="lg"
                disabled={completeMutation.isPending}
                onClick={handleFinish}
              >
                {completeMutation.isPending ? tc("loading") : t("generateRoadmapCTA")}
                <Icon name="mingcute:rocket-line" className="ml-2 text-xl" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
