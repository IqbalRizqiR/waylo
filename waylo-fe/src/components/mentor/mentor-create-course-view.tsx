"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {H5PInteractiveConfig, MentorCreateCourseInput, Skill} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Select} from "@/components/shared/select";
import {Textarea} from "@/components/ui/textarea";
import {H5PVisualEditor} from "@/components/shared/h5p-visual-editor";
import {PageHeader} from "@/components/shared/page-header";

export function MentorCreateCourseView() {
  const t = useTranslations("mentor.courses");
  const tc = useTranslations("common");
  const router = useRouter();

  const skillsQuery = useApiQuery<Skill[]>(queryKeys.catalogue.skills, "/skills");
  const skills = skillsQuery.data ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillId, setSkillId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const [lessons, setLessons] = useState<
    {
      order: number;
      title: string;
      durationMinutes: number;
      h5pContentPath?: string;
      interactiveConfig?: H5PInteractiveConfig | null;
    }[]
  >([
    {order: 1, title: "Pengenalan & Teori Dasar", durationMinutes: 20, h5pContentPath: ""},
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useApiMutation<unknown, MentorCreateCourseInput>({
    invalidateKeys: [queryKeys.courses.list, queryKeys.mentor.dashboard],
    mapVariables: (body) => ({
      path: "/mentor/courses",
      method: "POST",
      body,
    }),
    onSuccess: () => {
      router.push("/mentor/courses");
    },
    onError: (err) => {
      setFormError(err.message || t("createError"));
    },
  });

  function addLesson() {
    setLessons((prev) => [
      ...prev,
      {
        order: prev.length + 1,
        title: `Modul Pembelajaran ${prev.length + 1}`,
        durationMinutes: 20,
        h5pContentPath: "",
      },
    ]);
  }

  function removeLesson(idx: number) {
    setLessons((prev) => prev.filter((_, i) => i !== idx).map((l, i) => ({...l, order: i + 1})));
  }

  function updateLessonTitle(idx: number, val: string) {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? {...l, title: val} : l)),
    );
  }

  function updateLessonDuration(idx: number, val: number) {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? {...l, durationMinutes: val} : l)),
    );
  }

  function updateLessonH5P(idx: number, path: string) {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? {...l, h5pContentPath: path} : l)),
    );
  }

  function updateLessonConfig(idx: number, cfg: H5PInteractiveConfig) {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? {...l, interactiveConfig: cfg} : l)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError(t("requiredFieldsError"));
      return;
    }
    setFormError(null);
    void createMutation.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      skillId: skillId || undefined,
      durationMinutes: Number(durationMinutes) || 60,
      lessons,
    });
  }

  const skillOptions = [
    {value: "", label: t("noSkillSelected")},
    ...skills.map((s) => ({value: s.id, label: s.name})),
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-4">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/mentor/courses">
            <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
            {tc("back")}
          </Link>
        </Button>
      </div>

      <PageHeader title={t("createPageTitle")} subtitle={t("createPageSubtitle")} />

      {formError ? (
        <p role="alert" className="rounded-xl bg-[#ffe4e9] p-4 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Course Info Card */}
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <h2 className="text-xl font-medium text-black">{t("infoSectionTitle")}</h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              id="courseTitle"
              label={t("courseTitleLabel")}
              placeholder={t("courseTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("relatedSkillLabel")}
              </span>
              <Select
                value={skillId}
                onChange={(v) => setSkillId(v)}
                options={skillOptions}
              />
            </label>
          </div>

          <Field
            id="duration"
            type="number"
            label={t("totalDurationLabel")}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            min={5}
            max={1000}
            required
          />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-primary">
              {t("descriptionLabel")}
            </span>
            <Textarea
              rows={4}
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
        </Card>

        {/* Lessons Builder Card */}
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-black">{t("lessonsSectionTitle")}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {t("lessonsSectionSubtitle")}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLesson}>
              <Icon name="mingcute:add-circle-line" className="mr-1 text-base" />
              {t("addLessonCTA")}
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            {lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLessonTitle(idx, e.target.value)}
                      placeholder={t("lessonTitlePlaceholder")}
                      className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-28 shrink-0">
                      <input
                        type="number"
                        value={lesson.durationMinutes}
                        onChange={(e) => updateLessonDuration(idx, Number(e.target.value))}
                        min={1}
                        className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-center"
                        title={t("minutes")}
                      />
                    </div>

                    {lessons.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(idx)}
                        className="size-10 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                        aria-label="Remove lesson"
                      >
                        <Icon name="mingcute:delete-2-line" className="text-lg" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* H5P Visual Studio & Interaction Builder */}
                <H5PVisualEditor
                  valuePath={lesson.h5pContentPath}
                  onChangePath={(p) => updateLessonH5P(idx, p)}
                  interactiveConfig={lesson.interactiveConfig}
                  onChangeConfig={(cfg) => updateLessonConfig(idx, cfg)}
                  lessonTitle={lesson.title}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/mentor/courses">{tc("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending} size="lg">
            {createMutation.isPending ? tc("loading") : t("publishCourseCTA")}
            <Icon name="mingcute:upload-cloud-line" className="ml-2 text-xl" />
          </Button>
        </div>
      </form>
    </div>
  );
}
