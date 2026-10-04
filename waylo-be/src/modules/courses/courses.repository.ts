import {prisma} from "../../lib/prisma";

export const courseRepository = {
  listPublished() {
    return prisma.course.findMany({
      where: {isPublished: true},
      include: {
        mentor: {include: {user: true}},
        skill: true,
        lessons: {select: {id: true}},
      },
      orderBy: {order: "asc"},
    });
  },

  findByIdWithLessons(id: string) {
    return prisma.course.findUnique({
      where: {id},
      include: {
        mentor: {include: {user: true}},
        skill: true,
        lessons: {orderBy: {order: "asc"}},
      },
    });
  },

  findEnrollment(courseId: string, userId: string) {
    return prisma.courseEnrollment.findUnique({
      where: {courseId_userId: {courseId, userId}},
    });
  },

  createEnrollment(courseId: string, userId: string) {
    return prisma.courseEnrollment.create({
      data: {courseId, userId},
    });
  },

  listLessonProgress(courseId: string, userId: string) {
    return prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {courseId},
      },
    });
  },

  async upsertLessonProgress(
    lessonId: string,
    userId: string,
    status: "not_started" | "in_progress" | "completed",
  ) {
    const progress = await prisma.lessonProgress.upsert({
      where: {lessonId_userId: {lessonId, userId}},
      update: {
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
      create: {
        lessonId,
        userId,
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
      include: {lesson: true},
    });

    // Update course enrollment progressPercent
    const courseId = progress.lesson.courseId;
    const allLessons = await prisma.lesson.findMany({where: {courseId}});
    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {courseId},
        status: "completed",
      },
    });

    const progressPercent =
      allLessons.length > 0
        ? Math.round((allProgress.length / allLessons.length) * 100)
        : 0;

    await prisma.courseEnrollment.upsert({
      where: {courseId_userId: {courseId, userId}},
      update: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
      create: {
        courseId,
        userId,
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    });

    return progress;
  },
};
