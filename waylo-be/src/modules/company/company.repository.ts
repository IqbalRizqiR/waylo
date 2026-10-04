import type {Prisma} from "@prisma/client";
import {prisma} from "../../lib/prisma";

export const companyRepository = {
  findById(companyId: string) {
    return prisma.company.findUnique({where: {id: companyId}});
  },

  listActiveJobs(companyId: string) {
    return prisma.job.findMany({
      where: {companyId, status: {not: "archived"}},
      include: {_count: {select: {applications: true}}},
      orderBy: {createdAt: "desc"},
    });
  },

  listApplicationsWithJobAndCandidate(companyId: string) {
    return prisma.application.findMany({
      where: {job: {companyId}},
      include: {job: true, candidate: true},
      orderBy: {updatedAt: "desc"},
    });
  },

  listPlans() {
    return prisma.plan.findMany({orderBy: {priceAmount: "asc"}});
  },

  findLatestSubscription(companyId: string) {
    return prisma.subscription.findFirst({
      where: {companyId},
      orderBy: {createdAt: "desc"},
    });
  },

  updateProfile(companyId: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({
      where: {id: companyId},
      data,
    });
  },

  listMentors() {
    return prisma.mentorProfile.findMany({
      include: {user: true},
      orderBy: {reviewCount: "desc"},
    });
  },

  createSubscription(data: {
    companyId: string;
    planCode: "free_trial" | "premium";
    idempotencyKey?: string;
  }) {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);
    return prisma.subscription.create({
      data: {
        companyId: data.companyId,
        planCode: data.planCode,
        status: "active",
        currentPeriodEndsAt: endsAt,
        idempotencyKey: data.idempotencyKey,
      },
    });
  },
};

export type CompanyJobRow = Awaited<
  ReturnType<typeof companyRepository.listActiveJobs>
>[number];
export type CompanyApplicationRow = Awaited<
  ReturnType<typeof companyRepository.listApplicationsWithJobAndCandidate>
>[number];
export type PlanRow = Awaited<ReturnType<typeof companyRepository.listPlans>>[number];
export type SubscriptionRow = Awaited<
  ReturnType<typeof companyRepository.findLatestSubscription>
>;

// Re-exported so callers can type buildWeeklyBuckets inputs without importing Prisma types.
export type {Prisma};
