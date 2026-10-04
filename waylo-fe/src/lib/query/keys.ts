// Centralised TanStack Query keys so invalidation never relies on string
// literals typed in two places.
export const queryKeys = {
  session: ["session"] as const,
  learner: {
    dashboard: ["learner", "dashboard"] as const,
    profile: ["learner", "profile"] as const,
    skillGap: ["learner", "skillGap"] as const,
    onboardingQuestions: ["learner", "onboarding", "questions"] as const,
    roadmap: ["learner", "roadmap"] as const,
    assessments: ["learner", "assessments"] as const,
    assessment: (id: string) => ["learner", "assessments", id] as const,
    assessmentResults: ["learner", "assessment-results"] as const,
    mentors: ["learner", "mentors"] as const,
    mentor: (id: string) => ["learner", "mentors", id] as const,
    sessions: ["learner", "sessions"] as const,
    certificates: ["learner", "certificates"] as const,
    certificate: (id: string) => ["learner", "certificates", id] as const,
    subscription: ["learner", "subscription"] as const,
    plans: ["learner", "plans"] as const,
  },
  courses: {
    list: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
  },
  projects: {
    list: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  company: {
    dashboard: ["company", "dashboard"] as const,
    plans: ["company", "plans"] as const,
    subscription: ["company", "subscription"] as const,
    profile: ["company", "profile"] as const,
    jobs: ["company", "jobs"] as const,
    job: (id: string) => ["company", "jobs", id] as const,
    applications: ["company", "applications"] as const,
    application: (id: string) => ["company", "applications", id] as const,
    mentorPartners: ["company", "mentorPartners"] as const,
  },
  mentor: {
    dashboard: ["mentor", "dashboard"] as const,
    reviews: ["mentor", "reviews"] as const,
    profile: ["mentor", "profile"] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    users: ["admin", "users"] as const,
  },
  catalogue: {
    skills: ["catalogue", "skills"] as const,
    careers: ["catalogue", "careers"] as const,
    career: (id: string) => ["catalogue", "careers", id] as const,
  },
} as const;
