import type {CreateJobInput, Job, UpdateJobInput} from "@waylo/shared";
import {jobRepository, type JobDetailRow} from "./jobs.repository";
import {HttpError} from "../../lib/http";

function toJob(row: JobDetailRow): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    employmentType: row.employmentType,
    workMode: row.workMode,
    location: row.location,
    salaryMin: row.salaryMin,
    salaryMax: row.salaryMax,
    experienceMinYears: row.experienceMinYears,
    experienceMaxYears: row.experienceMaxYears,
    status: row.status,
    companyName: row.company.name,
    skills: row.skills.map((js) => ({
      skillId: js.skillId,
      name: js.skill.name,
      minLevel: js.minLevel,
    })),
    applicantCount: row._count?.applications ?? 0,
    createdAt: row.createdAt.toISOString(),
  };
}

export const jobService = {
  async listByCompany(companyId: string): Promise<Job[]> {
    const rows = await jobRepository.listByCompany(companyId);
    return rows.map((row) => toJob(row));
  },

  async getById(id: string): Promise<Job> {
    const row = await jobRepository.findById(id);
    if (!row) {
      throw HttpError.notFound("Lowongan tidak ditemukan.");
    }
    return toJob(row);
  },

  async create(companyId: string, input: CreateJobInput): Promise<Job> {
    const row = await jobRepository.create({companyId, ...input});
    return toJob(row);
  },

  async publish(companyId: string, id: string): Promise<Job> {
    const existing = await jobRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw HttpError.notFound("Lowongan tidak ditemukan.");
    }
    // Job lifecycle guard: only draft or preview jobs can be published.
    if (existing.status !== "draft" && existing.status !== "preview") {
      throw HttpError.conflict(
        "Hanya lowongan draft yang dapat dipublikasikan.",
        "invalid_status",
      );
    }
    const row = await jobRepository.publish(id);
    return toJob(row);
  },

  async update(companyId: string, id: string, input: UpdateJobInput): Promise<Job> {
    const existing = await jobRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw HttpError.notFound("Lowongan tidak ditemukan.");
    }
    const row = await jobRepository.update(id, input);
    return toJob(row);
  },
};