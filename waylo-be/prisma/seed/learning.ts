import type {PrismaClient, QuestionType} from "@prisma/client";
import type {SeedContext, SkillMap} from "./types";

const DEMO_COURSES = [
  {
    title: "HTML5 & Semantik Web",
    description: "Pelajari elemen semantik HTML5, aksesibilitas (a11y), dan struktur dokumen modern untuk SEO optimal.",
    skillSlug: "html-css",
    durationMinutes: 90,
    order: 1,
    isPublished: true,
    lessons: [
      {order: 1, title: "Pengenalan HTML5 & Elemen Semantik", durationMinutes: 20, h5pPath: "/h5p/demo/html5-semantics"},
      {order: 2, title: "Aksesibilitas Web (ARIA & Contrast)", durationMinutes: 35, h5pPath: "/h5p/demo/web-accessibility"},
      {order: 3, title: "Formulir Modern & Validasi", durationMinutes: 35, h5pPath: "/h5p/demo/html5-forms"},
    ],
  },
  {
    title: "CSS Modern: Flexbox & Grid",
    description: "Kuasai tata letak responsif modern tanpa float. Dari komponen kartu hingga layout halaman penuh.",
    skillSlug: "html-css",
    durationMinutes: 120,
    order: 2,
    isPublished: true,
    lessons: [
      {order: 1, title: "Flexbox: Dasar Sumbu & Alignment", durationMinutes: 30, h5pPath: "/h5p/demo/flexbox-basics"},
      {order: 2, title: "CSS Grid: Template Areas & Auto-Fit", durationMinutes: 45, h5pPath: "/h5p/demo/css-grid"},
      {order: 3, title: "Proyek: Layout Dashboard Responsif", durationMinutes: 45, h5pPath: "/h5p/demo/dashboard-layout"},
    ],
  },
  {
    title: "JavaScript Modern (ES6+)",
    description: "Fitur-fitur ES6 penting: arrow functions, destructuring, modules, promises, dan async/await.",
    skillSlug: "javascript",
    durationMinutes: 150,
    order: 3,
    isPublished: true,
    lessons: [
      {order: 1, title: "ES6 Syntax & Scope (let, const)", durationMinutes: 30, h5pPath: "/h5p/demo/es6-syntax"},
      {order: 2, title: "Destructuring, Spread, & Rest", durationMinutes: 35, h5pPath: "/h5p/demo/destructuring"},
      {order: 3, title: "Asynchronous JS: Promises & Async/Await", durationMinutes: 45, h5pPath: "/h5p/demo/async-await"},
      {order: 4, title: "Fetch API & Error Handling", durationMinutes: 40, h5pPath: "/h5p/demo/fetch-api"},
    ],
  },
];

type QuestionSeedDef = {
  order: number;
  type: QuestionType;
  prompt: string;
  options: {key: string; label: string}[] | null;
  correctAnswer: string | string[];
  points: number;
};

