export const ROLES = [
  "learner",
  "mentor",
  "learning_provider",
  "company_member",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export const COMPANY_SUB_ROLES = ["owner", "recruiter", "interviewer"] as const;
export type CompanySubRole = (typeof COMPANY_SUB_ROLES)[number];

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

export const FREE_LEARNING_CONTENT_TYPES = ["course", "article", "video"] as const;
export type LearningContentType = (typeof FREE_LEARNING_CONTENT_TYPES)[number];