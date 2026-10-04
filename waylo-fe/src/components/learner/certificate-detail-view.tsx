"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Certificate} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Chip} from "@/components/ui/chip";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatLongDate} from "@/lib/format";

export function CertificateDetailView({id}: {id: string}) {
  const t = useTranslations("learner.certificates");
  const tc = useTranslations("common");

  const query = useApiQuery<Certificate>(
    queryKeys.learner.certificate(id),
    `/learner/certificates/${id}`,
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(certificate) => (
        <div className="flex flex-col gap-8">
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learner/certificates">
                <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                {tc("back")}
              </Link>
            </Button>
          </div>

          <PageHeader title={certificate.title} subtitle={certificate.issuer} />

          {/* Certificate display card */}
          <div className="mx-auto w-full max-w-2xl">
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white via-surface to-secondary/20 p-8 sm:p-12 shadow-[0_0_35px_0_rgba(0,30,192,0.08)]">
              {/* Corner accents */}
              <div className="absolute left-4 top-4 size-8 border-l-2 border-t-2 border-primary/40" />
              <div className="absolute right-4 top-4 size-8 border-r-2 border-t-2 border-primary/40" />
              <div className="absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-primary/40" />
              <div className="absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-primary/40" />

              <div className="flex flex-col items-center gap-6 text-center">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-3xl text-primary">
                  <Icon name="mingcute:certificate-line" />
                </span>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                    {t("certificateOfCompletion")}
                  </span>
                  <h2 className="mt-2 text-2xl font-medium text-black sm:text-3xl">
                    {certificate.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <Chip tone={certificate.status === "obtained" ? "success" : "muted"}>
                    {certificate.status === "obtained"
                      ? t("status.obtained")
                      : t("status.available")}
                  </Chip>
                  <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-primary">
                    {certificate.category}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                  <p>{t("issuedBy", {issuer: certificate.issuer})}</p>
                  {certificate.obtainedAt ? (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t("obtainedAt", {
                        date: formatLongDate(certificate.obtainedAt),
                      })}
                    </p>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {certificate.verificationUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={certificate.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon name="mingcute:external-link-line" className="mr-1 text-base" />
                        {t("verifyOnline")}
                      </a>
                    </Button>
                  ) : null}

                  <Button size="sm" onClick={() => window.print()}>
                    <Icon name="mingcute:download-line" className="mr-1 text-base" />
                    {t("printCertificate")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </DataState>
  );
}
