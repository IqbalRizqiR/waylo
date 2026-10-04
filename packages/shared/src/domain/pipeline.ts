import type {ApplicationStage, ApplicationTrack} from "../schemas/job";

// Single source of truth for the hiring pipeline, shared by web and api.
// The API uses it to validate transitions; the web uses it to render the
// allowed next actions. They can never drift because it lives here once.

export const APPLICATION_STAGES = [
  "applied",
  "general_screening",
  "mentor_screening",
  "skill_assessment",
  "mentor_review",
  "shortlisted",
  "hrd_review",
  "interview",
  "hired",
  "rejected",
] as const satisfies readonly ApplicationStage[];

export const TERMINAL_STAGES: readonly ApplicationStage[] = ["hired", "rejected"];

export function isTerminalStage(stage: ApplicationStage): boolean {
  return TERMINAL_STAGES.includes(stage);
}

const FORWARD_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  applied: ["general_screening", "mentor_screening"],
  general_screening: ["hrd_review"],
  mentor_screening: ["skill_assessment"],
  skill_assessment: ["mentor_review"],
  mentor_review: ["shortlisted"],
  shortlisted: ["hrd_review"],
  hrd_review: ["interview"],
  interview: ["hired"],
  hired: [],
  rejected: [],
};

// A stage can always be rejected while it is active.
export function allowedNextStages(
  current: ApplicationStage,
  track: ApplicationTrack,
): ApplicationStage[] {
  if (isTerminalStage(current)) {
    return [];
  }

  const forward = FORWARD_TRANSITIONS[current];
  const entryFiltered =
    current === "applied"
      ? forward.filter((stage) =>
          track === "premium"
            ? stage === "mentor_screening"
            : stage === "general_screening",
        )
      : forward;

  return [...entryFiltered, "rejected"];
}

export function canTransition(
  current: ApplicationStage,
  next: ApplicationStage,
  track: ApplicationTrack,
): boolean {
  if (isTerminalStage(current)) {
    return false;
  }
  if (next === "rejected") {
    return true;
  }
  const forward = FORWARD_TRANSITIONS[current];
  if (current === "applied") {
    return track === "premium"
      ? next === "mentor_screening"
      : next === "general_screening";
  }
  return forward.includes(next);
}