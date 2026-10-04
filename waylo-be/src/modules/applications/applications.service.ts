import type {
  Application,
  ApplicationDetail,
  ApplicationStage,
} from "@waylo/shared";
import {
  applicationRepository,
  type ApplicationDetailRow,
  type ApplicationListRow,
} from "./applications.repository";
import {assertTransition} from "./application.state-machine";
import {applicationStageKey} from "../../domain/application-stage";
import {HttpError} from "../../lib/http";

function toSummary(row: ApplicationListRow): Application {
  return {
    id: row.id,
    jobId: row.jobId,
    jobTitle: row.job.title,
    candidateName: row.candidate.fullName,
    candidateInitials: row.candidate.avatarInitials,
    candidateEmail: row.candidate.email,
    track: row.track,
    stage: row.stage,
    skillMatchPercent: row.skillMatchPercent,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDetail(row: ApplicationDetailRow): ApplicationDetail {
  return {
    id: row.id,
    jobId: row.jobId,
    jobTitle: row.job.title,
    candidateName: row.candidate.fullName,
    candidateInitials: row.candidate.avatarInitials,
    candidateEmail: row.candidate.email,
    track: row.track,
    stage: row.stage,
    skillMatchPercent: row.skillMatchPercent,
    updatedAt: row.updatedAt.toISOString(),
    summary: {
      position: row.job.title,
      experienceYears: row.job.experienceMinYears,
      location: row.job.location,
      track: row.track,
    },
    history: row.stageHistory.map((h) => ({
      id: h.id,
      stage: h.stage,
      actor: h.actor,
      occurredAt: h.occurredAt.toISOString(),
      note: h.note,
    })),
  };
}

export const applicationService = {
  async listByCompany(companyId: string, jobId?: string): Promise<Application[]> {
    const rows = await applicationRepository.listByCompany(companyId, jobId);
    return rows.map(toSummary);
  },

  async getById(companyId: string, id: string): Promise<ApplicationDetail> {
    const row = await applicationRepository.findById(id);
    if (!row || row.job.companyId !== companyId) {
      throw HttpError.notFound("Kandidat tidak ditemukan.");
    }
    return toDetail(row);
  },

  stageLabel(stage: ApplicationStage): string {
    return applicationStageKey(stage);
  },

  async advance(
    companyId: string,
    id: string,
    to: ApplicationStage,
    note: string | undefined,
    actor: string,
  ): Promise<ApplicationDetail> {
    const row = await applicationRepository.findById(id);
    if (!row || row.job.companyId !== companyId) {
      throw HttpError.notFound("Kandidat tidak ditemukan.");
    }

    // State-machine validation lives here, not in the controller (RULE section 4).
    try {
      assertTransition(row.stage, to, row.track);
    } catch {
      throw HttpError.badRequest(
        `Transisi tahap ${row.stage} ke ${to} tidak diizinkan.`,
        "illegal_transition",
      );
    }

    const updated = await applicationRepository.advance(id, to, actor, note ?? null);
    return toDetail(updated);
  },
};