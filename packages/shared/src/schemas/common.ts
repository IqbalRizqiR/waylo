import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export function apiSuccessSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    data,
    error: z.null(),
  });
}

export function apiFailureSchema() {
  return z.object({
    data: z.null(),
    error: apiErrorSchema,
  });
}

export function apiEnvelopeSchema<T extends z.ZodTypeAny>(data: T) {
  return z.union([apiSuccessSchema(data), apiFailureSchema()]);
}

export const cursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;

export function cursorPageSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}

export const idParamSchema = z.object({
  id: z.string().min(1),
});