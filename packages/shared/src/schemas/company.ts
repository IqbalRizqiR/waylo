import { z } from "zod";

export const planCodeSchema = z.enum(["free_trial", "premium"]);
export type PlanCode = z.infer<typeof planCodeSchema>;

export const planSchema = z.object({
  id: z.string(),
  code: planCodeSchema,
  name: z.string(),
  priceAmount: z.number().int().nonnegative(),
  priceCurrency: z.string().length(3),
  billingPeriod: z.enum(["trial", "monthly"]),
  features: z.array(z.string()),
  isRecommended: z.boolean(),
});
export type Plan = z.infer<typeof planSchema>;

export const subscriptionStatusSchema = z.enum([
  "trial",
  "active",
  "past_due",
  "cancelled",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  id: z.string(),
  planCode: planCodeSchema,
  status: subscriptionStatusSchema,
  currentPeriodEndsAt: z.string().datetime().nullable(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const createSubscriptionSchema = z.object({
  planCode: planCodeSchema,
  idempotencyKey: z.string().uuid(),
});
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const companyDashboardSchema = z.object({
  companyName: z.string(),
  activeJobs: z.object({
    total: z.number().int().nonnegative(),
    premium: z.number().int().nonnegative(),
    basic: z.number().int().nonnegative(),
  }),
  applicants: z.object({
    total: z.number().int().nonnegative(),
    newThisWeek: z.number().int().nonnegative(),
  }),
  hired: z.object({
    total: z.number().int().nonnegative(),
    thisMonth: z.number().int().nonnegative(),
  }),
  myJobs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      isPremium: z.boolean(),
      applicantCount: z.number().int().nonnegative(),
      note: z.string(),
    }),
  ),
  recommendedCandidates: z.array(
    z.object({
      id: z.string(),
      stageLabel: z.string(),
      candidateName: z.string(),
      candidateInitials: z.string().max(3),
      roleTitle: z.string(),
      contextLabel: z.string(),
      updatedAt: z.string().datetime(),
    }),
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      isDone: z.boolean(),
    }),
  ),
  events: z.array(
    z.object({
      id: z.string(),
      kindLabel: z.string(),
      status: z.enum(["upcoming", "open", "completed"]),
      title: z.string(),
      startsAt: z.string().datetime(),
    }),
  ),
  monthlyApplicants: z.array(z.number().int().nonnegative()),
});
export type CompanyDashboard = z.infer<typeof companyDashboardSchema>;