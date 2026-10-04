import { z } from "zod";

export const mentorSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  headline: z.string(),
  avatarInitials: z.string().max(3),
  rating: z.number().min(0).max(5).nullable(),
  reviewCount: z.number().int().nonnegative(),
  skills: z.array(z.string()),
});
export type Mentor = z.infer<typeof mentorSchema>;

export const mentoringSessionSchema = z.object({
  id: z.string(),
  mentorName: z.string(),
  topic: z.string(),
  startsAt: z.string().datetime(),
  status: z.enum(["upcoming", "open", "completed", "no_show"]),
  meetingUrl: z.string().url().nullable(),
});
export type MentoringSession = z.infer<typeof mentoringSessionSchema>;

export const certificateSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  category: z.string(),
  status: z.enum(["available", "obtained"]),
  obtainedAt: z.string().datetime().nullable(),
  verificationUrl: z.string().url().nullable(),
});
export type Certificate = z.infer<typeof certificateSchema>;

export const dashboardTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  isDone: z.boolean(),
});
export type DashboardTask = z.infer<typeof dashboardTaskSchema>;

export const learningEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.string().datetime(),
  status: z.enum(["upcoming", "open", "completed"]),
});
export type LearningEvent = z.infer<typeof learningEventSchema>;

export const learnerDashboardSchema = z.object({
  greetingName: z.string(),
  progressPercent: z.number().int().min(0).max(100),
  certificateCount: z.number().int().nonnegative(),
  learningHours: z.number().int().nonnegative(),
  nextLessonTitle: z.string().nullable(),
  currentTrack: z.object({
    title: z.string(),
    careerTitle: z.string(),
    progressPercent: z.number().int().min(0).max(100),
  }),
  recommendations: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["course", "certificate", "article"]),
      title: z.string(),
      durationLabel: z.string(),
    }),
  ),
  tasks: z.array(dashboardTaskSchema),
  events: z.array(learningEventSchema),
});
export type LearnerDashboard = z.infer<typeof learnerDashboardSchema>;