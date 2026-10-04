"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Project, ProjectSubmission, SubmitProjectInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatLongDate} from "@/lib/format";

export function ProjectDetailView({id}: {id: string}) {
  const t = useTranslations("learner.projects");
  const tc = useTranslations("common");

  const query = useApiQuery<Project>(
    queryKeys.projects.detail(id),
    `/projects/${id}`,
  );

  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submitMutation = useApiMutation<ProjectSubmission, SubmitProjectInput>({
    invalidateKeys: [queryKeys.projects.detail(id), queryKeys.projects.list, queryKeys.learner.dashboard],
    mapVariables: (body) => ({
      path: `/projects/${id}/submit`,
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setSubmitSuccess(true);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err.message || t("submitError"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim().startsWith("http")) {
      setFormError(t("invalidRepoUrl"));
      return;
    }
    setFormError(null);
    void submitMutation.mutateAsync({
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(project) => {
        const sub = project.mySubmission;

        return (
          <div className="flex flex-col gap-8">
            <div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/learner/projects">
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {tc("back")}
                </Link>
              </Button>
            </div>

            <PageHeader title={project.title} subtitle={project.description} />

            {/* Quick meta card */}
            <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex flex-wrap items-center gap-4">
                {project.skillName ? (
                  <Chip tone="skill">{project.skillName}</Chip>
                ) : null}
                <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--muted-foreground)]">
                  {t("difficultyLabel")}: {t(`difficulty.${project.difficulty}`)}
                </span>
              </div>

              {project.starterRepoUrl ? (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={project.starterRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="mingcute:github-line" className="mr-1.5 text-base" />
                    {t("starterRepoCTA")}
                  </a>
                </Button>
              ) : null}
            </Card>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Project Brief / Instructions (7 cols) */}
              <Card className="flex flex-col gap-4 p-6 sm:p-8 lg:col-span-7">
                <h2 className="text-xl font-medium text-black">{t("briefTitle")}</h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                  {project.brief}
                </div>
              </Card>

              {/* Submission Form / Status (5 cols) */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                {sub ? (
                  <Card className="flex flex-col gap-4 p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black">{t("submissionTitle")}</h3>
                      <Chip
                        tone={
                          sub.status === "approved"
                            ? "success"
                            : sub.status === "rejected"
                            ? "muted"
                            : "status"
                        }
                        className="capitalize"
                      >
                        {t(`status.${sub.status}`)}
                      </Chip>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <div>
                        <span className="text-[var(--muted-foreground)]">{t("submittedAt")}: </span>
                        <span className="font-medium text-black">
                          {formatLongDate(sub.submittedAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[var(--muted-foreground)]">{t("repository")}: </span>
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline break-all"
                        >
                          {sub.repoUrl}
                        </a>
                      </div>

                      {sub.demoUrl ? (
                        <div>
                          <span className="text-[var(--muted-foreground)]">{t("liveDemo")}: </span>
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline break-all"
                          >
                            {sub.demoUrl}
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {sub.feedback ? (
                      <div className="rounded-xl border border-primary/20 bg-secondary/20 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {t("mentorFeedback")}
                        </span>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {sub.feedback}
                        </p>
                      </div>
                    ) : null}
                  </Card>
                ) : null}

                {/* Submission Form */}
                <Card className="p-6 sm:p-7">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h3 className="font-medium text-black">
                      {sub ? t("resubmitTitle") : t("submitProjectTitle")}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t("submitProjectSubtitle")}
                    </p>

                    {submitSuccess ? (
                      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-success">
                        <Icon name="mingcute:check-circle-line" />
                        <span>{t("submitSuccess")}</span>
                      </div>
                    ) : null}

                    {formError ? (
                      <p role="alert" className="rounded-xl bg-[#ffe4e9] p-3 text-xs text-destructive">
                        {formError}
                      </p>
                    ) : null}

                    <Field
                      id="repoUrl"
                      label={t("repoUrlLabel")}
                      placeholder="https://github.com/username/project-repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      required
                    />

                    <Field
                      id="demoUrl"
                      label={`${t("demoUrlLabel")} (${tc("optional")})`}
                      placeholder="https://my-project-demo.vercel.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                    />

                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-primary">
                        {t("notesLabel")} ({tc("optional")})
                      </span>
                      <Textarea
                        rows={3}
                        placeholder={t("notesPlaceholder")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                      />
                    </label>

                    <Button
                      type="submit"
                      disabled={submitMutation.isPending || !repoUrl.trim()}
                      className="mt-2"
                    >
                      {submitMutation.isPending ? tc("loading") : t("submitCTA")}
                      <Icon name="mingcute:send-plane-line" className="ml-1.5 text-base" />
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
