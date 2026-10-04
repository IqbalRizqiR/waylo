"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CompanyProfile, UpdateCompanyProfileInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function CompanyProfileView() {
  const t = useTranslations("company.profile");

  const query = useApiQuery<CompanyProfile>(
    queryKeys.company.profile,
    "/company/profile",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(profile) => <CompanyProfileContent profile={profile} />}
    </DataState>
  );
}

function CompanyProfileContent({profile}: {profile: CompanyProfile}) {
  const t = useTranslations("company.profile");
  const tc = useTranslations("common");

  const [form, setForm] = useState<UpdateCompanyProfileInput>({
    name: profile.name,
    industry: profile.industry ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
    employeeCount: profile.employeeCount ?? "",
    description: profile.description ?? "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateMutation = useApiMutation<CompanyProfile, UpdateCompanyProfileInput>({
    invalidateKeys: [queryKeys.company.profile, queryKeys.company.dashboard],
    mapVariables: (body) => ({
      path: "/company/profile",
      method: "PATCH",
      body,
    }),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  const employeeCountOptions = [
    {value: "", label: t("employeeCountSelect")},
    {value: "1-10", label: "1 - 10 karyawan"},
    {value: "11-50", label: "11 - 50 karyawan"},
    {value: "51-200", label: "51 - 200 karyawan"},
    {value: "201-500", label: "201 - 500 karyawan"},
    {value: "500+", label: "Lebih dari 500 karyawan"},
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void updateMutation.mutateAsync({
      name: form.name?.trim(),
      industry: form.industry?.trim(),
      location: form.location?.trim(),
      website: form.website?.trim() || "",
      employeeCount: form.employeeCount || undefined,
      description: form.description?.trim(),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {saveSuccess ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success">
          <Icon name="mingcute:check-circle-line" className="text-lg" />
          <span>{t("saveSuccess")}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Overview / Card summary */}
        <Card className="flex flex-col items-center gap-4 p-6 text-center">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-secondary text-3xl font-bold text-primary">
            {profile.name.slice(0, 2).toUpperCase()}
          </span>

          <div>
            <h2 className="text-xl font-medium text-black">{profile.name}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {profile.industry || t("industryUnset")} • {profile.location || t("locationUnset")}
            </p>
          </div>

          {profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Icon name="mingcute:external-link-line" />
              {profile.website}
            </a>
          ) : null}

          {profile.employeeCount ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
              {profile.employeeCount} karyawan
            </span>
          ) : null}
        </Card>

        {/* Edit form */}
        <Card className="p-6 lg:col-span-2 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-black">{t("formTitle")}</h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                id="companyName"
                label={t("nameLabel")}
                value={form.name ?? ""}
                onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
                required
              />

              <Field
                id="industry"
                label={t("industryLabel")}
                placeholder={t("industryPlaceholder")}
                value={form.industry ?? ""}
                onChange={(e) => setForm((prev) => ({...prev, industry: e.target.value}))}
              />

              <Field
                id="location"
                label={t("locationLabel")}
                placeholder={t("locationPlaceholder")}
                value={form.location ?? ""}
                onChange={(e) => setForm((prev) => ({...prev, location: e.target.value}))}
              />

              <Field
                id="website"
                label={t("websiteLabel")}
                placeholder="https://company.com"
                value={form.website ?? ""}
                onChange={(e) => setForm((prev) => ({...prev, website: e.target.value}))}
              />
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("employeeCountLabel")}
              </span>
              <Select
                value={form.employeeCount ?? ""}
                onChange={(v) => setForm((prev) => ({...prev, employeeCount: v}))}
                options={employeeCountOptions}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("descriptionLabel")}
              </span>
              <Textarea
                rows={5}
                placeholder={t("descriptionPlaceholder")}
                value={form.description ?? ""}
                onChange={(e) => setForm((prev) => ({...prev, description: e.target.value}))}
              />
            </label>

            <div className="flex justify-end pt-3">
              <Button type="submit" disabled={updateMutation.isPending} size="lg">
                {updateMutation.isPending ? tc("loading") : tc("save")}
                <Icon name="mingcute:save-line" className="ml-2 text-xl" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
