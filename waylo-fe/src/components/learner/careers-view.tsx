"use client";

import {useTranslations} from "next-intl";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Career} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";

export function CareersView() {
  const t = useTranslations("learner.careers");
  const query = useApiQuery<Career[]>(queryKeys.catalogue.careers, "/careers");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:briefcase-line"
    >
      {(data) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((career) => (
              <Card key={career.id} className="flex flex-col gap-3 p-6">
                <span className="flex size-12 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                  <Icon name="mingcute:briefcase-line" className="text-2xl" />
                </span>
                <h2 className="text-lg font-medium text-black">{career.title}</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {career.summary}
                </p>
                <div className="mt-auto pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/learner/careers/${career.id}`}>
                      {t("viewDetail")}
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