const DEMO_QUESTIONS: Record<string, QuestionSeedDef[]> = {
  "Asesmen Skill Dasar": [
    {
      order: 1,
      type: "multiple_choice",
      prompt: "Manakah tag HTML semantik yang tepat untuk menandai navigasi utama situs?",
      options: [
        {key: "a", label: "<div class=\"nav\">"},
        {key: "b", label: "<nav>"},
        {key: "c", label: "<navigation>"},
        {key: "d", label: "<menu>"},
      ],
      correctAnswer: "b",
      points: 1,
    },
    {
      order: 2,
      type: "true_false",
      prompt: "CSS Grid dirancang untuk layout satu dimensi (baris ATAU kolom), sedangkan Flexbox untuk dua dimensi.",
      options: [
        {key: "true", label: "Benar"},
        {key: "false", label: "Salah"},
      ],
      correctAnswer: "false",
      points: 1,
    },
    {
      order: 3,
      type: "multiple_select",
      prompt: "Pilih semua method array JavaScript yang TIDAK memutasi array asli (immutable):",
      options: [
        {key: "map", label: "map()"},
        {key: "filter", label: "filter()"},
        {key: "push", label: "push()"},
        {key: "sort", label: "sort()"},
        {key: "slice", label: "slice()"},
      ],
      correctAnswer: ["map", "filter", "slice"],
      points: 2,
    },
    {
      order: 4,
      type: "short_answer",
      prompt: "Tuliskan keyword JavaScript yang digunakan untuk mendeklarasikan variabel yang nilainya tidak dapat di-reassign:",
      options: null,
      correctAnswer: "const",
      points: 1,
    },
    {
      order: 5,
      type: "ordering",
      prompt: "Urutkan tahapan event loop JavaScript dari prioritas tertinggi ke terendah:",
      options: [
        {key: "1", label: "Call Stack (Synchronous)"},
        {key: "2", label: "Microtask Queue (Promises, queueMicrotask)"},
        {key: "3", label: "Macrotask Queue (setTimeout, setInterval)"},
      ],
      correctAnswer: ["1", "2", "3"],
      points: 2,
    },
  ],
  "Asesmen Minat Karier": [
    {
      order: 1,
      type: "multiple_choice",
      prompt: "Aktivitas mana yang paling kamu sukai saat membuat proyek perangkat lunak?",
      options: [
        {key: "a", label: "Merancang tampilan visual dan interaksi pengguna"},
        {key: "b", label: "Membangun API, database, dan logika bisnis"},
        {key: "c", label: "Menganalisis data dan mencari pola insight"},
        {key: "d", label: "Mengelola server, deployment, dan otomatisasi CI/CD"},
      ],
      correctAnswer: "a",
      points: 1,
    },
    {
      order: 2,
      type: "multiple_choice",
      prompt: "Ketika melihat sebuah website yang lambat, hal pertama yang ingin kamu periksa adalah:",
      options: [
        {key: "a", label: "Ukuran bundle JavaScript dan CSS yang di-render di browser"},
        {key: "b", label: "Query database yang tidak ter-index dengan baik"},
        {key: "c", label: "Konfigurasi server dan alokasi memori container"},
        {key: "d", label: "User flow yang terlalu rumit dan membingungkan"},
      ],
      correctAnswer: "a",
      points: 1,
    },
  ],
};

const AVAILABILITY_DEFS = [
  // Sarah: Mon 09:00-12:00, Wed 14:00-17:00, Fri 09:00-12:00
  {mentorEmail: "sarah.mentor@waylo.test", slots: [
    {dayOfWeek: 1, startTime: "09:00", endTime: "12:00"},
    {dayOfWeek: 3, startTime: "14:00", endTime: "17:00"},
    {dayOfWeek: 5, startTime: "09:00", endTime: "12:00"},
  ]},
  // Budi: Tue 10:00-13:00, Thu 14:00-17:00
  {mentorEmail: "budi.mentor@waylo.test", slots: [
    {dayOfWeek: 2, startTime: "10:00", endTime: "13:00"},
    {dayOfWeek: 4, startTime: "14:00", endTime: "17:00"},
  ]},
  // Maya: Mon 13:00-16:00, Thu 09:00-12:00
  {mentorEmail: "maya.mentor@waylo.test", slots: [
    {dayOfWeek: 1, startTime: "13:00", endTime: "16:00"},
    {dayOfWeek: 4, startTime: "09:00", endTime: "12:00"},
  ]},
];

