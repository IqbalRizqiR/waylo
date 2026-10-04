import { z } from "zod";

export const roadmapModuleStatusSchema = z.enum([
  "completed",
  "in_progress",
  "not_started",
]);
export type RoadmapModuleStatus = z.infer<typeof roadmapModuleStatusSchema>;

export const roadmapModuleSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
  status: roadmapModuleStatusSchema,
});
export type RoadmapModule = z.infer<typeof roadmapModuleSchema>;

export const roadmapRewardSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["certificate", "badge", "career_recommendation"]),
});
export type RoadmapReward = z.infer<typeof roadmapRewardSchema>;

export const roadmapSchema = z.object({
  id: z.string(),
  trackTitle: z.string(),
  progressPercent: z.number().int().min(0).max(100),
  stats: z.object({
    totalModules: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    inProgress: z.number().int().nonnegative(),
    notStarted: z.number().int().nonnegative(),
  }),
  modules: z.array(roadmapModuleSchema),
  rewards: z.array(roadmapRewardSchema),
});
export type Roadmap = z.infer<typeof roadmapSchema>;