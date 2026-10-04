import {prisma} from "../../lib/prisma";

export const adminRepository = {
  async getDashboardStats() {
    const [
      totalLearners,
      totalCompanies,
      totalMentors,
      totalActiveJobs,
      totalVerifiedSkills,
      totalCourses,
    ] = await Promise.all([
      prisma.user.count({where: {role: "learner"}}),
      prisma.company.count(),
      prisma.user.count({where: {role: "mentor"}}),
      prisma.job.count({where: {status: "published"}}),
      prisma.userSkill.count({where: {isVerified: true}}),
      prisma.course.count({where: {isPublished: true}}),
    ]);

    return {
      totalLearners,
      totalCompanies,
      totalMentors,
      totalActiveJobs,
      totalVerifiedSkills,
      totalCourses,
    };
  },

  listUsers() {
    return prisma.user.findMany({
      orderBy: {createdAt: "desc"},
      take: 50,
    });
  },

  updateUserRole(userId: string, role: any) {
    return prisma.user.update({
      where: {id: userId},
      data: {role},
    });
  },

  createSkill(data: {name: string; slug: string; category: string}) {
    return prisma.skill.create({data});
  },

  createCareer(data: {
    title: string;
    slug: string;
    summary: string;
    requirements: {skillId: string; requiredLevel: any}[];
  }) {
    return prisma.career.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        requirements: {
          create: data.requirements.map((r) => ({
            skillId: r.skillId,
            requiredLevel: r.requiredLevel,
          })),
        },
      },
      include: {
        requirements: {include: {skill: true}},
      },
    });
  },

  createQuestion(data: {
    assessmentId: string;
    type: any;
    prompt: string;
    options?: any;
    correctAnswer: any;
    points: number;
  }) {
    return prisma.question.create({
      data: {
        assessmentId: data.assessmentId,
        type: data.type,
        prompt: data.prompt,
        options: data.options ? JSON.parse(JSON.stringify(data.options)) : undefined,
        correctAnswer: JSON.parse(JSON.stringify(data.correctAnswer)),
        points: data.points,
        order: 99,
      },
    });
  },

  listCourses() {
    return prisma.course.findMany({
      include: {
        mentor: {include: {user: true}},
        skill: true,
        lessons: {orderBy: {order: "asc"}},
      },
      orderBy: {createdAt: "desc"},
    });
  },

  async updateCourse(
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
};
