import {prisma} from "../../lib/prisma";
import type {Prisma, SkillLevel} from "@prisma/client";

const jobInclude = {
  company: true,
  skills: {include: {skill: true}},
  _count: {select: {applications: true}},
} satisfies Prisma.JobInclude;

const jobDetailInclude = {
  company: true,
  skills: {include: {skill: true}},
  _count: {select: {applications: true}},
} satisfies Prisma.JobInclude;

export type JobRow = Prisma.JobGetPayload<{include: typeof jobInclude}>;
export type JobDetailRow = Prisma.JobGetPayload<{include: typeof jobDetailInclude}>;

export type JobWriteInput = {
  companyId: string;
  title: string;
  description: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  workMode: "remote" | "hybrid" | "onsite";
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceMinYears: number | null;
  experienceMaxYears: number | null;
  skills: {skillId: string; minLevel: SkillLevel}[];
};

export type JobUpdateInput = Partial<Omit<JobWriteInput, "companyId">>;

export const jobRepository = {
  listByCompany(companyId: string): Promise<JobRow[]> {
    return prisma.job.findMany({
      where: {companyId, status: {not: "archived"}},
      orderBy: {createdAt: "desc"},
      include: jobInclude,
    });
  },

  findById(id: string): Promise<JobDetailRow | null> {
    return prisma.job.findUnique({
      where: {id},
      include: jobDetailInclude,
    });
  },

  create(input: JobWriteInput): Promise<JobDetailRow> {
    return prisma.job.create({
      data: {
        companyId: input.companyId,
        title: input.title,
        description: input.description,
        employmentType: input.employmentType,
        workMode: input.workMode,
        location: input.location,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        experienceMinYears: input.experienceMinYears,
        experienceMaxYears: input.experienceMaxYears,
        status: "draft",
        skills: {
          create: input.skills.map((s) => ({
            skillId: s.skillId,
            minLevel: s.minLevel,
          })),
        },
      },
      include: jobDetailInclude,
    });
  },

  publish(id: string): Promise<JobDetailRow> {
    return prisma.job.update({
      where: {id},
      data: {status: "published"},
      include: jobDetailInclude,
    });
  },

  async update(id: string, input: JobUpdateInput): Promise<JobDetailRow> {
    const {skills, ...fields} = input;

    if (skills) {
      await prisma.jobSkill.deleteMany({where: {jobId: id}});
      await prisma.jobSkill.createMany({
        data: skills.map((s) => ({
          jobId: id,
          skillId: s.skillId,
          minLevel: s.minLevel,
        })),
      });
    }

    return prisma.job.update({
      where: {id},
      data: fields,
      include: jobDetailInclude,
    });
  },
};