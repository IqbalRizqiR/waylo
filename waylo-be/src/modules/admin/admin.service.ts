import type {
  AdminDashboardStats,
  AdminUserItem,
  CourseDetail,
  CreateCareerInput,
  CreateQuestionInput,
  CreateSkillInput,
  MentorUpdateCourseInput,
  Role,
} from "@waylo/shared";
import {adminRepository} from "./admin.repository";

export const adminService = {
  async getDashboard(): Promise<AdminDashboardStats> {
    return adminRepository.getDashboardStats();
  },

  async listUsers(): Promise<AdminUserItem[]> {
    const rows = await adminRepository.listUsers();
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role as Role,
      avatarInitials: u.avatarInitials,
      createdAt: u.createdAt.toISOString(),
    }));
  },

  async updateUserRole(userId: string, role: string) {
    return adminRepository.updateUserRole(userId, role);
  },

  async createSkill(input: CreateSkillInput) {
    return adminRepository.createSkill(input);
  },

  async createCareer(input: CreateCareerInput) {
    return adminRepository.createCareer(input);
  },

  async createQuestion(input: CreateQuestionInput) {
    return adminRepository.createQuestion(input);
  },

  async listCourses(): Promise<CourseDetail[]> {
    const rows = await adminRepository.listCourses();
    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      mentorName: c.mentor?.user.fullName ?? null,
      skillName: c.skill?.name ?? null,
      thumbnailUrl: c.thumbnailUrl,
      durationMinutes: c.durationMinutes,
      lessonCount: c.lessons.length,
      progressPercent: 0,
      isEnrolled: false,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        order: l.order,
        title: l.title,
        h5pContentPath: l.h5pContentPath,
        durationMinutes: l.durationMinutes,
        status: "not_started" as const,
        interactiveConfig: (l.interactiveConfig as any) ?? null,
      })),
    }));
  },

  async updateCourse(courseId: string, input: MentorUpdateCourseInput) {
    return adminRepository.updateCourse(courseId, {
      title: input.title,
      description: input.description,
      skillId: input.skillId,
      durationMinutes: input.durationMinutes,
      lessons: input.lessons,
    });
  },
};
