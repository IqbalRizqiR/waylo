import { z } from "zod";
import { userSkillSchema } from "./skills";
import { certificateSchema } from "./learner";

export const learnerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  avatarInitials: z.string(),
  headline: z.string(),
  bio: z.string().nullable(),
  location: z.string(),
  targetCareerId: z.string().nullable(),
  targetCareerTitle: z.string().nullable(),
  openToWork: z.boolean(),
  talentPoolOptIn: z.boolean(),
  skills: z.array(userSkillSchema),
  certificates: z.array(certificateSchema),
  createdAt: z.string().datetime(),
});
export type LearnerProfile = z.infer<typeof learnerProfileSchema>;

export const updateLearnerProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(120).optional(),
  targetCareerId: z.string().nullable().optional(),
  openToWork: z.boolean().optional(),
  talentPoolOptIn: z.boolean().optional(),
});
export type UpdateLearnerProfileInput = z.infer<
  typeof updateLearnerProfileSchema
>;
