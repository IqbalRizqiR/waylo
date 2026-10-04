"use client";

import {useState, useRef} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {H5PPlayer} from "@/components/learner/h5p-player";
import {authHeaders} from "@/lib/session/storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const H5P_TEMPLATES = [
  {
    name: "H5P Course Presentation (Slides & Knowledge Check)",
    path: "/h5p/demo/html5-semantics",
    type: "Presentation",
  },
  {
    name: "H5P Interactive Accessibility Exercise (WCAG & ARIA)",
    path: "/h5p/demo/web-accessibility",
    type: "Exercise",
  },
  {
    name: "H5P Flexbox & CSS Grid Interactive Sandbox",
    path: "/h5p/demo/flexbox-basics",
    type: "Interactive Lab",
  },
  {
    name: "H5P JavaScript ES6+ Interactive Quiz",
    path: "/h5p/demo/es6-syntax",
    type: "Quiz",
  },
];

type H5PUploaderProps = {
  value?: string | null;
  onChange: (path: string) => void;
  lessonTitle?: string;
};

export function H5PUploader({
  value,
  onChange,
  lessonTitle = "Modul Pembelajaran",
}: H5PUploaderProps) {
  const t = useTranslations("mentor.courses");
  const tc = useTranslations("common");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
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
        onChange(json.data.contentPath);
      } else {
        throw new Error("Respon server H5P tidak valid.");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah file H5P.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-secondary/15 p-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#1a73e8] px-1.5 py-0.5 text-[10px] font-bold text-white tracking-wider">
            H5P
          </span>
          <span className="font-semibold text-primary">{t("h5pAttachmentLabel")}</span>
        </div>

        {value ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-success">
              <Icon name="mingcute:check-circle-line" />
              {t("h5pAttachedBadge")}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen((p) => !p)}
              className="h-7 px-2 text-xs"
            >
              <Icon name="mingcute:play-circle-line" className="mr-1 text-sm" />
              {previewOpen ? t("closePreview") : t("previewH5PCTA")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
              }}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
            >
              <Icon name="mingcute:delete-2-line" className="text-sm" />
            </Button>
          </div>
        ) : null}
      </div>

      {uploadError ? (
        <p role="alert" className="rounded-lg bg-red-100 p-2 text-xs text-destructive">
          {uploadError}
        </p>
      ) : null}

      {/* Upload or Select Template Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Action 1: Upload .h5p file */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-white p-3">
          <span className="font-medium text-black">{t("uploadH5PTitle")}</span>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {t("uploadH5PDesc")}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".h5p,.zip"
            onChange={(e) => void handleFileSelected(e)}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 h-8 w-fit text-xs"
          >
            <Icon name="mingcute:upload-line" className="mr-1.5 text-sm" />
            {isUploading ? tc("loading") : t("chooseH5PFile")}
          </Button>
        </div>

        {/* Action 2: Choose Template */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-white p-3">
          <span className="font-medium text-black">{t("chooseTemplateTitle")}</span>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {t("chooseTemplateDesc")}
          </p>

          <select
            value={value ?? ""}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="mt-1 h-8 w-full rounded-md border border-border bg-white px-2 text-xs text-black"
          >
            <option value="">{t("selectTemplatePrompt")}</option>
            {H5P_TEMPLATES.map((tmpl) => (
              <option key={tmpl.path} value={tmpl.path}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attached Path Display */}
      {value ? (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] font-mono">
          <span>Path:</span>
          <span className="truncate text-primary">{value}</span>
        </div>
      ) : null}

      {/* Live Inline Preview */}
      {previewOpen && value ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-primary/30 bg-white p-3 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-semibold text-black">
              {t("livePreviewTitle")}: {lessonTitle}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              className="h-6 px-2 text-xs"
            >
              {tc("close")}
            </Button>
          </div>

          <H5PPlayer
            contentPath={value}
            lessonTitle={lessonTitle}
            onComplete={() => undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
