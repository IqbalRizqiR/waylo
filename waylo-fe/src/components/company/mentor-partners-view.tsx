"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {MentorPartner, InviteMentorPartnerInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function CompanyMentorPartnersView() {
  const t = useTranslations("company.mentorPartners");

  const query = useApiQuery<MentorPartner[]>(
    queryKeys.company.mentorPartners,
    "/company/mentor-partners",
  );

  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const inviteMutation = useApiMutation<{success: boolean}, InviteMentorPartnerInput>({
    mapVariables: (body) => ({
      path: "/company/mentor-partners/invite",
      method: "POST",
      body,
    }),
    onSuccess: (_, vars) => {
      setInvitedIds((prev) => new Set([...prev, vars.mentorId]));
    },
  });

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:user-star-line"
    >
      {(mentors) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          {/* Feature explainer card */}
          <Card className="flex flex-col gap-3 border-primary/20 bg-secondary/20 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
                <Icon name="mingcute:award-line" />
              </span>
              <div>
                <h2 className="text-base font-medium text-black">
                  {t("bannerTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                  {t("bannerSubtitle")}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t("premiumFeature")}
            </span>
          </Card>

          {/* Mentors grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => {
              const isInvited = invitedIds.has(mentor.id) || mentor.isInvited;

              return (
                <Card key={mentor.id} className="flex flex-col justify-between p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <InitialsAvatar
                        initials={mentor.avatarInitials}
                        size="lg"
                        label={mentor.fullName}
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-black">
                          {mentor.fullName}
                        </h3>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {mentor.headline}
                        </p>
                      </div>
                    </div>

                    {mentor.rating !== null ? (
                      <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <Icon name="mingcute:star-fill" className="text-[#FFB206]" />
                        <span className="font-semibold text-black">{mentor.rating}</span>
                        <span className="text-[var(--muted-foreground)]">
                          ({mentor.reviewCount} ulasan)
                        </span>
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-1.5">
                      {mentor.skills.map((skill) => (
                        <Chip key={skill} tone="skill">
                          {skill}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    {isInvited ? (
                      <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-success">
                        <Icon name="mingcute:check-circle-line" className="text-base" />
                        <span>{t("invited")}</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={inviteMutation.isPending}
                        onClick={() =>
                          void inviteMutation.mutateAsync({
                            mentorId: mentor.id,
                            note: "Undangan screening kandidat dari perusahaan kami.",
                          })
                        }
                      >
                        <Icon name="mingcute:user-add-line" className="mr-1 text-base" />
                        {t("inviteMentor")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </DataState>
  );
}
