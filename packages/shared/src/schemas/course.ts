import { z } from "zod";

export const lessonStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
]);
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

export const h5pInteractiveOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  correct: z.boolean(),
});
export type H5PInteractiveOption = z.infer<typeof h5pInteractiveOptionSchema>;

export const h5pKnowledgeCheckSchema = z.object({
  prompt: z.string(),
  options: z.array(h5pInteractiveOptionSchema),
  explanation: z.string().optional().default(""),
});
export type H5PKnowledgeCheck = z.infer<typeof h5pKnowledgeCheckSchema>;

export const h5pSlideSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  body: z.string(),
  highlights: z.array(z.string()).optional(),
});
export type H5PSlide = z.infer<typeof h5pSlideSchema>;

export const h5pInteractiveConfigSchema = z.object({
  activityType: z
    .enum(["course_presentation", "interactive_quiz"])
    .default("course_presentation"),
  slides: z.array(h5pSlideSchema).default([]),
  knowledgeCheck: h5pKnowledgeCheckSchema.nullable().optional(),
  summary: z
    .object({
      title: z.string(),
      body: z.string(),
    })
    .optional(),
});
export type H5PInteractiveConfig = z.infer<typeof h5pInteractiveConfigSchema>;

export const lessonSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  h5pContentPath: z.string().nullable(),
  durationMinutes: z.number().int().nonnegative(),
  status: lessonStatusSchema.default("not_started"),
  interactiveConfig: h5pInteractiveConfigSchema.nullable().optional(),
});
export type Lesson = z.infer<typeof lessonSchema>;

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  mentorName: z.string().nullable(),
  skillName: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  durationMinutes: z.number().int().nonnegative(),
  lessonCount: z.number().int().nonnegative(),
  progressPercent: z.number().int().min(0).max(100).default(0),
  isEnrolled: z.boolean().default(false),
});
export type Course = z.infer<typeof courseSchema>;

export const courseDetailSchema = courseSchema.extend({
  lessons: z.array(lessonSchema),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;

export const updateLessonProgressSchema = z.object({
  status: lessonStatusSchema,
});
export type UpdateLessonProgressInput = z.infer<
  typeof updateLessonProgressSchema
>;
