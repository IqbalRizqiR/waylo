import { z } from "zod";

export const companyProfileSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2).max(120),
  slug: z.string(),
  description: z.string().nullable(),
  industry: z.string().nullable(),
  location: z.string().nullable(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  employeeCount: z.string().nullable(),
});
export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const updateCompanyProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  industry: z.string().trim().max(100).optional(),
  location: z.string().trim().max(120).optional(),
  website: z.string().trim().url().or(z.literal("")).optional(),
  employeeCount: z.string().trim().max(50).optional(),
});
export type UpdateCompanyProfileInput = z.infer<
  typeof updateCompanyProfileSchema
>;
