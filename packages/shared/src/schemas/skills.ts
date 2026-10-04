import { z } from "zod";

export const skillLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
export type SkillLevel = z.infer<typeof skillLevelSchema>;

export const skillSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
});
export type Skill = z.infer<typeof skillSchema>;

export const careerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
});
export type Career = z.infer<typeof careerSchema>;

export const careerRequirementSchema = z.object({
  skill: skillSchema,
  requiredLevel: skillLevelSchema,
});
export type CareerRequirement = z.infer<typeof careerRequirementSchema>;

export const careerDetailSchema = careerSchema.extend({
  requirements: z.array(careerRequirementSchema),
});
export type CareerDetail = z.infer<typeof careerDetailSchema>;

export const userSkillSchema = z.object({
  skill: skillSchema,
  level: skillLevelSchema,
  isVerified: z.boolean(),
  sourceType: z.enum(["assessment", "project", "mentor"]).nullable(),
});
export type UserSkill = z.infer<typeof userSkillSchema>;

export const skillGapItemSchema = z.object({
  skill: skillSchema,
  requiredLevel: skillLevelSchema,
  currentLevel: skillLevelSchema.nullable(),
  isVerified: z.boolean(),
});
export type SkillGapItem = z.infer<typeof skillGapItemSchema>;

export const careerDetailWithGapSchema = careerDetailSchema.extend({
  skillGap: z.array(skillGapItemSchema),
  matchPercent: z.number().int().min(0).max(100),
});
export type CareerDetailWithGap = z.infer<typeof careerDetailWithGapSchema>;