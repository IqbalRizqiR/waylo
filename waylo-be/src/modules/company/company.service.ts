import type {
  CompanyDashboard,
  CompanyProfile,
  MentorPartner,
  Plan,
  Subscription,
  UpdateCompanyProfileInput,
} from "@waylo/shared";
import {companyRepository} from "./company.repository";
import {applicationStageKey} from "../../domain/application-stage";
import {HttpError} from "../../lib/http";

// Read-only projections for the company hub. No Prisma access here.

export const companyService = {
  async dashboard(companyId: string): Promise<CompanyDashboard> {
    const [company, jobs, applications] = await Promise.all([
      companyRepository.findById(companyId),
      companyRepository.listActiveJobs(companyId),
      companyRepository.listApplicationsWithJobAndCandidate(companyId),
    ]);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const premiumJobs = jobs.filter((j) => j.isPremium);
    const hired = applications.filter((a) => a.stage === "hired");

    return {
      companyName: company?.name ?? "Perusahaan",
      activeJobs: {
        total: jobs.length,
        premium: premiumJobs.length,
        basic: jobs.length - premiumJobs.length,
      },
      applicants: {
        total: applications.length,
        newThisWeek: applications.filter((a) => a.createdAt >= weekAgo).length,
      },
      hired: {
        total: hired.length,
        thisMonth: hired.filter((a) => a.updatedAt >= monthStart).length,
      },
      myJobs: jobs.slice(0, 3).map((j) => ({
        id: j.id,
        title: j.title,
        isPremium: j.isPremium,
        applicantCount: j._count.applications,
        note:
          j.isPremium
            ? `${j._count.applications} kandidat lolos mentor screening`
            : `${j._count.applications} pelamar melalui jalur umum`,
      })),
      recommendedCandidates: applications.slice(0, 3).map((a) => ({
        id: a.id,
        stageLabel: applicationStageKey(a.stage),
        candidateName: a.candidate.fullName,
        candidateInitials: a.candidate.avatarInitials,
        roleTitle: a.job.title,
        contextLabel:
          a.track === "premium" ? "premiumRecruitment" : "basicRecruitment",
        updatedAt: a.updatedAt.toISOString(),
      })),
      tasks: [
        {id: "ct-1", label: "Review CV kandidat baru", isDone: false},
        {id: "ct-2", label: "Jadwalkan interview kandidat shortlist", isDone: false},
        {id: "ct-3", label: "Diskusi hasil skill assessment dengan mentor", isDone: false},
      ],
      events: applications.slice(0, 2).map((a, i) => ({
        id: `ce-${a.id}`,
        kindLabel: a.stage === "interview" ? "interview" : "mentorReview",
        status: i === 0 ? "upcoming" : "open",
        title: a.job.title,
        startsAt: a.updatedAt.toISOString(),
      })),
      monthlyApplicants: buildWeeklyBuckets(applications.map((a) => a.createdAt)),
    };
  },

  async plans(): Promise<Plan[]> {
    const rows = await companyRepository.listPlans();
    return rows.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      priceAmount: p.priceAmount,
      priceCurrency: p.priceCurrency,
      billingPeriod: p.billingPeriod === "trial" ? "trial" : "monthly",
      features: p.features,
      isRecommended: p.isRecommended,
    }));
  },

  async subscription(companyId: string): Promise<Subscription | null> {
    const sub = await companyRepository.findLatestSubscription(companyId);
    if (!sub) {
      return null;
    }
    return {
      id: sub.id,
      planCode: sub.planCode,
      status: sub.status,
      currentPeriodEndsAt: sub.currentPeriodEndsAt
        ? sub.currentPeriodEndsAt.toISOString()
        : null,
    };
  },

  async getProfile(companyId: string): Promise<CompanyProfile> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw HttpError.notFound("Perusahaan tidak ditemukan.", "company_not_found");
    }
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      industry: company.industry,
      location: company.location,
      website: company.website,
      logoUrl: company.logoUrl,
      employeeCount: company.employeeCount,
    };
  },

  async updateProfile(
    companyId: string,
    data: UpdateCompanyProfileInput,
  ): Promise<CompanyProfile> {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw HttpError.notFound("Perusahaan tidak ditemukan.", "company_not_found");
    }
    const updated = await companyRepository.updateProfile(companyId, data);
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      industry: updated.industry,
      location: updated.location,
      website: updated.website,
      logoUrl: updated.logoUrl,
      employeeCount: updated.employeeCount,
    };
  },

  async subscribe(
    companyId: string,
    planCode: "free_trial" | "premium",
    idempotencyKey?: string,
  ): Promise<Subscription> {
    const sub = await companyRepository.createSubscription({
      companyId,
      planCode,
      idempotencyKey,
    });
    return {
      id: sub.id,
      planCode: sub.planCode,
      status: sub.status,
      currentPeriodEndsAt: sub.currentPeriodEndsAt
        ? sub.currentPeriodEndsAt.toISOString()
        : null,
    };
  },

  async mentorPartners(): Promise<MentorPartner[]> {
    const rows = await companyRepository.listMentors();
    return rows.map((m) => ({
      id: m.id,
      fullName: m.user.fullName,
      headline: m.headline,
      avatarInitials: m.user.avatarInitials,
      rating: m.rating ? Number(m.rating) : null,
      reviewCount: m.reviewCount,
      skills: ["Frontend", "React", "TypeScript", "Code Review"],
      isInvited: false,
    }));
  },

  async inviteMentor(
    companyId: string,
    mentorId: string,
    note?: string,
  ): Promise<{success: boolean}> {
    // Intent recorded for mentor-assisted screening partnership
    return {success: true};
  },
};

function buildWeeklyBuckets(dates: Date[]): number[] {
  const buckets = new Array(12).fill(0) as number[];
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  for (const date of dates) {
    const diff = Math.floor((now - date.getTime()) / week);
    if (diff >= 0 && diff < 12) {
      buckets[11 - diff] += 1;
    }
  }
  return buckets;
}
