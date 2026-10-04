import type {
  MentorCreateCourseInput,
  MentorDashboard,
  MentorReviewQueueItem,
  MentorUpdateCourseInput,
  SubmitMentorReviewInput,
  UpdateMentorProfileInput,
} from "@waylo/shared";
import {mentorRepository} from "./mentor.repository";
import {HttpError} from "../../lib/http";

export const mentorService = {
  async getMentorProfile(userId: string) {
    const profile = await mentorRepository.findProfileByUserId(userId);
    if (!profile) {
      throw HttpError.notFound("Profil mentor tidak ditemukan.", "mentor_not_found");
    }
    return profile;
  },

  async dashboard(userId: string): Promise<MentorDashboard> {
    const profile = await this.getMentorProfile(userId);
    const stats = await mentorRepository.getDashboardStats(profile.id);
    const sessions = await mentorRepository.listNextSessions(profile.id);
    const [appReviews, projectReviews] = await mentorRepository.listPendingReviews();

    const pendingReviews: MentorReviewQueueItem[] = [
      ...appReviews.map((a) => ({
        id: a.id,
        type: "candidate_screening" as const,
        title: `Screening Kandidat: ${a.job.title}`,
        candidateName: a.candidate.fullName,
        submittedAt: a.updatedAt.toISOString(),
        details: `Jalur ${a.track} • Posisi ${a.job.title}`,
        targetRole: a.job.title,
        referenceId: a.id,
      })),
      ...projectReviews.map((p) => ({
        id: p.id,
        type: "project_submission" as const,
        title: `Review Proyek: ${p.project.title}`,
        candidateName: p.user.fullName,
        submittedAt: p.submittedAt.toISOString(),
        details: `Repo: ${p.repoUrl}`,
        targetRole: p.project.title,
        referenceId: p.id,
      })),
    ];

    return {
      mentorName: profile.user.fullName,
      headline: profile.headline,
      stats: {
        ...stats,
        rating: profile.rating ? Number(profile.rating) : null,
        reviewCount: profile.reviewCount,
      },
      nextSessions: sessions.map((s) => ({
        id: s.id,
        mentorName: profile.user.fullName,
        topic: s.topic,
        startsAt: s.startsAt.toISOString(),
        status: s.status === "scheduled" ? "upcoming" : (s.status as any),
        meetingUrl: s.meetingUrl,
      })),
      pendingReviews,
    };
  },

  async listReviews(userId: string): Promise<MentorReviewQueueItem[]> {
    await this.getMentorProfile(userId);
    const [appReviews, projectReviews] = await mentorRepository.listPendingReviews();

    return [
      ...appReviews.map((a) => ({
        id: a.id,
        type: "candidate_screening" as const,
        title: `Screening Kandidat: ${a.job.title}`,
        candidateName: a.candidate.fullName,
        submittedAt: a.updatedAt.toISOString(),
        details: `Jalur ${a.track} • Posisi ${a.job.title}`,
        targetRole: a.job.title,
        referenceId: a.id,
      })),
      ...projectReviews.map((p) => ({
        id: p.id,
        type: "project_submission" as const,
        title: `Review Proyek: ${p.project.title}`,
        candidateName: p.user.fullName,
        submittedAt: p.submittedAt.toISOString(),
        details: `Repo: ${p.repoUrl}`,
        targetRole: p.project.title,
        referenceId: p.id,
      })),
    ];
  },

  async submitReview(
    userId: string,
    referenceId: string,
    type: "candidate_screening" | "project_submission",
    input: SubmitMentorReviewInput,
  ) {
    const profile = await this.getMentorProfile(userId);
    return mentorRepository.createReview({
      mentorId: profile.id,
      referenceId,
      type,
      score: input.score,
      verdict: input.verdict,
      technicalFeedback: input.technicalFeedback,
    });
  },

  async createCourse(userId: string, input: MentorCreateCourseInput) {
    const profile = await this.getMentorProfile(userId);
    return mentorRepository.createCourse({
      mentorId: profile.id,
      title: input.title,
      description: input.description,
      skillId: input.skillId,
      durationMinutes: input.durationMinutes,
      lessons: input.lessons,
    });
  },

  async updateCourse(
    userId: string,
    courseId: string,
    input: MentorUpdateCourseInput,
  ) {
    const profile = await this.getMentorProfile(userId);
    return mentorRepository.updateCourse(profile.id, courseId, {
      title: input.title,
      description: input.description,
      skillId: input.skillId,
      durationMinutes: input.durationMinutes,
      lessons: input.lessons,
    });
  },

  async getProfile(userId: string) {
    const profile = await this.getMentorProfile(userId);
    return {
      id: profile.id,
      fullName: profile.user.fullName,
      email: profile.user.email,
      headline: profile.headline,
      bio: profile.bio ?? "",
      hourlyRate: profile.hourlyRate,
      expertise: profile.expertise,
      rating: profile.rating ? Number(profile.rating) : null,
      reviewCount: profile.reviewCount,
    };
  },

  async updateProfile(userId: string, input: UpdateMentorProfileInput) {
    const profile = await this.getMentorProfile(userId);
    const updated = await mentorRepository.updateProfile(profile.id, input);
    return {
      id: updated.id,
      fullName: profile.user.fullName,
      email: profile.user.email,
      headline: updated.headline,
      bio: updated.bio ?? "",
      hourlyRate: updated.hourlyRate,
      expertise: updated.expertise,
      rating: updated.rating ? Number(updated.rating) : null,
      reviewCount: updated.reviewCount,
    };
  },
};
