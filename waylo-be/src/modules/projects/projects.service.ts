import type {Project, ProjectSubmission, SubmitProjectInput} from "@waylo/shared";
import {projectRepository} from "./projects.repository";
import {HttpError} from "../../lib/http";

export const projectService = {
  async list(userId?: string): Promise<Project[]> {
    const rows = await projectRepository.listAll();
    return Promise.all(
      rows.map(async (p) => {
        let mySubmission: ProjectSubmission | null = null;
        if (userId) {
          const sub = await projectRepository.findSubmission(p.id, userId);
          if (sub) {
            mySubmission = {
              id: sub.id,
              projectId: sub.projectId,
              userId: sub.userId,
              repoUrl: sub.repoUrl,
              demoUrl: sub.demoUrl,
              notes: sub.notes,
              status: sub.status as any,
              feedback: sub.feedback,
              submittedAt: sub.submittedAt.toISOString(),
              reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
            };
          }
        }

        return {
          id: p.id,
          title: p.title,
          description: p.description,
          brief: p.brief,
          starterRepoUrl: p.starterRepoUrl,
          skillId: p.skillId,
          skillName: p.skill?.name ?? null,
          difficulty: p.difficulty as any,
          order: p.order,
          mySubmission,
        };
      }),
    );
  },

  async getDetail(id: string, userId?: string): Promise<Project> {
    const p = await projectRepository.findById(id);
    if (!p) {
      throw HttpError.notFound("Proyek tidak ditemukan.", "project_not_found");
    }

    let mySubmission: ProjectSubmission | null = null;
    if (userId) {
      const sub = await projectRepository.findSubmission(p.id, userId);
      if (sub) {
        mySubmission = {
          id: sub.id,
          projectId: sub.projectId,
          userId: sub.userId,
          repoUrl: sub.repoUrl,
          demoUrl: sub.demoUrl,
          notes: sub.notes,
          status: sub.status as any,
          feedback: sub.feedback,
          submittedAt: sub.submittedAt.toISOString(),
          reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
        };
      }
    }

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      brief: p.brief,
      starterRepoUrl: p.starterRepoUrl,
      skillId: p.skillId,
      skillName: p.skill?.name ?? null,
      difficulty: p.difficulty as any,
      order: p.order,
      mySubmission,
    };
  },

  async submit(
    projectId: string,
    userId: string,
    input: SubmitProjectInput,
  ): Promise<ProjectSubmission> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw HttpError.notFound("Proyek tidak ditemukan.", "project_not_found");
    }

    const sub = await projectRepository.upsertSubmission({
      projectId,
      userId,
      repoUrl: input.repoUrl,
      demoUrl: input.demoUrl || null,
      notes: input.notes || null,
    });

    return {
      id: sub.id,
      projectId: sub.projectId,
      userId: sub.userId,
      repoUrl: sub.repoUrl,
      demoUrl: sub.demoUrl,
      notes: sub.notes,
      status: sub.status as any,
      feedback: sub.feedback,
      submittedAt: sub.submittedAt.toISOString(),
      reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
    };
  },
};
