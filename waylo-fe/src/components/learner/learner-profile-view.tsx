"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Career, LearnerProfile, UpdateLearnerProfileInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {Textarea} from "@/components/ui/textarea";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function LearnerProfileView() {
  const t = useTranslations("learner.profile");

  const profileQuery = useApiQuery<LearnerProfile>(
    queryKeys.learner.profile,
    "/learner/profile",
  );
  const careersQuery = useApiQuery<Career[]>(
    queryKeys.catalogue.careers,
    "/careers",
  );

  return (
    <DataState
      query={profileQuery}
      data={profileQuery.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(profile) => (
        <LearnerProfileContent
          profile={profile}
          careers={careersQuery.data ?? []}
        />
      )}
    </DataState>
  );
}

function LearnerProfileContent({
  profile,
  careers,
}: {
  profile: LearnerProfile;
  careers: Career[];
}) {
  const t = useTranslations("learner.profile");
  const tc = useTranslations("common");

  const [form, setForm] = useState<UpdateLearnerProfileInput>({
    fullName: profile.fullName,
    headline: profile.headline,
    location: profile.location,
    bio: profile.bio ?? "",
    targetCareerId: profile.targetCareerId,
    openToWork: profile.openToWork,
    talentPoolOptIn: profile.talentPoolOptIn,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateMutation = useApiMutation<LearnerProfile, UpdateLearnerProfileInput>({
    invalidateKeys: [
      queryKeys.learner.profile,
      queryKeys.learner.dashboard,
      queryKeys.session,
    ],
    mapVariables: (body) => ({
      path: "/learner/profile",
      method: "PATCH",
      body,
    }),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  const careerOptions = [
    {value: "", label: t("noCareerSelected")},
    ...careers.map((c) => ({value: c.id, label: c.title})),
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void updateMutation.mutateAsync({
      fullName: form.fullName?.trim(),
      headline: form.headline?.trim(),
      location: form.location?.trim(),
      bio: form.bio?.trim(),
      targetCareerId: form.targetCareerId || null,
      openToWork: form.openToWork,
      talentPoolOptIn: form.talentPoolOptIn,
    });
  }

  const verifiedSkills = profile.skills.filter((s) => s.isVerified);

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
        {/* Left Column: Summary Card */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center gap-4 p-6 text-center">
            <InitialsAvatar
              initials={profile.avatarInitials}
              size="lg"
              label={profile.fullName}
              className="size-20 text-2xl font-bold"
            />

            <div>
              <h2 className="text-xl font-medium text-black">{profile.fullName}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {profile.headline || t("headlineUnset")}
              </p>
              {profile.location ? (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[var(--muted-foreground)]">
                  <Icon name="mingcute:map-pin-line" />
                  {profile.location}
                </p>
              ) : null}
            </div>

            {profile.targetCareerTitle ? (
              <div className="rounded-xl border border-primary/20 bg-secondary/30 px-3.5 py-1.5 text-xs font-medium text-primary">
                {t("targetRole")}: {profile.targetCareerTitle}
              </div>
            ) : null}

            {profile.openToWork ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" />
                {t("openToWorkBadge")}
              </span>
            ) : null}
          </Card>

          {/* Verified Skills Showcase */}
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black">{t("verifiedSkillsTitle")}</h3>
              <span className="text-xs text-[var(--muted-foreground)]">
                {verifiedSkills.length} skill
              </span>
            </div>

            {verifiedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {verifiedSkills.map((s) => (
                  <Chip key={s.skill.id} tone="success" className="capitalize">
                    <Icon name="mingcute:check-circle-line" className="mr-1 text-xs" />
                    {s.skill.name} ({s.level})
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                {t("noVerifiedSkillsYet")}
              </p>
            )}

            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/learner/assessments">
                {t("takeAssessmentCTA")}
                <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
              </Link>
            </Button>
          </Card>

          {/* Certificates Count */}
          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon name="mingcute:certificate-line" className="text-xl" />
              </span>
              <div>
                <span className="text-sm font-medium text-black">{t("certificatesEarned")}</span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {profile.certificates.filter((c) => c.status === "obtained").length} sertifikat
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learner/certificates">{tc("viewAll")}</Link>
            </Button>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form & UU PDP Talent Pool Settings */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h2 className="text-xl font-medium text-black">{t("formTitle")}</h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  id="fullName"
                  label={t("nameLabel")}
                  value={form.fullName ?? ""}
                  onChange={(e) => setForm((prev) => ({...prev, fullName: e.target.value}))}
                  required
                />

                <Field
                  id="headline"
                  label={t("headlineLabel")}
                  placeholder={t("headlinePlaceholder")}
                  value={form.headline ?? ""}
                  onChange={(e) => setForm((prev) => ({...prev, headline: e.target.value}))}
                />

                <Field
                  id="location"
                  label={t("locationLabel")}
                  placeholder={t("locationPlaceholder")}
                  value={form.location ?? ""}
                  onChange={(e) => setForm((prev) => ({...prev, location: e.target.value}))}
                />

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-primary">
                    {t("targetCareerLabel")}
                  </span>
                  <Select
                    value={form.targetCareerId ?? ""}
                    onChange={(v) =>
                      setForm((prev) => ({...prev, targetCareerId: v || null}))
                    }
                    options={careerOptions}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-primary">{t("bioLabel")}</span>
                <Textarea
                  rows={4}
                  placeholder={t("bioPlaceholder")}
                  value={form.bio ?? ""}
                  onChange={(e) => setForm((prev) => ({...prev, bio: e.target.value}))}
                />
              </label>

              {/* UU PDP Consent & Job Seeking Controls */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-5">
                <h3 className="text-sm font-semibold text-black">{t("privacySectionTitle")}</h3>

                {/* Open to Work Toggle */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.openToWork ?? false}
                    onChange={(e) =>
                      setForm((prev) => ({...prev, openToWork: e.target.checked}))
                    }
                    className="mt-1 size-4 rounded accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-black">
                      {t("openToWorkLabel")}
                    </span>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t("openToWorkHint")}
                    </p>
                  </div>
                </label>

                {/* Talent Pool UU PDP Legal Consent */}
                <label className="flex items-start gap-3 cursor-pointer border-t border-border/60 pt-3">
                  <input
                    type="checkbox"
                    checked={form.talentPoolOptIn ?? false}
                    onChange={(e) =>
                      setForm((prev) => ({...prev, talentPoolOptIn: e.target.checked}))
                    }
                    className="mt-1 size-4 rounded accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-black">
                      {t("talentPoolOptInLabel")}
                    </span>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t("talentPoolOptInHint")}
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateMutation.isPending} size="lg">
                  {updateMutation.isPending ? tc("loading") : tc("save")}
                  <Icon name="mingcute:save-line" className="ml-2 text-xl" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
