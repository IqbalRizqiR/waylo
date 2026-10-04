import type {PrismaClient} from "@prisma/client";

export type SeedContext = {
  prisma: PrismaClient;
  passwordHash: string;
};

export type SkillMap = Map<string, string>;
export type CareerMap = Map<string, string>;
