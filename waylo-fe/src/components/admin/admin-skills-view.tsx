"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CreateSkillInput, Skill} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function AdminSkillsView() {
  const t = useTranslations("admin.skills");
  const tc = useTranslations("common");

  const query = useApiQuery<Skill[]>(queryKeys.catalogue.skills, "/skills");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createSkillMutation = useApiMutation<unknown, CreateSkillInput>({
    invalidateKeys: [queryKeys.catalogue.skills, queryKeys.admin.dashboard],
    mapVariables: (body) => ({
      path: "/admin/skills",
      method: "POST",
      body,
    }),
    onSuccess: () => {
      setName("");
      setSlug("");
      setCategory("");
      setShowAddForm(false);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err.message || t("createError"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !category.trim()) {
      setFormError(t("requiredFields"));
      return;
    }
    setFormError(null);
    void createSkillMutation.mutateAsync({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      category: category.trim(),
    });
  }

  function handleNameChange(val: string) {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    );
  }

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(skills) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button onClick={() => setShowAddForm((s) => !s)}>
                <Icon name="mingcute:add-circle-line" className="mr-1 text-base" />
                {t("addSkillCTA")}
              </Button>
            }
          />

          {showAddForm ? (
            <Card className="flex flex-col gap-4 p-6">
              <h2 className="text-lg font-medium text-black">{t("addFormTitle")}</h2>

              {formError ? (
                <p role="alert" className="rounded-xl bg-[#ffe4e9] p-3 text-xs text-destructive">
                  {formError}
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <Field
                  id="skillName"
                  label={t("skillNameLabel")}
                  placeholder="e.g. Next.js"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <Field
                  id="skillSlug"
                  label={t("skillSlugLabel")}
                  placeholder="e.g. next-js"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <Field
                  id="skillCategory"
                  label={t("skillCategoryLabel")}
                  placeholder="e.g. Frontend"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />

                <div className="flex justify-end gap-2 sm:col-span-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={createSkillMutation.isPending}>
                    {createSkillMutation.isPending ? tc("loading") : tc("save")}
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          {/* Skills Table */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-[var(--muted-foreground)]">
                    <th className="pb-3 font-medium">{t("colName")}</th>
                    <th className="pb-3 font-medium">{t("colSlug")}</th>
                    <th className="pb-3 font-medium">{t("colCategory")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {skills.map((skill) => (
                    <tr key={skill.id} className="py-3">
                      <td className="py-3.5 pr-4 font-semibold text-black">
                        {skill.name}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-[var(--muted-foreground)]">
                        {skill.slug}
                      </td>
                      <td className="py-3.5">
                        <Chip tone="skill">{skill.category}</Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DataState>
  );
}
