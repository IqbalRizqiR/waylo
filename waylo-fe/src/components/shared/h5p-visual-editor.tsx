"use client";

import {useState, useRef} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Field} from "@/components/shared/field";
import {Textarea} from "@/components/ui/textarea";
import {H5PPlayer} from "@/components/learner/h5p-player";
import {authHeaders} from "@/lib/session/storage";
import type {H5PInteractiveConfig} from "@waylo/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const PRESET_TEMPLATES: {
  name: string;
  config: H5PInteractiveConfig;
}[] = [
  {
    name: "Course Presentation (HTML5 & Semantik Web)",
    config: {
      activityType: "course_presentation",
      slides: [
        {
          title: "Struktur Semantik & Aksesibilitas Modern",
          subtitle: "H5P.CoursePresentation • Modul Interaktif",
          body: "Gunakan elemen semantik HTML5 seperti <main>, <nav>, <article>, dan <header> untuk memastikan mesin pencari dan screen reader dapat memahami hierarki dokumen web dengan akurat.",
          highlights: [
            "Meningkatkan skor SEO dan ranking pencarian",
            "Memenuhi kepatuhan aksesibilitas WCAG AA",
            "Merapikan struktur kode dan pemeliharaan jangka panjang",
          ],
        },
      ],
      knowledgeCheck: {
        prompt: "Manakah tag semantik yang wajib digunakan untuk membungkus area navigasi utama aplikasi?",
        options: [
          {key: "a", label: "<nav> — khusus navigasi utama situs", correct: true},
          {key: "b", label: "<div class='nav'> — fleksibel untuk styling", correct: false},
          {key: "c", label: "<menu> — untuk semua link tautan", correct: false},
          {key: "d", label: "<section> — pembungkus umum", correct: false},
        ],
        explanation: "Tag <nav> secara eksplisit mengumumkan landmark navigasi bagi teknologi asistif seperti screen reader.",
      },
      summary: {
        title: "Modul Selesai!",
        body: "Selamat, kamu telah memahami konsep semantik HTML5 dan menyelesaikan latihan pemahaman interaktif.",
      },
    },
  },
  {
    name: "Interactive Exercise (CSS Grid & Responsive Layout)",
    config: {
      activityType: "course_presentation",
      slides: [
        {
          title: "Dasar Tata Letak 2 Dimensi dengan CSS Grid",
          subtitle: "H5P.CoursePresentation • Modul Interaktif",
          body: "CSS Grid memungkinkan pembuatan tata letak kompleks berbasis baris dan kolom secara bersamaan tanpa perlu nested container berlebihan.",
          highlights: [
            "Kontrol penuh atas grid-template-columns dan rows",
            "Dukungan unit fr (fractional) yang fleksibel",
            "Fungsi repeat() dan auto-fit untuk responsivitas instan",
          ],
        },
      ],
      knowledgeCheck: {
        prompt: "Properti CSS apa yang digunakan untuk mendefinisikan jumlah dan ukuran kolom pada container grid?",
        options: [
          {key: "a", label: "grid-template-columns", correct: true},
          {key: "b", label: "grid-column-gap", correct: false},
          {key: "c", label: "flex-direction: column", correct: false},
          {key: "d", label: "columns-count", correct: false},
        ],
        explanation: "grid-template-columns mengatur pola pembagian kolom pada grid container (misal: repeat(3, 1fr)).",
      },
      summary: {
        title: "Pemahaman CSS Grid Terverifikasi!",
        body: "Kuasai tata letak grid untuk membangun halaman bento dan antarmuka modern.",
      },
    },
  },
];

type H5PVisualEditorProps = {
  valuePath?: string | null;
  onChangePath: (path: string) => void;
  interactiveConfig?: H5PInteractiveConfig | null;
  onChangeConfig: (config: H5PInteractiveConfig) => void;
  lessonTitle?: string;
};

