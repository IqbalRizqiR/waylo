import type {Career, CareerDetailWithGap, SkillLevel} from "@waylo/shared";
import {prisma} from "../../lib/prisma";
import {HttpError} from "../../lib/http";

const LEVEL_RANK: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export const careerRepository = {
  listAll() {
    return prisma.career.findMany({orderBy: {title: "asc"}});
  },
  findByIdWithRequirements(id: string) {
    return prisma.career.findUnique({
      where: {id},
      include: {
        requirements: {
          include: {skill: true},
          orderBy: {skill: {name: "asc"}},
        },
      },
    });
  },
  findUserSkills(userId: string) {
    return prisma.userSkill.findMany({
      where: {userId},
      include: {skill: true},
    });
  },
};

export const careerService = {
  async list(): Promise<Career[]> {
    const rows = await careerRepository.listAll();
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
    }));
  },

  async getDetail(id: string, userId?: string): Promise<CareerDetailWithGap> {
    const career = await careerRepository.findByIdWithRequirements(id);
    if (!career) {
      throw HttpError.notFound("Karier tidak ditemukan.", "career_not_found");
    }

    const userSkills = userId
      ? await careerRepository.findUserSkills(userId)
      : [];
    const userSkillMap = new Map(
      userSkills.map((us) => [us.skillId, us]),
    );

    let metCount = 0;
    const skillGap = career.requirements.map((req) => {
      const userSkill = userSkillMap.get(req.skillId);
      const reqLevel = req.requiredLevel as SkillLevel;
      const curLevel = (userSkill?.level as SkillLevel) ?? null;
      const isMet = curLevel !== null && LEVEL_RANK[curLevel] >= LEVEL_RANK[reqLevel];
      if (isMet) metCount++;

      return {
        skill: {
          id: req.skill.id,
          slug: req.skill.slug,
          name: req.skill.name,
          category: req.skill.category,
        },
        requiredLevel: reqLevel,
        currentLevel: curLevel,
        isVerified: userSkill?.isVerified ?? false,
      };
    });

    const totalReqs = career.requirements.length;
    const matchPercent = totalReqs > 0 ? Math.round((metCount / totalReqs) * 100) : 0;

    return {
      id: career.id,
      slug: career.slug,
      title: career.title,
      summary: career.summary,
      requirements: skillGap.map((r) => ({
        skill: r.skill,
        requiredLevel: r.requiredLevel,
      })),
      skillGap,
      matchPercent,
    };
  },
};
