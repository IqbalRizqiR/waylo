"use client";

import {useTranslations} from "next-intl";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Certificate} from "@waylo/shared";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";
import {formatLongDate} from "@/lib/format";

export function CertificatesView() {
  const t = useTranslations("learner.certificates");
  const query = useApiQuery<Certificate[]>(
    queryKeys.learner.certificates,
    "/learner/certificates",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:certificate-line"
    >
      {(data) => {
        const obtained = data.filter((c) => c.status === "obtained");
        const available = data.filter((c) => c.status === "available");
        return (
          <div className="flex flex-col gap-8">
            <PageHeader title={t("title")} subtitle={t("subtitle")} />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon="mingcute:certificate-line"
                label={t("stats.total")}
                value={String(data.length)}
              />
              <StatCard
                icon="mingcute:check-circle-line"
                label={t("stats.obtained")}
                value={String(obtained.length)}
                tone="success"
              />
              <StatCard
                icon="mingcute:time-line"
                label={t("stats.available")}
                value={String(available.length)}
                tone="muted"
              />
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {data.map((certificate) => (
                <Card key={certificate.id} className="flex flex-col gap-4 p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                      <Icon name="mingcute:certificate-line" className="text-2xl" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-medium text-black">
                        {certificate.title}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {certificate.issuer}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {certificate.status === "obtained" && certificate.obtainedAt
                          ? t("obtainedAt", {
                              date: formatLongDate(certificate.obtainedAt),
                            })
                          : t("notObtained")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Chip tone={certificate.status === "obtained" ? "success" : "muted"}>
                      {certificate.status === "obtained"
                        ? t("status.obtained")
                        : t("status.available")}
                    </Chip>
                    {certificate.verificationUrl ? (
                      <a
                        href={certificate.verificationUrl}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t("verify")}
                      </a>
                    ) : null}
                    <Button asChild variant="outline" size="sm" className="ml-auto">
                      <Link href={`/learner/certificates/${certificate.id}`}>
                        {t("viewDetail")}
                        <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
