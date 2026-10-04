import type {ApplicationStage} from "@waylo/shared";

// Translation keys for pipeline stages, used by read models that expose a
// human label (company dashboard, candidate lists). The web resolves the key
// to localized copy; the API never emits hardcoded Indonesian.
export const APPLICATION_STAGE_KEY: Record<ApplicationStage, string> = {
  applied: "applied",
  general_screening: "generalScreening",
  mentor_screening: "mentorScreening",
  skill_assessment: "skillAssessment",
  mentor_review: "mentorReview",
  shortlisted: "shortlisted",
  hrd_review: "hrdReview",
  interview: "interview",
  hired: "hired",
  rejected: "rejected",
};

export function applicationStageKey(stage: ApplicationStage): string {
  return APPLICATION_STAGE_KEY[stage] ?? stage;
}
