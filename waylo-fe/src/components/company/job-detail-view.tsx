"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Job, UpdateJobInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Textarea} from "@/components/ui/textarea";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {CurrencyField} from "@/components/shared/currency-field";
import {DataState} from "@/components/shared/data-state";
import {formatCurrencyRange} from "@/lib/format";

export function JobDetailView({id}: {id: string}) {
  const t = useTranslations("company.jobDetail");
  const tj = useTranslations("company.jobs");
  const tc = useTranslations("common");

  const query = useApiQuery<Job>(queryKeys.company.job(id), `/jobs/${id}`);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    title: string;
    location: string;
    workMode: "remote" | "hybrid" | "onsite";
    employmentType: "full_time" | "part_time" | "contract" | "internship";
    salaryMin: string;
    salaryMax: string;
    experienceMinYears: string;
    experienceMaxYears: string;
    description: string;
  } | null>(null);

  const publishMutation = useApiMutation<unknown, Record<string, never>>({
    invalidateKeys: [queryKeys.company.job(id), queryKeys.company.jobs, queryKeys.company.dashboard],
    mapVariables: () => ({
      path: `/jobs/${id}/publish`,
      method: "POST",
    }),
  });

  const updateMutation = useApiMutation<Job, UpdateJobInput>({
    invalidateKeys: [queryKeys.company.job(id), queryKeys.company.jobs],
    mapVariables: (body) => ({
      path: `/jobs/${id}`,
      method: "PATCH",
      body,
    }),
    onSuccess: () => {
      setIsEditing(false);
      setEditForm(null);
    },
  });

  const employmentTypeOptions = [
    {value: "full_time", label: tj("employmentType.full_time")},
    {value: "part_time", label: tj("employmentType.part_time")},
    {value: "contract", label: tj("employmentType.contract")},
    {value: "internship", label: tj("employmentType.internship")},
  ];
  const workModeOptions = [
    {value: "remote", label: tj("workMode.remote")},
    {value: "hybrid", label: tj("workMode.hybrid")},
    {value: "onsite", label: tj("workMode.onsite")},
  ];

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(job) => {
        function startEditing() {
          setEditForm({
            title: job.title,
            location: job.location,
            workMode: job.workMode,
            employmentType: job.employmentType,
            salaryMin: job.salaryMin !== null ? String(job.salaryMin) : "",
            salaryMax: job.salaryMax !== null ? String(job.salaryMax) : "",
            experienceMinYears: job.experienceMinYears !== null ? String(job.experienceMinYears) : "",
            experienceMaxYears: job.experienceMaxYears !== null ? String(job.experienceMaxYears) : "",
            description: job.description,
          });
          setIsEditing(true);
        }

        function handleSave() {
          if (!editForm) return;
          const payload: UpdateJobInput = {
            title: editForm.title.trim(),
            location: editForm.location.trim(),
            workMode: editForm.workMode,
            employmentType: editForm.employmentType,
            salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : null,
            salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : null,
            experienceMinYears: editForm.experienceMinYears ? Number(editForm.experienceMinYears) : null,
            experienceMaxYears: editForm.experienceMaxYears ? Number(editForm.experienceMaxYears) : null,
            description: editForm.description.trim(),
          };
          void updateMutation.mutateAsync(payload);
        }

        return (
          <div className="flex flex-col gap-8">
            <div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/company/jobs">
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {tc("back")}
                </Link>
              </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-medium text-black">{job.title}</h1>
                  <Chip tone={job.status === "published" ? "success" : "muted"}>
                    {tj(`status.${job.status}`)}
                  </Chip>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {job.companyName} • {job.location} • {tj(`workMode.${job.workMode}`)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {job.status !== "published" && (
                  <Button
                    onClick={() => void publishMutation.mutateAsync({})}
                    disabled={publishMutation.isPending}
                    size="sm"
                  >
                    <Icon name="mingcute:send-plane-line" className="mr-1 text-base" />
                    {publishMutation.isPending ? tc("loading") : t("publishJob")}
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/company/candidates`}>
                    <Icon name="mingcute:user-follow-line" className="mr-1 text-base" />
                    {t("viewApplicants")} ({job.applicantCount ?? 0})
                  </Link>
                </Button>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Icon name="mingcute:edit-line" className="mr-1 text-base" />
                    {t("editJob")}
                  </Button>
                )}
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-xs text-[var(--muted-foreground)]">{t("statSalary")}</span>
                <span className="text-sm font-semibold text-black">
                  {formatCurrencyRange(job.salaryMin, job.salaryMax) ?? tj("salaryUnspecified")}
                </span>
              </Card>
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-xs text-[var(--muted-foreground)]">{t("statExperience")}</span>
                <span className="text-sm font-semibold text-black">
                  {tj("experienceRange", {
                    min: job.experienceMinYears ?? 0,
                    max: job.experienceMaxYears ?? 0,
                  })}
                </span>
              </Card>
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-xs text-[var(--muted-foreground)]">{t("statType")}</span>
                <span className="text-sm font-semibold text-black">
                  {tj(`employmentType.${job.employmentType}`)}
                </span>
              </Card>
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-xs text-[var(--muted-foreground)]">{t("statApplicants")}</span>
                <span className="text-sm font-semibold text-primary">
                  {job.applicantCount ?? 0} {t("candidatesCount")}
                </span>
              </Card>
            </div>

            {isEditing && editForm ? (
              <Card className="flex flex-col gap-5 p-6">
                <h2 className="text-xl font-medium text-black">{t("editFormTitle")}</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    id="title"
                    label={tj("fields.title")}
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => f && {...f, title: e.target.value})}
                  />
                  <Field
                    id="location"
                    label={tj("fields.location")}
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => f && {...f, location: e.target.value})}
                  />
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary">
                      {tj("fields.employmentType")}
                    </span>
                    <Select
                      value={editForm.employmentType}
                      onChange={(v) =>
                        setEditForm((f) =>
                          f
                            ? {
                                ...f,
                                employmentType: v as
                                  | "full_time"
                                  | "part_time"
                                  | "contract"
                                  | "internship",
                              }
                            : null,
                        )
                      }
                      options={employmentTypeOptions}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-primary">
                      {tj("fields.workMode")}
                    </span>
                    <Select
                      value={editForm.workMode}
                      onChange={(v) =>
                        setEditForm((f) =>
                          f
                            ? {
                                ...f,
                                workMode: v as "remote" | "hybrid" | "onsite",
                              }
                            : null,
                        )
                      }
                      options={workModeOptions}
                    />
                  </label>
                  <CurrencyField
                    id="salaryMin"
                    label={tj("fields.salaryMin")}
                    value={editForm.salaryMin}
                    onChange={(raw) => setEditForm((f) => f && {...f, salaryMin: raw})}
                  />
                  <CurrencyField
                    id="salaryMax"
                    label={tj("fields.salaryMax")}
                    value={editForm.salaryMax}
                    onChange={(raw) => setEditForm((f) => f && {...f, salaryMax: raw})}
                  />
                  <Field
                    id="experienceMin"
                    type="number"
                    inputMode="numeric"
                    label={tj("fields.experienceMin")}
                    value={editForm.experienceMinYears}
                    onChange={(e) =>
                      setEditForm((f) => f && {...f, experienceMinYears: e.target.value})
                    }
                  />
                  <Field
                    id="experienceMax"
                    type="number"
                    inputMode="numeric"
                    label={tj("fields.experienceMax")}
                    value={editForm.experienceMaxYears}
                    onChange={(e) =>
                      setEditForm((f) => f && {...f, experienceMaxYears: e.target.value})
                    }
                  />
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary">
                    {tj("fields.description")}
                  </span>
                  <Textarea
                    rows={6}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => f && {...f, description: e.target.value})}
                  />
                </label>

                <div className="flex justify-end gap-3 pt-3">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? tc("loading") : tc("save")}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="flex flex-col gap-5 p-6 lg:col-span-2">
                  <h2 className="text-xl font-medium text-black">{t("descriptionTitle")}</h2>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                    {job.description}
                  </div>
                </Card>

                <Card className="flex flex-col gap-4 p-6">
                  <h2 className="text-xl font-medium text-black">{t("skillsTitle")}</h2>
                  <div className="flex flex-col gap-2.5">
                    {job.skills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="flex items-center justify-between rounded-xl border border-border p-3"
                      >
                        <span className="text-sm font-medium text-black">{skill.name}</span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                          {skill.minLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        );
      }}
    </DataState>
  );
}
