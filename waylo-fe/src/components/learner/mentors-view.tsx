"use client";

import {useTranslations} from "next-intl";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Mentor} from "@waylo/shared";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function MentorsView() {
  const t = useTranslations("learner.mentors");
  const query = useApiQuery<Mentor[]>(queryKeys.learner.mentors, "/learner/mentors");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:user-star-line"
    >
      {(data) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((mentor) => (
              <Card key={mentor.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                  <InitialsAvatar
                    initials={mentor.avatarInitials}
                    size="lg"
                    label={mentor.fullName}
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-medium text-black">
                      {mentor.fullName}
                    </h2>
                    <p className="truncate text-sm text-[var(--text-secondary)]">
                      {mentor.headline}
                    </p>
                  </div>
                </div>
                {mentor.rating !== null ? (
                  <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <Icon name="mingcute:star-fill" className="text-[#FFB206]" />
                    {mentor.rating}{" "}
                    <span className="text-[var(--muted-foreground)]">
                      ({mentor.reviewCount} ulasan)
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t("noRating")}
                  </p>
                )}
                {mentor.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <Chip key={skill} tone="skill">
                        {skill}
                      </Chip>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/learner/mentors/${mentor.id}`}>
                      {t("viewProfile")}
                      <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  );
}
