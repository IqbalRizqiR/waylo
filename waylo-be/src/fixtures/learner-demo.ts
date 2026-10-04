import type {
  DashboardTask,
  LearningEvent,
  RoadmapReward,
} from "@waylo/shared";

// Demo-only content for the learner dashboard. These are placeholders that
// make the screen presentable before the real recommendation/task/calendar
// features exist. They are clearly separated from business logic and every
// surface that shows them is labelled as demo data (see DESIGN.md).

export const DEMO_LEARNING_HOURS = 32;

export const DEMO_RECOMMENDATIONS = [
  {id: "rec-1", kind: "course" as const, title: "React.js untuk Pemula", durationLabel: "4 Jam 30 Menit"},
  {id: "rec-2", kind: "certificate" as const, title: "Microsoft Azure Fundamentals", durationLabel: "2 Jam"},
  {id: "rec-3", kind: "article" as const, title: "Cara Membuat CV Menarik", durationLabel: "12 Menit"},
];

export const DEMO_TASKS: DashboardTask[] = [
  {id: "task-1", label: "Selesaikan materi JavaScript", isDone: false},
  {id: "task-2", label: "Kerjakan soal asesmen minat", isDone: true},
  {id: "task-3", label: "Tonton video pembelajaran", isDone: false},
];

export const DEMO_EVENTS: LearningEvent[] = [
  {
    id: "evt-1",
    title: "Belajar live, Introduction to UI/UX",
    startsAt: "2026-08-30T03:00:00.000Z",
    status: "upcoming",
  },
  {
    id: "evt-2",
    title: "Tes Asesmen, Problem Solving",
    startsAt: "2026-08-28T03:00:00.000Z",
    status: "open",
  },
];

export const DEMO_ROADMAP_REWARDS: RoadmapReward[] = [
  {id: "rw-1", label: "Sertifikasi Penyelesaian", kind: "certificate"},
  {id: "rw-2", label: "Badge Eksklusif", kind: "badge"},
  {id: "rw-3", label: "Rekomendasi Karier", kind: "career_recommendation"},
];
