import {prisma} from "../../lib/prisma";

export const mentorRepository = {
  findProfileByUserId(userId: string) {
    return prisma.mentorProfile.findUnique({
      where: {userId},
      include: {
        user: true,
      },
    });
  },

  async getDashboardStats(mentorId: string) {
    const upcomingSessionsCount = await prisma.mentoringSession.count({
      where: {
        mentorId,
        status: {in: ["scheduled", "requested"]},
      },
    });

    const pendingReviewsCount = await prisma.application.count({
      where: {
        stage: {in: ["mentor_screening", "mentor_review"]},
      },
    });

    const activeCoursesCount = await prisma.course.count({
      where: {
        mentorId,
      },
    });

    // 1 session = IDR 250,000 baseline payout
    const completedSessions = await prisma.mentoringSession.count({
      where: {mentorId, status: "completed"},
    });
    const totalEarnedAmount = completedSessions * 250000;

    return {
      upcomingSessionsCount,
      pendingReviewsCount,
      activeCoursesCount,
      totalEarnedAmount,
    };
  },

  listNextSessions(mentorId: string) {
    return prisma.mentoringSession.findMany({
      where: {
        mentorId,
        status: {in: ["scheduled", "requested"]},
      },
      include: {
        mentor: {include: {user: true}},
        learner: true,
      },
      orderBy: {startsAt: "asc"},
      take: 5,
    });
  },

  listPendingReviews() {
    // Both company candidate screening and learner project submissions
    return Promise.all([
      prisma.application.findMany({
        where: {stage: {in: ["mentor_screening", "mentor_review"]}},
        include: {job: true, candidate: true},
        take: 10,
      }),
      prisma.projectSubmission.findMany({
        where: {status: "submitted"},
        include: {project: true, user: true},
        take: 10,
      }),
    ]);
  },

  async createReview(data: {
    mentorId: string;
    referenceId: string;
    type: "candidate_screening" | "project_submission";
    score?: number;
    verdict: string;
    technicalFeedback: string;
  }) {
    if (data.type === "candidate_screening") {
      const review = await prisma.mentorReview.create({
        data: {
          mentorId: data.mentorId,
          applicationId: data.referenceId,
          score: data.score,
          verdict: data.verdict,
          technicalFeedback: data.technicalFeedback,
        },
      });

      // Advance application stage
      const nextStage =
        data.verdict === "recommended" ? "shortlisted" : "rejected";

      await prisma.application.update({
        where: {id: data.referenceId},
        data: {stage: nextStage},
      });

      await prisma.applicationStageHistory.create({
        data: {
          applicationId: data.referenceId,
          stage: nextStage,
          actor: "Mentor Technical Evaluator",
          note: `Evaluasi Mentor: ${data.technicalFeedback} (Rekomendasi: ${data.verdict})`,
        },
      });

      return review;
    } else {
      const review = await prisma.mentorReview.create({
        data: {
          mentorId: data.mentorId,
          projectSubmissionId: data.referenceId,
          score: data.score,
          verdict: data.verdict,
          technicalFeedback: data.technicalFeedback,
        },
      });

      const nextStatus =
        data.verdict === "recommended" ? "approved" : "rejected";

      await prisma.projectSubmission.update({
        where: {id: data.referenceId},
        data: {
          status: nextStatus,
          feedback: data.technicalFeedback,
          reviewedAt: new Date(),
        },
      });

      return review;
    }
  },

  async createCourse(data: {
    mentorId: string;
    title: string;
    description: string;
    skillId?: string;
    durationMinutes: number;
    lessons: {
      order: number;
      title: string;
      durationMinutes: number;
      h5pContentPath?: string;
      interactiveConfig?: any;
    }[];
  }) {
    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        mentorId: data.mentorId,
        skillId: data.skillId,
        durationMinutes: data.durationMinutes,
        isPublished: true,
        lessons: {
          create: data.lessons.map((l) => ({
            order: l.order,
            title: l.title,
            durationMinutes: l.durationMinutes,
            h5pContentPath: l.h5pContentPath,
            interactiveConfig: l.interactiveConfig ?? undefined,
          })),
        },
      },
      include: {
        lessons: true,
      },
    });
  },

  async updateCourse(
    mentorId: string,
    courseId: string,
    data: {
      title?: string;
      description?: string;
      skillId?: string;
      durationMinutes?: number;
      lessons?: {
        order: number;
        title: string;
        durationMinutes: number;
        h5pContentPath?: string;
        interactiveConfig?: any;
      }[];
    },
  ) {
    const {lessons, ...fields} = data;

    if (lessons && lessons.length > 0) {
      await prisma.lesson.deleteMany({where: {courseId}});
      await prisma.lesson.createMany({
        data: lessons.map((l) => ({
          courseId,
          order: l.order,
          title: l.title,
          durationMinutes: l.durationMinutes,
          h5pContentPath: l.h5pContentPath,
          interactiveConfig: l.interactiveConfig ?? undefined,
        })),
      });
    }

    return prisma.course.update({
      where: {id: courseId},
      data: fields,
      include: {
        lessons: {orderBy: {order: "asc"}},
      },
    });
  },

  updateProfile(mentorId: string, data: {
    headline?: string;
    bio?: string;
    hourlyRate?: number;
    expertise?: string[];
  }) {
    return prisma.mentorProfile.update({
      where: {id: mentorId},
      data,
    });
  },
};
