"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Application} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {StageBadge} from "@/components/shared/stage-badge";

type TabKey = "all" | "premium" | "free" | "shortlisted";

export function CandidatesView() {
  const t = useTranslations("company.candidates");
  const [tab, setTab] = useState<TabKey>("all");
  const query = useApiQuery<Application[]>(
    queryKeys.company.applications,
    "/applications",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:user-search-line"
    >
      {(data) => {
        const filtered = filterByTab(data, tab);
        return (
          <div className="flex flex-col gap-8">
            <PageHeader
              title={t("title")}
              subtitle={t("subtitle", {count: data.length})}
            />

            <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
              <TabsList>
                <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
                <TabsTrigger value="premium">{t("tabs.premium")}</TabsTrigger>
                <TabsTrigger value="free">{t("tabs.free")}</TabsTrigger>
                <TabsTrigger value="shortlisted">{t("tabs.shortlisted")}</TabsTrigger>
              </TabsList>

              <TabsContent value={tab}>
                {filtered.length === 0 ? (
                  <p className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-14 text-center text-sm text-[var(--text-secondary)]">
                    {t("noResults")}
                  </p>
                ) : (
                  <CandidateTable applications={filtered} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        );
      }}
    </DataState>
  );
}

function filterByTab(applications: Application[], tab: TabKey): Application[] {
  if (tab === "premium") return applications.filter((a) => a.track === "premium");
  if (tab === "free") return applications.filter((a) => a.track === "free");
  if (tab === "shortlisted") {
    return applications.filter((a) => a.stage === "shortlisted");
  }
  return applications;
}

function CandidateTable({applications}: {applications: Application[]}) {
  const t = useTranslations("company.candidates");
  return (
    <Card className="overflow-hidden">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{t("title")}</caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <th scope="col" className="px-5 py-3 font-medium">
              {t("table.candidate")}
            </th>
            <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">
              {t("table.track")}
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              {t("table.stage")}
            </th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">
              {t("table.match")}
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              <span className="sr-only">{t("table.action")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr
              key={app.id}
              className="border-b border-border last:border-0 hover:bg-[var(--surface-alt)]"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <InitialsAvatar
                    initials={app.candidateInitials}
                    size="sm"
                    label={app.candidateName}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-black">
                      {app.candidateName}
                    </p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                      {app.jobTitle}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-5 py-4 md:table-cell">
                <Chip tone={app.track === "premium" ? "skill" : "muted"}>
                  {app.track === "premium" ? t("track.premium") : t("track.free")}
                </Chip>
              </td>
              <td className="px-5 py-4">
                <StageBadge stage={app.stage} />
              </td>
              <td className="hidden px-5 py-4 sm:table-cell">
                {app.skillMatchPercent !== null ? `${app.skillMatchPercent}%` : "-"}
              </td>
              <td className="px-5 py-4 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/company/candidates/${app.id}`}>
                    {t("viewDetail")}
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
