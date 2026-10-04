import { z } from "zod";

export const submissionStatusSchema = z.enum([
  "submitted",
  "in_review",
  "approved",
  "rejected",
]);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export const projectSubmissionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  repoUrl: z.string().url(),
  demoUrl: z.string().url().nullable(),
  notes: z.string().nullable(),
  status: submissionStatusSchema,
  feedback: z.string().nullable(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
});
export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  brief: z.string(),
  starterRepoUrl: z.string().url().nullable(),
  skillId: z.string().nullable(),
  skillName: z.string().nullable(),
  difficulty: z.enum(["beginner", "medium", "advanced"]),
  order: z.number().int().nonnegative(),
  mySubmission: projectSubmissionSchema.nullable().optional(),
});
export type Project = z.infer<typeof projectSchema>;

export const submitProjectSchema = z.object({
  repoUrl: z.string().trim().url(),
  demoUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
});
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;
