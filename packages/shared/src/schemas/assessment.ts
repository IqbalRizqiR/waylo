import { z } from "zod";

export const assessmentTypeSchema = z.enum([
  "career_interest",
  "personality",
  "learning_style",
  "skill_basic",
]);
export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

export const assessmentSchema = z.object({
  id: z.string(),
  type: assessmentTypeSchema,
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  questionCount: z.number().int().positive(),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const assessmentResultSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  label: z.string(),
  scorePercent: z.number().int().min(0).max(100),
  completedAt: z.string().datetime().nullable(),
});
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

export const assessmentTipSchema = z.object({
  id: z.string(),
  body: z.string(),
});
export type AssessmentTip = z.infer<typeof assessmentTipSchema>;