import { z } from "zod";
import { roadmapModuleStatusSchema } from "./roadmap";

export const roadmapItemDetailSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  summary: z.string(),
  status: roadmapModuleStatusSchema,
  skillName: z.string().nullable(),
});
export type RoadmapItemDetail = z.infer<typeof roadmapItemDetailSchema>;

export const roadmapModuleDetailSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  summary: z.string(),
  status: roadmapModuleStatusSchema,
  items: z.array(roadmapItemDetailSchema),
});
export type RoadmapModuleDetail = z.infer<typeof roadmapModuleDetailSchema>;

export const updateRoadmapItemStatusSchema = z.object({
  status: roadmapModuleStatusSchema,
});
export type UpdateRoadmapItemStatusInput = z.infer<
  typeof updateRoadmapItemStatusSchema
>;
