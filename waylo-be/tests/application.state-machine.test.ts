import {describe, expect, it} from "vitest";
import {
  allowedNextStages,
  assertTransition,
  canTransition,
  IllegalTransitionError,
} from "@/modules/applications/application.state-machine";

describe("application state machine", () => {
  it("sends premium applications into mentor screening", () => {
    expect(allowedNextStages("applied", "premium")).toEqual([
      "mentor_screening",
      "rejected",
    ]);
  });

  it("sends free applications into general screening", () => {
    expect(allowedNextStages("applied", "free")).toEqual([
      "general_screening",
      "rejected",
    ]);
  });

  it("follows the premium path end to end", () => {
    const path = [
      "applied",
      "mentor_screening",
      "skill_assessment",
      "mentor_review",
      "shortlisted",
      "hrd_review",
      "interview",
      "hired",
    ] as const;

    for (let i = 0; i < path.length - 1; i += 1) {
      expect(canTransition(path[i], path[i + 1], "premium")).toBe(true);
    }
  });

  it("follows the free path end to end", () => {
    const path = [
      "applied",
      "general_screening",
      "hrd_review",
      "interview",
      "hired",
    ] as const;

    for (let i = 0; i < path.length - 1; i += 1) {
      expect(canTransition(path[i], path[i + 1], "free")).toBe(true);
    }
  });

  it("rejects illegal transitions", () => {
    expect(canTransition("applied", "hired", "premium")).toBe(false);
    expect(canTransition("hired", "rejected", "premium")).toBe(false);
    expect(canTransition("rejected", "interview", "free")).toBe(false);
    expect(canTransition("general_screening", "shortlisted", "free")).toBe(false);
  });

  it("throws on an illegal transition", () => {
    expect(() => assertTransition("applied", "hired", "free")).toThrow(
      IllegalTransitionError,
    );
  });

  it("allows rejection from any active stage", () => {
    const active = [
      "applied",
      "general_screening",
      "mentor_screening",
      "skill_assessment",
      "mentor_review",
      "shortlisted",
      "hrd_review",
      "interview",
    ] as const;

    for (const stage of active) {
      expect(canTransition(stage, "rejected", "premium")).toBe(true);
    }
  });
});