const DEMO_PROJECTS = [
  {
    title: "Landing Page Portfolio Responsif",
    description: "Bangun website portofolio pribadi modern yang responsif di semua ukuran layar (mobile, tablet, desktop) dengan semantik HTML5 dan CSS Grid/Flexbox.",
    brief: "### Instruksi Proyek\n\n1. Buat layout bersih dengan header, hero section, grid proyek, dan formulir kontak.\n2. Pastikan kontras warna memenuhi standar WCAG AA.\n3. Implementasikan mobile navigation drawer.\n4. Deploy ke Vercel atau GitHub Pages.",
    starterRepoUrl: "https://github.com/waylo-templates/responsive-portfolio-starter",
    skillSlug: "html-css",
    difficulty: "beginner",
    order: 1,
  },
  {
    title: "Papan Tugas Interaktif (Kanban Board)",
    description: "Buat aplikasi manajemen tugas bergaya Kanban dengan fitur drag-and-drop, filter status, dan penyimpanan lokal (localStorage).",
    brief: "### Instruksi Proyek\n\n1. Tiga kolom status: To Do, In Progress, Done.\n2. Tambah, edit, dan hapus kartu tugas.\n3. Fitur drag-and-drop antar kolom status.\n4. Persistensi data di browser menggunakan Web Storage API.",
    starterRepoUrl: "https://github.com/waylo-templates/kanban-board-starter",
    skillSlug: "javascript",
    difficulty: "medium",
    order: 2,
  },
  {
    title: "Dashboard SaaS dengan API Terintegrasi",
    description: "Aplikasi dashboard lengkap dengan autentikasi berbasis token, konsumsi REST API, filter data real-time, dan visualisasi grafik.",
    brief: "### Instruksi Proyek\n\n1. Menggunakan Next.js / React dengan TypeScript.\n2. Manajemen state asinkron menggunakan TanStack Query.\n3. Form validasi menggunakan React Hook Form + Zod.\n4. Visualisasi analitik data ringkas.",
    starterRepoUrl: "https://github.com/waylo-templates/saas-dashboard-starter",
    skillSlug: "react",
    difficulty: "advanced",
    order: 3,
  },
];

export async function seedLearning(
  {prisma}: SeedContext,
  skills: SkillMap,
): Promise<void> {
  // 1. Seed courses & lessons
  for (const def of DEMO_COURSES) {
    const skillId = skills.get(def.skillSlug) ?? null;
    const existing = await prisma.course.findFirst({where: {title: def.title}});
    const course =
      existing ??
      (await prisma.course.create({
        data: {
          title: def.title,
          description: def.description,
          skillId,
          durationMinutes: def.durationMinutes,
          order: def.order,
          isPublished: def.isPublished,
        },
      }));

    for (const lessonDef of def.lessons) {
      const foundLesson = await prisma.lesson.findFirst({
        where: {courseId: course.id, order: lessonDef.order},
      });
      if (!foundLesson) {
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            order: lessonDef.order,
            title: lessonDef.title,
            durationMinutes: lessonDef.durationMinutes,
            h5pContentPath: lessonDef.h5pPath,
          },
        });
      }
    }
  }

  // 2. Seed questions for assessments
  for (const [title, questions] of Object.entries(DEMO_QUESTIONS)) {
    const assessment = await prisma.assessment.findFirst({where: {title}});
    if (!assessment) continue;

    for (const q of questions) {
      const existing = await prisma.question.findFirst({
        where: {assessmentId: assessment.id, order: q.order},
      });
      if (!existing) {
        await prisma.question.create({
          data: {
            assessmentId: assessment.id,
            order: q.order,
            type: q.type,
            prompt: q.prompt,
            options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
            correctAnswer: JSON.parse(JSON.stringify(q.correctAnswer)),
            points: q.points,
          },
        });
      }
    }
  }

  // 3. Seed mentor availability
  for (const def of AVAILABILITY_DEFS) {
    const user = await prisma.user.findUnique({where: {email: def.mentorEmail}});
    if (!user) continue;
    const mentor = await prisma.mentorProfile.findUnique({where: {userId: user.id}});
    if (!mentor) continue;

    for (const slot of def.slots) {
      const found = await prisma.mentorAvailability.findFirst({
        where: {mentorId: mentor.id, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime},
      });
      if (!found) {
        await prisma.mentorAvailability.create({
          data: {
            mentorId: mentor.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        });
      }
    }
  }

  // 4. Seed practical projects
  for (const def of DEMO_PROJECTS) {
    const skillId = skills.get(def.skillSlug) ?? null;
    const existing = await prisma.project.findFirst({where: {title: def.title}});
    if (!existing) {
      await prisma.project.create({
        data: {
          title: def.title,
          description: def.description,
          brief: def.brief,
          starterRepoUrl: def.starterRepoUrl,
          skillId,
          difficulty: def.difficulty,
          order: def.order,
        },
      });
    }
  }
}
