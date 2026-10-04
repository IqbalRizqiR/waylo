import type {Course, CourseDetail, LessonStatus} from "@waylo/shared";
import {courseRepository} from "./courses.repository";
import {HttpError} from "../../lib/http";

export const courseService = {
  async list(userId?: string): Promise<Course[]> {
    const rows = await courseRepository.listPublished();
    return Promise.all(
      rows.map(async (c) => {
        let isEnrolled = false;
        let progressPercent = 0;
        if (userId) {
          const enrollment = await courseRepository.findEnrollment(c.id, userId);
          isEnrolled = Boolean(enrollment);
          progressPercent = enrollment?.progressPercent ?? 0;
        }

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          mentorName: c.mentor?.user.fullName ?? null,
          skillName: c.skill?.name ?? null,
          thumbnailUrl: c.thumbnailUrl,
          durationMinutes: c.durationMinutes,
          lessonCount: c.lessons.length,
          progressPercent,
          isEnrolled,
        };
      }),
    );
  },

  async getDetail(id: string, userId?: string): Promise<CourseDetail> {
    const course = await courseRepository.findByIdWithLessons(id);
    if (!course) {
      throw HttpError.notFound("Kursus tidak ditemukan.", "course_not_found");
    }

    let isEnrolled = false;
    let progressPercent = 0;
    const progressMap = new Map<string, LessonStatus>();

    if (userId) {
      const enrollment = await courseRepository.findEnrollment(course.id, userId);
      isEnrolled = Boolean(enrollment);
      progressPercent = enrollment?.progressPercent ?? 0;

      const progressRows = await courseRepository.listLessonProgress(course.id, userId);
      for (const p of progressRows) {
        progressMap.set(p.lessonId, p.status as LessonStatus);
      }
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      mentorName: course.mentor?.user.fullName ?? null,
      skillName: course.skill?.name ?? null,
      thumbnailUrl: course.thumbnailUrl,
      durationMinutes: course.durationMinutes,
      lessonCount: course.lessons.length,
      progressPercent,
      isEnrolled,
      lessons: course.lessons.map((l) => ({
        id: l.id,
        order: l.order,
        title: l.title,
        h5pContentPath: l.h5pContentPath,
        durationMinutes: l.durationMinutes,
        status: progressMap.get(l.id) ?? "not_started",
        interactiveConfig: (l.interactiveConfig as any) ?? null,
      })),
    };
  },

  async enroll(courseId: string, userId: string) {
    const course = await courseRepository.findByIdWithLessons(courseId);
    if (!course) {
      throw HttpError.notFound("Kursus tidak ditemukan.", "course_not_found");
    }

    const existing = await courseRepository.findEnrollment(courseId, userId);
    if (existing) {
      return existing;
    }

    return courseRepository.createEnrollment(courseId, userId);
  },

  async updateProgress(
    _courseId: string,
    lessonId: string,
    userId: string,
    status: LessonStatus,
  ) {
    return courseRepository.upsertLessonProgress(lessonId, userId, status);
  },
};