export function H5PVisualEditor({
  valuePath,
  onChangePath,
  interactiveConfig,
  onChangeConfig,
  lessonTitle = "Modul Pembelajaran",
}: H5PVisualEditorProps) {
  const t = useTranslations("mentor.courses");
  const tc = useTranslations("common");

  const [activeTab, setActiveTab] = useState<"builder" | "template" | "upload">(
    "builder",
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  // Initialize form state from interactiveConfig or default template
  const defaultConfig: H5PInteractiveConfig = interactiveConfig ?? {
    activityType: "course_presentation",
    slides: [
      {
        title: `1. Konsep Utama: ${lessonTitle}`,
        subtitle: "H5P.CoursePresentation • Modul Interaktif",
        body: `Pelajari konsep dan praktik terbaik untuk ${lessonTitle} sebelum menguji pemahamanmu di kuis interaktif.`,
        highlights: [
          "Prinsip desain modular dan terisolasi",
          "Kepatuhan standar industri dan pengujian",
          "Optimalisasi performa dan kemudahan pemeliharaan",
        ],
      },
    ],
    knowledgeCheck: {
      prompt: `Berdasarkan materi "${lessonTitle}", manakah pernyataan yang paling tepat?`,
      options: [
        {
          key: "a",
          label: "Menerapkan struktur modular dan validasi input di batas sistem.",
          correct: true,
        },
        {
          key: "b",
          label: "Mengabaikan standar aksesibilitas agar proses development lebih cepat.",
          correct: false,
        },
        {
          key: "c",
          label: "Menyimpan semua data di satu state global tanpa pemisahan komponen.",
          correct: false,
        },
        {
          key: "d",
          label: "Menghindari penulisan tes otomatis untuk menghemat waktu.",
          correct: false,
        },
      ],
      explanation:
        "Arsitektur modular dan validasi menyeluruh memastikan aplikasi andal dan mudah dikembangkan.",
    },
    summary: {
      title: "Rangkuman Modul",
      body: "Kamu telah menyelesaikan pemahaman materi dan uji interaktif untuk modul ini.",
    },
  };

  const [config, setConfig] = useState<H5PInteractiveConfig>(defaultConfig);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Slide 1 state helpers
  const introSlide = config.slides[0] ?? {
    title: "",
    subtitle: "",
    body: "",
    highlights: [],
  };

  function updateIntroSlide(partial: Partial<typeof introSlide>) {
    const updated = {
      ...config,
      slides: [{...introSlide, ...partial}],
    };
    setConfig(updated);
    onChangeConfig(updated);
  }

  // Knowledge check helpers
  const check = config.knowledgeCheck ?? {
    prompt: "",
    options: [
      {key: "a", label: "", correct: true},
      {key: "b", label: "", correct: false},
      {key: "c", label: "", correct: false},
      {key: "d", label: "", correct: false},
    ],
    explanation: "",
  };

  function updateQuestionPrompt(prompt: string) {
    const updated = {
      ...config,
      knowledgeCheck: {...check, prompt},
    };
    setConfig(updated);
    onChangeConfig(updated);
  }

  function updateQuestionOption(idx: number, label: string) {
    const nextOptions = check.options.map((opt, i) =>
      i === idx ? {...opt, label} : opt,
    );
    const updated = {
      ...config,
      knowledgeCheck: {...check, options: nextOptions},
    };
    setConfig(updated);
    onChangeConfig(updated);
  }

  function setCorrectOption(key: string) {
    const nextOptions = check.options.map((opt) => ({
      ...opt,
      correct: opt.key === key,
    }));
    const updated = {
      ...config,
      knowledgeCheck: {...check, options: nextOptions},
    };
    setConfig(updated);
    onChangeConfig(updated);
  }

  function updateQuestionExplanation(explanation: string) {
    const updated = {
      ...config,
      knowledgeCheck: {...check, explanation},
    };
    setConfig(updated);
    onChangeConfig(updated);
  }

  function applyTemplate(tmplConfig: H5PInteractiveConfig) {
    setConfig(tmplConfig);
    onChangeConfig(tmplConfig);
    onChangePath("");
    setActiveTab("builder");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const buffer = await file.arrayBuffer();
      const res = await fetch(`${API_BASE_URL}/h5p/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/zip",
          ...authHeaders(),
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error("Gagal mengunggah paket H5P.");
      }

      const json = (await res.json()) as {data?: {contentPath: string}};
      if (json.data?.contentPath) {
        onChangePath(json.data.contentPath);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal mengunggah paket H5P.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/20 bg-slate-50/70 p-5 shadow-sm">
      {/* Header bar with Mode tabs and Live Preview CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#1a73e8] px-2 py-0.5 text-xs font-bold text-white tracking-wider">
            H5P Studio
          </span>
          <span className="font-semibold text-black text-sm">
            {t("h5pStudioTitle")}
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center rounded-xl bg-muted/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "builder"
                ? "bg-white font-semibold text-primary shadow-sm"
                : "text-[var(--text-secondary)] hover:text-black"
            }`}
          >
            <Icon name="mingcute:edit-2-line" className="mr-1 inline text-sm" />
            {t("visualBuilderTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("template")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "template"
                ? "bg-white font-semibold text-primary shadow-sm"
                : "text-[var(--text-secondary)] hover:text-black"
            }`}
          >
            <Icon name="mingcute:layout-line" className="mr-1 inline text-sm" />
            {t("templateTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              activeTab === "upload"
                ? "bg-white font-semibold text-primary shadow-sm"
                : "text-[var(--text-secondary)] hover:text-black"
            }`}
          >
            <Icon name="mingcute:upload-line" className="mr-1 inline text-sm" />
            {t("uploadTab")}
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setPreviewOpen((p) => !p)}
          className="border-primary/30 text-xs font-medium text-primary hover:bg-secondary/40"
        >
          <Icon name="mingcute:play-circle-line" className="mr-1.5 text-base" />
          {previewOpen ? t("closePreview") : t("previewH5PCTA")}
        </Button>
      </div>

      {/* TAB 1: VISUAL BUILDER */}
      {activeTab === "builder" && (
        <div className="flex flex-col gap-5 pt-1">
          {/* Section 1: Presentation Slide 1 (Teori) */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                {t("slide1Title")}
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                id="slideTitle"
                label={t("slideTitleLabel")}
                value={introSlide.title}
                onChange={(e) => updateIntroSlide({title: e.target.value})}
                placeholder="e.g. Konsep Dasar & Arsitektur"
              />
              <Field
                id="slideSubtitle"
                label={t("slideSubtitleLabel")}
                value={introSlide.subtitle ?? ""}
                onChange={(e) => updateIntroSlide({subtitle: e.target.value})}
                placeholder="e.g. H5P.CoursePresentation"
              />
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-primary">
                {t("slideBodyLabel")}
              </span>
              <Textarea
                rows={3}
                value={introSlide.body}
                onChange={(e) => updateIntroSlide({body: e.target.value})}
                placeholder="Tuliskan uraian materi teori ringkas yang akan dipelajari..."
                className="text-xs"
              />
            </label>
          </div>

          {/* Section 2: Slide 2 Interactive Knowledge Check */}
          <div className="flex flex-col gap-4 rounded-xl border-2 border-primary/20 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                  {t("slide2Title")}
                </h4>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                Interaktif • Auto Grading
              </span>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-primary">
                {t("quizPromptLabel")} *
              </span>
              <Textarea
                rows={2}
                value={check.prompt}
                onChange={(e) => updateQuestionPrompt(e.target.value)}
                placeholder="Tuliskan pertanyaan pemahaman materi..."
                className="text-xs"
                required
              />
            </label>

            {/* 4 Choices A/B/C/D with correct answer selector */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-medium text-primary">
                {t("choicesLabel")} ({t("chooseCorrectHint")}):
              </span>

              {check.options.map((opt, idx) => (
                <div
                  key={opt.key}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all ${
                    opt.correct
                      ? "border-green-400 bg-green-50/60"
                      : "border-border bg-white"
                  }`}
                >
                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name={`correct-${lessonTitle}`}
                      checked={opt.correct}
                      onChange={() => setCorrectOption(opt.key)}
                      className="size-4 accent-success cursor-pointer"
                      title={t("setAsCorrect")}
                    />
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        opt.correct
                          ? "bg-success text-white"
                          : "bg-muted text-[var(--muted-foreground)]"
                      }`}
                    >
                      {opt.key.toUpperCase()}
                    </span>
                  </label>

                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateQuestionOption(idx, e.target.value)}
                    placeholder={`Pilihan jawaban ${opt.key.toUpperCase()}...`}
                    className="h-8 flex-1 rounded-md border border-border bg-white px-2.5 text-xs text-black"
                    required
                  />

                  {opt.correct ? (
                    <span className="rounded bg-green-200/70 px-2 py-0.5 text-[10px] font-bold text-green-900 shrink-0">
                      Jawaban Benar
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-primary">
                {t("explanationFeedbackLabel")}
              </span>
              <input
                type="text"
                value={check.explanation}
                onChange={(e) => updateQuestionExplanation(e.target.value)}
                placeholder="Penjelasan umpan balik yang muncul saat siswa menekan 'Periksa Jawaban'..."
                className="h-9 w-full rounded-md border border-border bg-white px-3 text-xs text-black"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === "template" && (
        <div className="flex flex-col gap-3 pt-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            {t("templateHint")}
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESET_TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/50 shadow-sm"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      H5P Template
                    </span>
                    <span className="text-xs font-semibold text-black">{tmpl.name}</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-[var(--text-secondary)]">
                    {tmpl.config.slides[0]?.body}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyTemplate(tmpl.config)}
                  className="w-full text-xs"
                >
                  <Icon name="mingcute:magic-line" className="mr-1 text-sm" />
                  {t("useThisTemplateCTA")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD .H5P FILE */}
      {activeTab === "upload" && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-black text-xs">{t("uploadH5PTitle")}</span>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {t("uploadH5PDesc")}
            </p>
          </div>

          {uploadError ? (
            <p role="alert" className="rounded-lg bg-red-100 p-2 text-xs text-destructive">
              {uploadError}
            </p>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept=".h5p,.zip"
            onChange={(e) => void handleFileUpload(e)}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              <Icon name="mingcute:upload-line" className="mr-1.5 text-sm" />
              {isUploading ? tc("loading") : t("chooseH5PFile")}
            </Button>

            {valuePath ? (
              <span className="truncate font-mono text-[11px] text-success">
                Terpasang: {valuePath}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* LIVE IN-EDITOR H5P SIMULATION PREVIEW MODAL / ACCORDION */}
      {previewOpen ? (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border-2 border-primary/40 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-black text-xs sm:text-sm">
                {t("livePreviewTitle")}: {lessonTitle}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              className="h-7 px-2 text-xs"
            >
              {tc("close")}
            </Button>
          </div>

          <H5PPlayer
            lessonTitle={lessonTitle}
            interactiveConfig={config}
            onComplete={() => undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
