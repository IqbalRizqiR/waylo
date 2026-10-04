"use client";

import {useTranslations} from "next-intl";
import {useJobForm} from "@/hooks/use-job-form";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {CurrencyField} from "@/components/shared/currency-field";
import {Stepper} from "./stepper";
import {JobSkillPicker} from "./job-skill-picker";
import {JobPreview} from "./job-preview";

export function CreateJobView() {
  const t = useTranslations("company.createJob");
  const tc = useTranslations("common");
  const job = useJobForm();

  const employmentTypeOptions = [
    {value: "full_time", label: t("employmentType.full_time")},
    {value: "part_time", label: t("employmentType.part_time")},
    {value: "contract", label: t("employmentType.contract")},
    {value: "internship", label: t("employmentType.internship")},
  ];
  const workModeOptions = [
    {value: "remote", label: t("workMode.remote")},
    {value: "hybrid", label: t("workMode.hybrid")},
    {value: "onsite", label: t("workMode.onsite")},
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-medium text-black">{t("title")}</h1>
        <p className="mt-1 text-lg text-[var(--muted-foreground)]">
          {t("subtitle")}
        </p>
      </header>

      <Stepper step={job.step} labelKeys={job.stepLabelKeys} />

      {job.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] bg-[#ffe4e9] px-4 py-3 text-sm text-destructive"
        >
          {job.error}
        </p>
      ) : null}

      {job.step === 1 ? (
        <Card className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-medium text-black">{t("infoTitle")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              id="title"
              label={t("fields.title")}
              placeholder={t("placeholders.title")}
              value={job.form.title}
              onChange={(e) => job.update("title", e.target.value)}
            />
            <Field
              id="location"
              label={t("fields.location")}
              placeholder={t("placeholders.location")}
              value={job.form.location}
              onChange={(e) => job.update("location", e.target.value)}
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("fields.employmentType")}
              </span>
              <Select
                value={job.form.employmentType}
                onChange={(v) =>
                  job.update("employmentType", v as typeof job.form.employmentType)
                }
                options={employmentTypeOptions}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("fields.workMode")}
              </span>
              <Select
                value={job.form.workMode}
                onChange={(v) => job.update("workMode", v as typeof job.form.workMode)}
                options={workModeOptions}
              />
            </label>
            <CurrencyField
              id="salaryMin"
              label={t("fields.salaryMin")}
              placeholder="8.000.000"
              value={job.form.salaryMin}
              onChange={(raw) => job.update("salaryMin", raw)}
            />
            <CurrencyField
              id="salaryMax"
              label={t("fields.salaryMax")}
              placeholder="12.000.000"
              value={job.form.salaryMax}
              onChange={(raw) => job.update("salaryMax", raw)}
            />
            <Field
              id="experienceMin"
              type="number"
              inputMode="numeric"
              label={t("fields.experienceMin")}
              placeholder="1"
              value={job.form.experienceMinYears}
              onChange={(e) => job.update("experienceMinYears", e.target.value)}
            />
            <Field
              id="experienceMax"
              type="number"
              inputMode="numeric"
              label={t("fields.experienceMax")}
              placeholder="3"
              value={job.form.experienceMaxYears}
              onChange={(e) => job.update("experienceMaxYears", e.target.value)}
            />
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-primary">
              {t("fields.description")}
            </span>
            <Textarea
              rows={5}
              placeholder={t("placeholders.description")}
              value={job.form.description}
              onChange={(e) => job.update("description", e.target.value)}
            />
          </label>
        </Card>
      ) : null}

      {job.step === 2 ? (
        <Card className="flex flex-col gap-5 p-6">
          <h2 className="text-xl font-medium text-black">{t("skillsTitle")}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t("skillsSubtitle")}</p>
          <JobSkillPicker
            catalogue={job.catalogue}
            selected={job.skillIds}
            onToggle={job.toggleSkill}
          />
        </Card>
      ) : null}

      {job.step === 3 ? (
        <JobPreview
          title={job.form.title}
          location={job.form.location}
          workMode={job.form.workMode}
          employmentType={job.form.employmentType}
          description={job.form.description}
          skillIds={job.skillIds}
          catalogue={job.catalogue}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={job.goBack} disabled={job.isPending}>
          {job.step === 1 ? tc("cancel") : tc("back")}
        </Button>
        <div className="flex flex-wrap gap-3">
          {job.step > 1 ? (
            <Button
              variant="outline"
              onClick={() => void job.submit()}
              disabled={job.isPending}
            >
              {t("saveDraft")}
            </Button>
          ) : null}
          {job.step < job.totalSteps ? (
            <Button onClick={job.goNext}>{t("nextPreview")}</Button>
          ) : (
            <Button onClick={() => void job.submit()} disabled={job.isPending}>
              {job.isPending ? tc("loading") : t("publish")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
