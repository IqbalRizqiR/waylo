import { z } from "zod";
import { assessmentSchema } from "./assessment";

export const questionTypeSchema = z.enum([
  "multiple_choice",
  "multiple_select",
  "true_false",
  "short_answer",
  "ordering",
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
});
export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  type: questionTypeSchema,
  prompt: z.string(),
  options: z.array(questionOptionSchema).nullable(),
  points: z.number().int().positive().default(1),
});
export type Question = z.infer<typeof questionSchema>;

export const assessmentDetailSchema = assessmentSchema.extend({
  questions: z.array(questionSchema),
});
export type AssessmentDetail = z.infer<typeof assessmentDetailSchema>;

export const assessmentAnswerItemSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
});
export type AssessmentAnswerItem = z.infer<typeof assessmentAnswerItemSchema>;

export const submitAssessmentSchema = z.object({
  answers: z.array(assessmentAnswerItemSchema),
});
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;

export const assessmentGradedResultSchema = z.object({
  scorePercent: z.number().int().min(0).max(100),
  passed: z.boolean(),
  totalQuestions: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  verifiedSkill: z.string().nullable(),
});
export type AssessmentGradedResult = z.infer<
  typeof assessmentGradedResultSchema
>;
