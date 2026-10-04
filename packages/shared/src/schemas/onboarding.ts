import { z } from "zod";
import { skillLevelSchema } from "./skills";

export const onboardingQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      trait: z.string(),
    }),
  ),
});
export type OnboardingQuestion = z.infer<typeof onboardingQuestionSchema>;

export const onboardingRecommendationSchema = z.object({
  careerId: z.string(),
  title: z.string(),
  summary: z.string(),
  matchPercent: z.number().int().min(0).max(100),
  keySkills: z.array(z.string()),
});
export type OnboardingRecommendation = z.infer<
  typeof onboardingRecommendationSchema
>;

export const getRecommendationsInputSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionKey: z.string(),
    }),
  ),
});
export type GetRecommendationsInput = z.infer<
  typeof getRecommendationsInputSchema
>;

export const completeOnboardingSchema = z.object({
  careerId: z.string().min(1),
  experienceLevel: skillLevelSchema.default("beginner"),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
