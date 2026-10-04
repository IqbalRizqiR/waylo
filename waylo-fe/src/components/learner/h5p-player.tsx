"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import type {H5PInteractiveConfig} from "@waylo/shared";

type H5PPlayerProps = {
  contentPath?: string | null;
  interactiveConfig?: H5PInteractiveConfig | null;
  lessonTitle: string;
  onComplete?: () => void;
};

type InteractiveQuestion = {
  prompt: string;
  options: {key: string; label: string; correct: boolean}[];
  explanation: string;
};

export function H5PPlayer({
  contentPath,
  interactiveConfig,
  lessonTitle,
  onComplete,
}: H5PPlayerProps) {
  const t = useTranslations("learner.learning");
  const tc = useTranslations("common");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Dynamic slides with embedded interactive H5P knowledge check
  const defaultQuestion: InteractiveQuestion = {
    prompt: `Berdasarkan materi "${lessonTitle}", manakah praktik terbaik yang paling tepat diterapkan pada arsitektur web modern?`,
    options: [
      {
        key: "a",
        label: "Menggunakan tag semantik standar, memastikan kontras WCAG AA, dan memisahkan state secara terisolasi.",
        correct: true,
      },
      {
        key: "b",
        label: "Menggunakan tag <div> untuk semua elemen tampilan agar fleksibel dalam styling CSS.",
        correct: false,
      },
      {
        key: "c",
        label: "Menyimpan seluruh state aplikasi di satu variabel global tanpa validasi tipe.",
        correct: false,
      },
      {
        key: "d",
        label: "Mengabaikan atribut ARIA karena browser modern sudah otomatis mendeteksi elemen.",
        correct: false,
      },
    ],
    explanation:
      "Struktur semantik dan kepatuhan WCAG memastikan aksesibilitas bagi semua pengguna, sedangkan arsitektur terisolasi mempermudah pengujian dan pemeliharaan kode.",
  };

  const question: InteractiveQuestion = interactiveConfig?.knowledgeCheck
    ? {
        prompt: interactiveConfig.knowledgeCheck.prompt,
        options: interactiveConfig.knowledgeCheck.options,
        explanation: interactiveConfig.knowledgeCheck.explanation || "",
      }
    : defaultQuestion;

  const customIntroSlide = interactiveConfig?.slides?.[0];
  const customSummary = interactiveConfig?.summary;

  const slides = [
    {
      type: "intro",
      title: customIntroSlide?.title ?? "1. Konsep Utama & Tujuan Belajar",
      subtitle: customIntroSlide?.subtitle ?? "H5P.CoursePresentation • Modul Interaktif",
      body:
        customIntroSlide?.body ??
        `Selamat datang di modul interaktif "${lessonTitle}". Di modul ini kamu akan mempelajari implementasi konsep secara bertahap dan menguji pemahamanmu secara langsung sebelum melanjutkan ke materi berikutnya.`,
      highlights: customIntroSlide?.highlights ?? [
        "Desain berbasis komponen mandiri dan modular",
        "Kepatuhan standar industri (Accessibility & Performance)",
        "Validasi input di batas sistem sebelum pengolahan data",
      ],
    },
    {
      type: "interactive_check",
      title: "2. Knowledge Check (Kuis Interaktif H5P)",
      subtitle: "Uji Pemahaman Langsung • 1 Poin",
      question,
    },
    {
      type: "summary",
      title: customSummary?.title ?? "3. Rangkuman & Penyelesaian Modul",
      subtitle: "xAPI Statement • Progress Reporting",
      body:
        customSummary?.body ??
        "Kamu telah menyelesaikan materi presentasi dan uji pemahaman interaktif H5P untuk modul ini. Hasil belajarmu telah terekam dan akan memperbarui roadmap pencapaian kariermu.",
    },
  ];

  function handleCheckAnswer() {
    if (!selectedOption) return;
    const opt = question.options.find((o) => o.key === selectedOption);
    const correct = Boolean(opt?.correct);
    setIsAnswerCorrect(correct);
    setHasCheckedAnswer(true);
    setScore(correct ? 1 : 0);
  }

  function handleRetry() {
    setSelectedOption(null);
    setHasCheckedAnswer(false);
    setIsAnswerCorrect(false);
  }

  function handleNext() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      onComplete?.();
    }
  }

  function handlePrev() {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
    }
  }

  const slide = slides[currentSlide];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border-2 border-primary/20 bg-white shadow-brand transition-all ${
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl" : "relative w-full"
      }`}
    >
      {/* Authentic H5P Top Header Bar */}
      <div className="flex items-center justify-between border-b border-border bg-slate-50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 rounded bg-[#1a73e8] px-2 py-0.5 text-xs font-bold text-white tracking-wider">
            H5P
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Course Presentation
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">•</span>
          <span className="truncate text-sm font-medium text-black max-w-[280px] sm:max-w-md">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span className="font-semibold text-black">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1 w-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{width: `${((currentSlide + 1) / slides.length) * 100}%`}}
        />
      </div>

      {/* Slide Body Stage */}
      <div className="flex min-h-[360px] sm:min-h-[400px] flex-col justify-between p-6 sm:p-10">
        {slide.type === "intro" && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {slide.subtitle}
              </span>
              <h3 className="mt-1 text-2xl font-bold text-black sm:text-3xl">
                {slide.title}
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              {slide.body}
            </p>

            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-primary/20 bg-secondary/20 p-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Target Kompetensi:
              </span>
              <ul className="flex flex-col gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                {slide.highlights?.map((hl, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="mingcute:check-circle-line" className="text-success text-base shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {slide.type === "interactive_check" && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  Interactive Task
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {slide.subtitle}
                </span>
              </div>
              <h3 className="mt-2 text-lg sm:text-xl font-medium leading-snug text-black">
                {slide.question?.prompt}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {slide.question?.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                let optionStyle = "border-border bg-white text-black hover:border-primary/40";

                if (hasCheckedAnswer) {
                  if (opt.correct) {
                    optionStyle = "border-green-500 bg-green-50 text-green-900 font-medium";
                  } else if (isSelected && !opt.correct) {
                    optionStyle = "border-red-400 bg-red-50 text-red-900";
                  }
                } else if (isSelected) {
                  optionStyle = "border-primary bg-secondary/30 text-primary font-medium shadow-sm";
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={hasCheckedAnswer}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-all ${optionStyle}`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border text-[var(--muted-foreground)]"
                      }`}
                    >
                      {opt.key.toUpperCase()}
                    </span>
                    <span className="leading-snug pt-0.5">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {hasCheckedAnswer ? (
              <div
                className={`rounded-xl border p-4 text-xs sm:text-sm ${
                  isAnswerCorrect
                    ? "border-green-300 bg-green-50 text-green-900"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Icon
                    name={
                      isAnswerCorrect
                        ? "mingcute:check-circle-line"
                        : "mingcute:alert-line"
                    }
                    className="text-lg shrink-0"
                  />
                  <span>
                    {isAnswerCorrect ? "Jawaban Benar! (1/1 poin)" : "Jawaban Kurang Tepat"}
                  </span>
                </div>
                {slide.question?.explanation ? (
                  <p className="mt-1 text-xs opacity-90">{slide.question.explanation}</p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              {!hasCheckedAnswer ? (
                <Button
                  size="sm"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                >
                  <Icon name="mingcute:check-line" className="mr-1 text-base" />
                  Periksa Jawaban
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleRetry}>
                  <Icon name="mingcute:refresh-1-line" className="mr-1 text-base" />
                  Coba Lagi
                </Button>
              )}
            </div>
          </div>
        )}

        {slide.type === "summary" && (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-green-100 text-3xl text-success">
              <Icon name="mingcute:award-line" />
            </span>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {slide.subtitle}
              </span>
              <h3 className="mt-1 text-2xl font-bold text-black sm:text-3xl">
                Modul Berhasil Diselesaikan!
              </h3>
              <p className="mt-2 max-w-lg text-sm text-[var(--text-secondary)]">
                {slide.body}
              </p>
            </div>

            {score !== null ? (
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/30 px-5 py-2 text-sm font-semibold text-primary">
                <Icon name="mingcute:check-circle-line" className="text-lg" />
                <span>Skor Evaluasi Interaktif: {score > 0 ? "100%" : "Perlu Belajar Ulang"}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Slide Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
            {tc("back")}
          </Button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`size-2.5 rounded-full transition-all ${
                  idx === currentSlide ? "bg-primary scale-125" : "bg-border hover:bg-primary/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <Button size="sm" onClick={handleNext}>
            {currentSlide === slides.length - 1 ? (
              <>
                <Icon name="mingcute:check-line" className="mr-1 text-base" />
                {t("finishLesson")}
              </>
            ) : (
              <>
                {t("nextSlide")}
                <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Authentic H5P Bottom Action Bar */}
      <div className="flex items-center justify-between border-t border-border bg-slate-100 px-4 py-2.5 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="rounded bg-[#1a73e8] px-1 text-[10px] font-bold text-white">H5P</span>
            <span>Interactive Content</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Hak Penggunaan (CC BY-SA 4.0)</span>
          {contentPath ? (
            <span className="hidden md:inline font-mono text-[10px] opacity-70">
              {contentPath}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-200 transition-colors"
            title="Toggle Fullscreen"
          >
            <Icon
              name={isFullscreen ? "mingcute:fullscreen-exit-line" : "mingcute:fullscreen-line"}
              className="text-base text-slate-700"
            />
            <span className="hidden sm:inline">
              {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
