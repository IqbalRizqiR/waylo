"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CareerDetailWithGap} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-blue-50 text-blue-700 border-blue-200",
  intermediate: "bg-teal-50 text-teal-700 border-teal-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
  expert: "bg-amber-50 text-amber-700 border-amber-200",
};

export function CareerDetailView({id}: {id: string}) {
  const t = useTranslations("learner.careerDetail");
  const tc = useTranslations("common");
  const query = useApiQuery<CareerDetailWithGap>(
    queryKeys.catalogue.career(id),
    `/careers/${id}`,
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(career) => (
        <div className="flex flex-col gap-8">
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learner/careers">
                <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                {tc("back")}
              </Link>
            </Button>
          </div>

          <PageHeader title={career.title} subtitle={career.summary} />

          {/* Match stats banner */}
          <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-primary">
                {career.matchPercent}%
              </div>
              <div>
                <h2 className="text-lg font-medium text-black">{t("matchTitle")}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {t("matchSubtitle", {percent: career.matchPercent})}
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/learner/roadmap">
                {t("goToRoadmap")}
                <Icon name="mingcute:arrow-right-line" className="ml-2 text-xl" />
              </Link>
            </Button>
          </Card>

          {/* Skill Gap Analysis Table */}
          <Card className="flex flex-col gap-5 p-6">
            <div>
              <h2 className="text-xl font-medium text-black">{t("gapTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {t("gapSubtitle")}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-[var(--muted-foreground)]">
                    <th className="pb-3 font-medium">{t("colSkill")}</th>
                    <th className="pb-3 font-medium">{t("colRequired")}</th>
                    <th className="pb-3 font-medium">{t("colCurrent")}</th>
                    <th className="pb-3 font-medium">{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {career.skillGap.map((item) => {
                    const hasSkill = item.currentLevel !== null;
                    const reqRank = rankOf(item.requiredLevel);
                    const curRank = item.currentLevel ? rankOf(item.currentLevel) : 0;
                    const isMet = curRank >= reqRank;

                    return (
                      <tr key={item.skill.id} className="py-3">
                        <td className="py-3.5 pr-4">
                          <span className="font-medium text-black">{item.skill.name}</span>
                          <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                            {item.skill.category}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                              LEVEL_COLORS[item.requiredLevel] ?? ""
                            }`}
                          >
                            {item.requiredLevel}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          {hasSkill ? (
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                                LEVEL_COLORS[item.currentLevel!] ?? ""
                              }`}
                            >
                              {item.currentLevel}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {t("notStarted")}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          {isMet ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                              <Icon name="mingcute:check-circle-line" className="text-base" />
                              {item.isVerified ? t("verified") : t("met")}
                            </span>
                          ) : hasSkill ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                              <Icon name="mingcute:time-line" className="text-base" />
                              {t("inProgress")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                              <Icon name="mingcute:close-circle-line" className="text-base" />
                              {t("gap")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DataState>
  );
}

function rankOf(level: string): number {
  switch (level) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    case "expert":
      return 4;
    default:
      return 0;
  }
}
