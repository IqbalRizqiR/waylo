import type {Skill} from "@waylo/shared";
import {prisma} from "../../lib/prisma";

export const skillRepository = {
  listAll() {
    return prisma.skill.findMany({orderBy: {name: "asc"}});
  },
};

export const skillService = {
  async list(): Promise<Skill[]> {
    const rows = await skillRepository.listAll();
    return rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      category: s.category,
    }));
  },
};
