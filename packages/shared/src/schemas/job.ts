import { z } from "zod";
import { skillLevelSchema } from "./skills";
import { cursorPaginationQuerySchema } from "./common";

export const jobStatusSchema = z.enum(["draft", "preview", "published", "archived"]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const employmentTypeSchema = z.enum(["full_time", "part_time", "contract", "internship"]);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const workModeSchema = z.enum(["remote", "hybrid", "onsite"]);
export type WorkMode = z.infer<typeof workModeSchema>;

export const jobSkillInputSchema = z.object({
  skillId: z.string().min(1),
  minLevel: skillLevelSchema,
});
export type JobSkillInput = z.infer<typeof jobSkillInputSchema>;

export const jobDraftSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(4000),
  employmentType: employmentTypeSchema,
  workMode: workModeSchema,
  location: z.string().trim().min(2).max(120),
  salaryMin: z.number().int().nonnegative().nullable(),
  salaryMax: z.number().int().nonnegative().nullable(),
  experienceMinYears: z.number().int().nonnegative().nullable(),
  experienceMaxYears: z.number().int().nonnegative().nullable(),
});
export type JobDraft = z.infer<typeof jobDraftSchema>;

export const createJobSchema = jobDraftSchema.extend({
  skills: z.array(jobSkillInputSchema).min(1),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial();
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const jobSchema = jobDraftSchema.extend({
  id: z.string(),
  status: jobStatusSchema,
  companyName: z.string(),
  skills: z.array(
    z.object({
      skillId: z.string(),
      name: z.string(),
      minLevel: skillLevelSchema,
    }),
  ),
  applicantCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
});
export type Job = z.infer<typeof jobSchema>;

export const jobListQuerySchema = cursorPaginationQuerySchema.extend({
  status: jobStatusSchema.optional(),
});
export type JobListQuery = z.infer<typeof jobListQuerySchema>;

export const applicationStageSchema = z.enum([
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
]);
export type ApplicationStage = z.infer<typeof applicationStageSchema>;

export const applicationTrackSchema = z.enum(["premium", "free"]);
export type ApplicationTrack = z.infer<typeof applicationTrackSchema>;

export const applicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  candidateName: z.string(),
  candidateInitials: z.string().max(3),
  candidateEmail: z.string().email().nullable(),
  track: applicationTrackSchema,
  stage: applicationStageSchema,
  skillMatchPercent: z.number().int().min(0).max(100).nullable(),
  updatedAt: z.string().datetime(),
});
export type Application = z.infer<typeof applicationSchema>;

export const applicationStageHistorySchema = z.object({
  id: z.string(),
  stage: applicationStageSchema,
  actor: z.string(),
  occurredAt: z.string().datetime(),
  note: z.string().nullable(),
});
export type ApplicationStageHistory = z.infer<typeof applicationStageHistorySchema>;

export const applicationDetailSchema = applicationSchema.extend({
  summary: z.object({
    position: z.string(),
    experienceYears: z.number().int().nonnegative().nullable(),
    location: z.string(),
    track: applicationTrackSchema,
  }),
  history: z.array(applicationStageHistorySchema),
});
export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;

export const advanceApplicationSchema = z.object({
  to: applicationStageSchema,
  note: z.string().trim().max(500).optional(),
});
export type AdvanceApplicationInput = z.infer<typeof advanceApplicationSchema>;