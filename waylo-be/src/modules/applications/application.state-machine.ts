import type {ApplicationStage, ApplicationTrack} from "@waylo/shared";
import {allowedNextStages, canTransition, isTerminalStage} from "@waylo/shared";

// The transition table lives in @waylo/shared so the web and the API agree.
// This module re-exports it with a domain-specific error for the service layer.

export {allowedNextStages, canTransition, isTerminalStage};

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: ApplicationStage,
    readonly to: ApplicationStage,
    readonly track: ApplicationTrack,
  ) {
    super(`Illegal application transition: ${from} -> ${to} (${track})`);
    this.name = "IllegalTransitionError";
  }
}

export function assertTransition(
  current: ApplicationStage,
  next: ApplicationStage,
  track: ApplicationTrack,
): void {
  if (!canTransition(current, next, track)) {
    throw new IllegalTransitionError(current, next, track);
  }
}