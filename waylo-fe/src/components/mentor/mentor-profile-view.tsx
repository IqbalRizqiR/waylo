"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {UpdateMentorProfileInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {CurrencyField} from "@/components/shared/currency-field";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatCurrency} from "@/lib/format";

type MentorProfileData = {
  id: string;
  fullName: string;
  email: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  expertise: string[];
  rating: number | null;
  reviewCount: number;
};

export function MentorProfileView() {
  const t = useTranslations("mentor.profile");

  const query = useApiQuery<MentorProfileData>(
    queryKeys.mentor.profile,
    "/mentor/profile",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(profile) => <MentorProfileContent profile={profile} />}
    </DataState>
  );
}

function MentorProfileContent({profile}: {profile: MentorProfileData}) {
  const t = useTranslations("mentor.profile");
  const tc = useTranslations("common");

  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate || "250000"));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateMutation = useApiMutation<MentorProfileData, UpdateMentorProfileInput>({
    invalidateKeys: [queryKeys.mentor.profile, queryKeys.mentor.dashboard],
    mapVariables: (body) => ({
      path: "/mentor/profile",
      method: "PATCH",
      body,
    }),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void updateMutation.mutateAsync({
      headline: headline.trim(),
      bio: bio.trim(),
      hourlyRate: Number(hourlyRate) || 0,
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Public Card (5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="flex size-20 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-primary">
              {profile.fullName.slice(0, 2).toUpperCase()}
            </span>

            <div>
              <h2 className="text-xl font-bold text-black">{profile.fullName}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{profile.headline}</p>
            </div>

            {profile.rating !== null ? (
              <div className="flex items-center gap-1.5 text-sm">
                <Icon name="mingcute:star-fill" className="text-[#FFB206]" />
                <span className="font-semibold text-black">{profile.rating}</span>
                <span className="text-[var(--muted-foreground)]">
                  ({profile.reviewCount} ulasan)
                </span>
              </div>
            ) : null}

            <div className="w-full border-t border-border pt-4">
              <span className="text-xs text-[var(--muted-foreground)]">{t("rateLabel")}</span>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(profile.hourlyRate || 250000)} / {t("hour")}
              </p>
            </div>

            {profile.expertise.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {profile.expertise.map((exp) => (
                  <Chip key={exp} tone="skill">
                    {exp}
                  </Chip>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Right Column: Edit Profile Form (7 cols) */}
        <Card className="p-6 sm:p-8 lg:col-span-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-black">{t("formTitle")}</h2>

            <Field
              id="headline"
              label={t("headlineFieldLabel")}
              placeholder={t("headlineFieldPlaceholder")}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
            />

            <CurrencyField
              id="hourlyRate"
              label={t("rateFieldLabel")}
              placeholder="250.000"
              value={hourlyRate}
              onChange={(raw) => setHourlyRate(raw)}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">{t("bioFieldLabel")}</span>
              <Textarea
                rows={5}
                placeholder={t("bioFieldPlaceholder")}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>

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
  );
}
