import {prisma} from "../../lib/prisma";

export const projectRepository = {
  listAll() {
    return prisma.project.findMany({
      include: {
        skill: true,
      },
      orderBy: {order: "asc"},
    });
  },

  findById(id: string) {
    return prisma.project.findUnique({
      where: {id},
      include: {
        skill: true,
      },
    });
  },

  findSubmission(projectId: string, userId: string) {
    return prisma.projectSubmission.findUnique({
      where: {projectId_userId: {projectId, userId}},
    });
  },

  async upsertSubmission(data: {
    projectId: string;
    userId: string;
    repoUrl: string;
    demoUrl?: string | null;
    notes?: string | null;
  }) {
    return prisma.projectSubmission.upsert({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
      update: {
        repoUrl: data.repoUrl,
        demoUrl: data.demoUrl || null,
        notes: data.notes || null,
        status: "submitted",
        submittedAt: new Date(),
      },
      create: {
        projectId: data.projectId,
        userId: data.userId,
        repoUrl: data.repoUrl,
        demoUrl: data.demoUrl || null,
        notes: data.notes || null,
        status: "submitted",
      },
    });
  },
};
