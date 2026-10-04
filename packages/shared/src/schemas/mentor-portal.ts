import { z } from "zod";
import { mentoringSessionSchema } from "./learner";
import { h5pInteractiveConfigSchema } from "./course";

export const mentorReviewVerdictSchema = z.enum([
  "recommended",
  "needs_improvement",
  "not_recommended",
]);
export type MentorReviewVerdict = z.infer<typeof mentorReviewVerdictSchema>;

export const mentorReviewQueueItemSchema = z.object({
  id: z.string(),
  type: z.enum(["candidate_screening", "project_submission"]),
  title: z.string(),
  candidateName: z.string(),
  submittedAt: z.string().datetime(),
  details: z.string(),
  targetRole: z.string(),
  referenceId: z.string(), // application id or project submission id
});
export type MentorReviewQueueItem = z.infer<
  typeof mentorReviewQueueItemSchema
>;

export const mentorDashboardStatsSchema = z.object({
  upcomingSessionsCount: z.number().int().nonnegative(),
  pendingReviewsCount: z.number().int().nonnegative(),
  activeCoursesCount: z.number().int().nonnegative(),
  totalEarnedAmount: z.number().int().nonnegative(),
  rating: z.number().nullable(),
  reviewCount: z.number().int().nonnegative(),
});
export type MentorDashboardStats = z.infer<typeof mentorDashboardStatsSchema>;

export const mentorDashboardSchema = z.object({
  mentorName: z.string(),
  headline: z.string(),
  stats: mentorDashboardStatsSchema,
  nextSessions: z.array(mentoringSessionSchema),
  pendingReviews: z.array(mentorReviewQueueItemSchema),
});
export type MentorDashboard = z.infer<typeof mentorDashboardSchema>;

export const submitMentorReviewSchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
  verdict: mentorReviewVerdictSchema,
  technicalFeedback: z.string().trim().min(10).max(2000),
});
export type SubmitMentorReviewInput = z.infer<
  typeof submitMentorReviewSchema
>;

export const mentorCreateCourseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  skillId: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(1000).default(60),
  lessons: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.number().int().nonnegative(),
        title: z.string().trim().min(3).max(120),
        durationMinutes: z.number().int().min(1).max(300),
        h5pContentPath: z.string().optional(),
        interactiveConfig: h5pInteractiveConfigSchema.nullable().optional(),
      }),
    )
    .min(1),
});
export type MentorCreateCourseInput = z.infer<
  typeof mentorCreateCourseSchema
>;

export const mentorUpdateCourseSchema = mentorCreateCourseSchema.partial();
export type MentorUpdateCourseInput = z.infer<
  typeof mentorUpdateCourseSchema
>;

export const updateMentorProfileInputSchema = z.object({
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  hourlyRate: z.number().int().nonnegative().optional(),
  expertise: z.array(z.string()).optional(),
});
export type UpdateMentorProfileInput = z.infer<
  typeof updateMentorProfileInputSchema
>;
