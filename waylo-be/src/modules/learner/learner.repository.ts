import type {Prisma} from "@prisma/client";
import {prisma} from "../../lib/prisma";

const dashboardInclude = {
  certificates: true,
  roadmaps: {include: {modules: true, career: true}},
} satisfies Prisma.UserInclude;

export type LearnerDashboardRow = Prisma.UserGetPayload<{
  include: typeof dashboardInclude;
}>;

const roadmapInclude = {
  modules: {orderBy: {order: "asc"}},
  career: true,
} satisfies Prisma.RoadmapInclude;

export type RoadmapRow = Prisma.RoadmapGetPayload<{include: typeof roadmapInclude}>;

export const learnerRepository = {
  findDashboardUser(userId: string): Promise<LearnerDashboardRow | null> {
    return prisma.user.findUnique({where: {id: userId}, include: dashboardInclude});
  },

  findLearnerProfile(userId: string) {
    return prisma.user.findUnique({
      where: {id: userId},
      include: {
        learnerProfile: {
          include: {targetCareer: true},
        },
        userSkills: {
          include: {skill: true},
        },
        certificates: {
          orderBy: {obtainedAt: "desc"},
        },
      },
    });
  },

  async updateLearnerProfile(
    userId: string,
    profileData: Prisma.LearnerProfileUpdateInput,
    fullName?: string,
  ) {
    if (fullName) {
      await prisma.user.update({
        where: {id: userId},
        data: {fullName},
      });
    }

    return prisma.learnerProfile.upsert({
      where: {userId},
      update: profileData,
      create: {
        userId,
        headline: (profileData.headline as string) ?? "",
        bio: (profileData.bio as string) ?? "",
        location: (profileData.location as string) ?? "",
        targetCareerId: profileData.targetCareer?.connect?.id,
        openToWork: (profileData.openToWork as boolean) ?? false,
        talentPoolOptIn: (profileData.talentPoolOptIn as boolean) ?? false,
      },
      include: {targetCareer: true},
    });
  },

  findRoadmap(userId: string): Promise<RoadmapRow | null> {
    return prisma.roadmap.findFirst({
      where: {userId},
      include: roadmapInclude,
    });
  },

  listAssessments() {
    return prisma.assessment.findMany({orderBy: {title: "asc"}});
  },

  findAssessmentWithQuestions(id: string) {
    return prisma.assessment.findUnique({
      where: {id},
      include: {
        questions: {orderBy: {order: "asc"}},
      },
    });
  },

  createAttempt(data: {
    assessmentId: string;
    userId: string;
    answers: unknown;
    scorePercent: number;
    label?: string;
    completedAt: Date;
  }) {
    return prisma.attempt.create({
      data: {
        assessmentId: data.assessmentId,
        userId: data.userId,
        answers: data.answers as any,
        scorePercent: data.scorePercent,
        label: data.label,
        completedAt: data.completedAt,
      },
    });
  },

  findUserSkill(userId: string, skillId: string) {
    return prisma.userSkill.findUnique({
      where: {userId_skillId: {userId, skillId}},
    });
  },

  upsertUserSkill(userId: string, skillId: string, level: "beginner" | "intermediate" | "advanced" | "expert", isVerified = true) {
    return prisma.userSkill.upsert({
      where: {userId_skillId: {userId, skillId}},
      update: {level, isVerified, sourceType: "assessment"},
      create: {userId, skillId, level, isVerified, sourceType: "assessment"},
    });
  },

  findSkillBySlug(slug: string) {
    return prisma.skill.findUnique({where: {slug}});
  },

  listCompletedAttempts(userId: string) {
    return prisma.attempt.findMany({
      where: {userId, completedAt: {not: null}},
      include: {assessment: true},
      orderBy: {completedAt: "desc"},
    });
  },

  listMentors() {
    return prisma.mentorProfile.findMany({
      include: {user: true, availability: true},
      orderBy: {reviewCount: "desc"},
    });
  },

  findMentorWithAvailability(mentorId: string) {
    return prisma.mentorProfile.findUnique({
      where: {id: mentorId},
      include: {user: true, availability: true},
    });
  },

  createSession(data: {
    mentorId: string;
    learnerId: string;
    topic: string;
    startsAt: Date;
    note?: string;
  }) {
    return prisma.mentoringSession.create({
      data: {
        mentorId: data.mentorId,
        learnerId: data.learnerId,
        topic: data.topic,
        startsAt: data.startsAt,
        note: data.note,
        meetingUrl: "https://meet.google.com/demo-waylo-session",
      },
      include: {mentor: {include: {user: true}}},
    });
  },

  listLearnerSessions(learnerId: string) {
    return prisma.mentoringSession.findMany({
      where: {learnerId},
      include: {mentor: {include: {user: true}}},
      orderBy: {startsAt: "desc"},
    });
  },

  findCertificate(id: string) {
    return prisma.certificate.findUnique({where: {id}});
  },

  findSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: {userId},
      orderBy: {createdAt: "desc"},
    });
  },

  listPlans() {
    return prisma.plan.findMany({orderBy: {priceAmount: "asc"}});
  },

  createSubscription(data: {
    userId: string;
    planCode: "free_trial" | "premium";
    idempotencyKey?: string;
  }) {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30); // 30-day period

    return prisma.subscription.create({
      data: {
        userId: data.userId,
        planCode: data.planCode,
        status: "active",
        currentPeriodEndsAt: endsAt,
        idempotencyKey: data.idempotencyKey,
      },
    });
  },

  listAllCareersWithRequirements() {
    return prisma.career.findMany({
      include: {
        requirements: {
          include: {skill: true},
        },
      },
    });
  },

  findCareerForOnboarding(careerId: string) {
    return prisma.career.findUnique({
      where: {id: careerId},
      include: {
        requirements: {
          include: {skill: true},
          orderBy: {skill: {name: "asc"}},
        },
      },
    });
  },

  async completeOnboarding(data: {
    userId: string;
    careerId: string;
    careerTitle: string;
    skills: {skillId: string; level: "beginner" | "intermediate" | "advanced" | "expert"}[];
    modules: {title: string; summary: string; order: number; skillId?: string}[];
  }) {
    // 1. Update learner profile target career
    await prisma.learnerProfile.upsert({
      where: {userId: data.userId},
      update: {targetCareerId: data.careerId},
      create: {
        userId: data.userId,
        targetCareerId: data.careerId,
      },
    });

    // 2. Upsert initial user skills
    for (const s of data.skills) {
      await prisma.userSkill.upsert({
        where: {userId_skillId: {userId: data.userId, skillId: s.skillId}},
        update: {level: s.level},
        create: {
          userId: data.userId,
          skillId: s.skillId,
          level: s.level,
        },
      });
    }

    // 3. Create or update roadmap
    let roadmap = await prisma.roadmap.findFirst({
      where: {userId: data.userId, careerId: data.careerId},
    });

    if (!roadmap) {
      roadmap = await prisma.roadmap.create({
        data: {
          userId: data.userId,
          careerId: data.careerId,
          trackTitle: data.careerTitle,
          progressPercent: 0,
        },
      });

      for (const mod of data.modules) {
        await prisma.roadmapItem.create({
          data: {
            roadmapId: roadmap.id,
            order: mod.order,
            title: mod.title,
            summary: mod.summary,
            status: "not_started",
            skillId: mod.skillId,
          },
        });
      }
    }

    return roadmap;
  },

  listCertificates(userId: string) {
    return prisma.certificate.findMany({
      where: {userId},
      orderBy: {obtainedAt: "desc"},
    });
  },

  findRoadmapItem(itemId: string) {
    return prisma.roadmapItem.findUnique({
      where: {id: itemId},
      include: {
        skill: true,
        roadmap: true,
      },
    });
  },

  findRoadmapModuleWithItems(roadmapId: string, moduleOrder: number) {
    return prisma.roadmapItem.findMany({
      where: {roadmapId, order: moduleOrder},
      include: {skill: true},
    });
  },

  async updateRoadmapItemStatus(
    itemId: string,
    status: "completed" | "in_progress" | "not_started",
  ) {
    const updated = await prisma.roadmapItem.update({
      where: {id: itemId},
      data: {status},
      include: {skill: true, roadmap: {include: {modules: true}}},
    });

    // Recalculate progressPercent
    const total = updated.roadmap.modules.length;
    const completed = updated.roadmap.modules.filter(
      (m) => m.status === "completed",
    ).length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    await prisma.roadmap.update({
      where: {id: updated.roadmapId},
      data: {progressPercent},
    });

    return updated;
  },
};

export type AttemptRow = Awaited<
  ReturnType<typeof learnerRepository.listCompletedAttempts>
>[number];
export type MentorRow = Awaited<ReturnType<typeof learnerRepository.listMentors>>[number];
export type CertificateRow = Awaited<
  ReturnType<typeof learnerRepository.listCertificates>
>[number];
