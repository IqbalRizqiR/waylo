import { z } from "zod";
import { mentorSchema } from "./learner";

export const mentorAvailabilitySlotSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
});
export type MentorAvailabilitySlot = z.infer<
  typeof mentorAvailabilitySlotSchema
>;

export const mentorDetailSchema = mentorSchema.extend({
  bio: z.string(),
  availability: z.array(mentorAvailabilitySlotSchema),
});
export type MentorDetail = z.infer<typeof mentorDetailSchema>;

export const bookSessionSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  startsAt: z.string().datetime(),
  note: z.string().trim().max(500).optional(),
});
export type BookSessionInput = z.infer<typeof bookSessionSchema>;

export const mentorPartnerSchema = mentorSchema.extend({
  isInvited: z.boolean().default(false),
});
export type MentorPartner = z.infer<typeof mentorPartnerSchema>;

export const inviteMentorPartnerSchema = z.object({
  mentorId: z.string(),
  note: z.string().trim().max(500).optional(),
});
export type InviteMentorPartnerInput = z.infer<
  typeof inviteMentorPartnerSchema
>;
