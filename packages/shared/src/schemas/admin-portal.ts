import { z } from "zod";
import { skillLevelSchema } from "./skills";
import { questionTypeSchema } from "./assessment-flow";

export const adminDashboardStatsSchema = z.object({
  totalLearners: z.number().int().nonnegative(),
  totalCompanies: z.number().int().nonnegative(),
  totalMentors: z.number().int().nonnegative(),
  totalActiveJobs: z.number().int().nonnegative(),
  totalVerifiedSkills: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative(),
});
export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>;

export const adminUserItemSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: z.enum(["learner", "mentor", "learning_provider", "company_member", "admin"]),
  avatarInitials: z.string(),
  createdAt: z.string().datetime(),
});
export type AdminUserItem = z.infer<typeof adminUserItemSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(["learner", "mentor", "company_member", "admin"]),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const createSkillInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(60),
});
export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;

export const createCareerInputSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100),
  summary: z.string().trim().min(10).max(500),
  requirements: z.array(
    z.object({
      skillId: z.string(),
      requiredLevel: skillLevelSchema,
    }),
  ),
});
export type CreateCareerInput = z.infer<typeof createCareerInputSchema>;

export const createQuestionInputSchema = z.object({
  assessmentId: z.string(),
  type: questionTypeSchema,
  prompt: z.string().trim().min(5),
  options: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      }),
    )
    .nullable()
    .optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  points: z.number().int().positive().default(1),
});
export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;
