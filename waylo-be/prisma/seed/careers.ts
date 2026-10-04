import type {CareerMap, SeedContext, SkillMap} from "./types";
import {CAREER_DEFS} from "./skills";

export async function seedCareers(
  {prisma}: SeedContext,
  skills: SkillMap,
): Promise<CareerMap> {
  const careers: CareerMap = new Map();

  for (const def of CAREER_DEFS) {
    const career = await prisma.career.upsert({
      where: {slug: def.slug},
      update: {title: def.title, summary: def.summary},
      create: {slug: def.slug, title: def.title, summary: def.summary},
    });
    careers.set(def.slug, career.id);

    for (const req of def.requirements) {
      const skillId = skills.get(req.slug)!;
      await prisma.careerSkillRequirement.upsert({
        where: {careerId_skillId: {careerId: career.id, skillId}},
        update: {requiredLevel: req.level},
        create: {careerId: career.id, skillId, requiredLevel: req.level},
      });
    }
  }

  return careers;
}
