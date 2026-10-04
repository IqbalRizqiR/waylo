import { z } from "zod";
import { skillLevelSchema } from "./skills";

export const skillGapRadarPointSchema = z.object({
  subject: z.string(),
  required: z.number().min(0).max(4),
  current: z.number().min(0).max(4),
  fullMark: z.number().default(4),
});
export type SkillGapRadarPoint = z.infer<typeof skillGapRadarPointSchema>;

export const gapSeveritySchema = z.enum(["met", "unverified", "missing"]);
export type GapSeverity = z.infer<typeof gapSeveritySchema>;

export const recommendedActionSchema = z.enum(["learn", "assess", "practice"]);
export type RecommendedAction = z.infer<typeof recommendedActionSchema>;

export const skillGapActionItemSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  category: z.string(),
  requiredLevel: skillLevelSchema,
  currentLevel: skillLevelSchema.nullable(),
  isVerified: z.boolean(),
  gapSeverity: gapSeveritySchema,
  recommendedAction: recommendedActionSchema,
});
export type SkillGapActionItem = z.infer<typeof skillGapActionItemSchema>;

export const aggregateSkillGapSchema = z.object({
  targetCareer: z
    .object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
    })
    .nullable(),
  overallMatchPercent: z.number().int().min(0).max(100),
  radarData: z.array(skillGapRadarPointSchema),
  actions: z.array(skillGapActionItemSchema),
  stats: z.object({
    totalRequired: z.number().int().nonnegative(),
    verifiedCount: z.number().int().nonnegative(),
    inProgressCount: z.number().int().nonnegative(),
    missingCount: z.number().int().nonnegative(),
  }),
});
export type AggregateSkillGap = z.infer<typeof aggregateSkillGapSchema>;
