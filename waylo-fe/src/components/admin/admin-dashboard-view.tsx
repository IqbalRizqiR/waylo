"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {AdminDashboardStats} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";

export function AdminDashboardView() {
  const t = useTranslations("admin.dashboard");
  const query = useApiQuery<AdminDashboardStats>(
    queryKeys.admin.dashboard,
    "/admin/dashboard",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(stats) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          {/* 6 Stats Grid */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              icon="mingcute:user-3-line"
              label={t("totalLearners")}
              value={String(stats.totalLearners)}
            />
            <StatCard
              icon="mingcute:building-1-line"
              label={t("totalCompanies")}
              value={String(stats.totalCompanies)}
            />
            <StatCard
              icon="mingcute:user-star-line"
              label={t("totalMentors")}
              value={String(stats.totalMentors)}
            />
            <StatCard
              icon="mingcute:briefcase-line"
              label={t("activeJobs")}
              value={String(stats.totalActiveJobs)}
            />
            <StatCard
              icon="mingcute:badge-line"
              label={t("verifiedSkills")}
              value={String(stats.totalVerifiedSkills)}
              tone="success"
            />
            <StatCard
              icon="mingcute:book-2-line"
              label={t("totalCourses")}
              value={String(stats.totalCourses)}
            />
          </section>

          {/* Fast Navigation Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-2">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary">
                  <Icon name="mingcute:group-line" />
                </span>
                <h3 className="font-medium text-black">{t("manageUsersTitle")}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("manageUsersDesc")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/users">{t("goToUsers")} →</Link>
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-2">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary">
                  <Icon name="mingcute:tag-line" />
                </span>
                <h3 className="font-medium text-black">{t("skillsTitle")}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("skillsDesc")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/skills">{t("goToSkills")} →</Link>
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-2">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary">
                  <Icon name="mingcute:compass-line" />
                </span>
                <h3 className="font-medium text-black">{t("careersTitle")}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("careersDesc")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/careers">{t("goToCareers")} →</Link>
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-2">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary">
                  <Icon name="mingcute:clipboard-line" />
                </span>
                <h3 className="font-medium text-black">{t("assessmentsTitle")}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("assessmentsDesc")}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/assessments">{t("goToAssessments")} →</Link>
              </Button>
            </Card>
          </div>
        </div>
      )}
    </DataState>
  );
}
