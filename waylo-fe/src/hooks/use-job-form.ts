"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";
import {createJobSchema, type Job, type Skill} from "@waylo/shared";
import {useApiMutation, useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import {useSubmitState} from "@/hooks/use-submit-state";

export type JobFormState = {
  title: string;
  description: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  workMode: "remote" | "hybrid" | "onsite";
  location: string;
  salaryMin: string;
  salaryMax: string;
  experienceMinYears: string;
  experienceMaxYears: string;
};

const INITIAL_JOB_FORM: JobFormState = {
  title: "",
  description: "",
  employmentType: "full_time",
  workMode: "remote",
  location: "",
  salaryMin: "",
  salaryMax: "",
  experienceMinYears: "",
  experienceMaxYears: "",
};

const TOTAL_STEPS = 3;

// All create-job state, validation, and API calls. The view renders only.
export function useJobForm() {
  const t = useTranslations("company.createJob");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<JobFormState>(INITIAL_JOB_FORM);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const {isPending, error, setError, run} = useSubmitState();

  const {data: skillsData} = useApiQuery<Skill[]>(
    queryKeys.catalogue.skills,
    "/skills",
  );
  const catalogue = skillsData ?? [];

  const createJob = useApiMutation<Job, void>({
    mapVariables: () => ({
      path: "/jobs",
      method: "POST",
      body: buildPayload(),
    }),
    invalidateKeys: [queryKeys.company.jobs, queryKeys.company.dashboard],
  });

  function update<K extends keyof JobFormState>(key: K, value: JobFormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function toggleSkill(id: string) {
    setSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function buildPayload() {
    const payload = {
      title: form.title,
      description: form.description,
      employmentType: form.employmentType,
      workMode: form.workMode,
      location: form.location,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      experienceMinYears: form.experienceMinYears
        ? Number(form.experienceMinYears)
        : null,
      experienceMaxYears: form.experienceMaxYears
        ? Number(form.experienceMaxYears)
        : null,
      skills: skillIds.map((skillId) => ({
        skillId,
        minLevel: "intermediate" as const,
      })),
    };

    const parsed = createJobSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(t("errors.incomplete"));
    }
    return parsed.data;
  }

  function validateStepOne(): string | null {
    if (form.title.trim().length < 3) return t("errors.title");
    if (form.description.trim().length < 20) return t("errors.description");
    if (form.location.trim().length < 2) return t("errors.location");
    return null;
  }

  function goNext() {
    setError(null);
    if (step === 1) {
      const message = validateStepOne();
      if (message) {
        setError(message);
        return;
      }
    }
    if (step === 2 && skillIds.length === 0) {
      setError(t("errors.skills"));
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    if (step === 1) {
      router.push("/company/jobs");
      return;
    }
    setStep((s) => s - 1);
  }

  async function submit() {
    await run(async () => {
      await createJob.mutateAsync();
      await router.push("/company/jobs");
    }, t("errors.incomplete"));
  }

  return {
    step,
    totalSteps: TOTAL_STEPS,
    form,
    update,
    skillIds,
    toggleSkill,
    catalogue,
    goNext,
    goBack,
    submit,
    isPending,
    error,
    stepLabelKeys: ["steps.info", "steps.skills", "steps.preview"],
  };
}
