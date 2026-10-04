import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "auth.passwordRequired"),
    newPassword: z.string().min(8, "auth.password.min").max(100, "auth.password.max"),
    confirmPassword: z.string().min(1, "auth.passwordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "auth.password.mismatch",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const notificationPreferencesSchema = z.object({
  emailJobAlerts: z.boolean().default(true),
  emailApplicationUpdates: z.boolean().default(true),
  emailMentoringReminders: z.boolean().default(true),
  emailMarketing: z.boolean().default(false),
});
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
