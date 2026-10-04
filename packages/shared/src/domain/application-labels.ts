import type {ApplicationStage, ApplicationTrack} from "../schemas/job";
import {allowedNextStages} from "./pipeline";

// Display labels for the pipeline. UI copy lives in next-intl; these keys map
// a stage to its translation key so components never hardcode Indonesian.
export const APPLICATION_STAGE_LABEL_KEY: Record<ApplicationStage, string> = {
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

export type PipelineActionKey = {
  to: ApplicationStage;
  labelKey: string;
};

// Translation keys for the action that moves a candidate to the next stage.
const ACTION_LABEL_KEY: Partial<Record<ApplicationStage, string>> = {
  general_screening: "startGeneralScreening",
  mentor_screening: "startMentorScreening",
  skill_assessment: "toSkillAssessment",
  mentor_review: "toMentorReview",
  shortlisted: "shortlist",
  hrd_review: "toHrdReview",
  interview: "scheduleInterview",
  hired: "hireCandidate",
};

export function pipelineActions(
  current: ApplicationStage,
  track: ApplicationTrack,
): PipelineActionKey[] {
  return allowedNextStages(current, track)
    .filter((stage) => stage !== "rejected")
    .map((stage) => ({
      to: stage,
      labelKey: ACTION_LABEL_KEY[stage] ?? stage,
    }));
}

export const REJECT_ACTION_LABEL_KEY = "rejectCandidate";