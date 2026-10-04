"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Career, CreateCareerInput, Skill, SkillLevel} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function AdminCareersView() {
  const t = useTranslations("admin.careers");
  const tc = useTranslations("common");

  const careersQuery = useApiQuery<Career[]>(queryKeys.catalogue.careers, "/careers");
  const skillsQuery = useApiQuery<Skill[]>(queryKeys.catalogue.skills, "/skills");
  const skills = skillsQuery.data ?? [];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<{skillId: string; requiredLevel: SkillLevel}[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createCareerMutation = useApiMutation<unknown, CreateCareerInput>({
    invalidateKeys: [queryKeys.catalogue.careers, queryKeys.admin.dashboard],
    mapVariables: (body) => ({
      path: "/admin/careers",
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setTitle("");
      setSlug("");
      setSummary("");
      setSelectedSkills([]);
      setShowAddForm(false);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err.message || t("createError"));
    },
  });

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    );
  }

  function toggleSkill(skillId: string) {
    if (selectedSkills.some((s) => s.skillId === skillId)) {
      setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } else {
      setSelectedSkills((prev) => [...prev, {skillId, requiredLevel: "intermediate"}]);
    }
  }

  function updateSkillLevel(skillId: string, level: SkillLevel) {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? {...s, requiredLevel: level} : s)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !summary.trim() || selectedSkills.length === 0) {
      setFormError(t("requiredFields"));
      return;
    }
    setFormError(null);
    void createCareerMutation.mutateAsync({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      summary: summary.trim(),
      requirements: selectedSkills,
    });
  }

  return (
    <DataState
      query={careersQuery}
      data={careersQuery.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(careers) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button onClick={() => setShowAddForm((s) => !s)}>
                <Icon name="mingcute:add-circle-line" className="mr-1 text-base" />
                {t("addCareerCTA")}
              </Button>
            }
          />

          {showAddForm ? (
            <Card className="flex flex-col gap-5 p-6 sm:p-8">
              <h2 className="text-lg font-medium text-black">{t("addFormTitle")}</h2>

              {formError ? (
                <p role="alert" className="rounded-xl bg-[#ffe4e9] p-3 text-xs text-destructive">
                  {formError}
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="careerTitle"
                    label={t("careerTitleLabel")}
                    placeholder="e.g. AI / Machine Learning Engineer"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                  <Field
                    id="careerSlug"
                    label={t("careerSlugLabel")}
                    placeholder="e.g. ai-ml-engineer"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-primary">
                    {t("summaryLabel")}
                  </span>
                  <Textarea
                    rows={3}
                    placeholder={t("summaryPlaceholder")}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                  />
                </label>

                {/* Skill Requirements Matrix Picker */}
                <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <span className="text-sm font-medium text-black">
                    {t("pickSkillsTitle")} ({selectedSkills.length} {t("selected")})
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-white text-black hover:border-primary/40"
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSkills.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {t("calibrateLevelTitle")}
                      </span>
                      {selectedSkills.map((sel) => {
                        const sk = skills.find((s) => s.id === sel.skillId);
                        return (
                          <div
                            key={sel.skillId}
                            className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-xs"
                          >
                            <span className="font-medium text-black">{sk?.name}</span>
                            <div className="flex gap-1">
                              {(["beginner", "intermediate", "advanced", "expert"] as const).map(
                                (lvl) => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => updateSkillLevel(sel.skillId, lvl)}
                                    className={`rounded px-2 py-0.5 capitalize transition-all ${
                                      sel.requiredLevel === lvl
                                        ? "bg-primary font-semibold text-white"
                                        : "bg-white text-[var(--text-secondary)] border border-border"
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={createCareerMutation.isPending}>
                    {createCareerMutation.isPending ? tc("loading") : tc("save")}
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          {/* Careers Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <Card key={career.id} className="flex flex-col justify-between p-6">
                <div className="flex flex-col gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon name="mingcute:compass-line" className="text-xl" />
                  </span>
                  <h3 className="text-lg font-bold text-black">{career.title}</h3>
                  <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {career.summary}
                  </p>
                </div>

                <div className="mt-4 border-t border-border pt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="font-mono">slug: {career.slug}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  );
}
