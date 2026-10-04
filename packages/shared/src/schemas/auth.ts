import { z } from "zod";
import { ROLES } from "../constants";

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z
  .string()
  .min(8, "auth.password.min")
  .max(72, "auth.password.max");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(ROLES).default("learner"),
    acceptedTerms: z.literal(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "auth.password.mismatch",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: emailSchema,
  fullName: z.string(),
  role: z.enum(ROLES),
  avatarInitials: z.string().max(3),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const sessionSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type Session = z.infer<typeof sessionSchema>;

export const SESSION_STORAGE_KEY = "waylo.session";