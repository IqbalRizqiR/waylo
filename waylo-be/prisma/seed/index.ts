import bcrypt from "bcryptjs";
import {PrismaClient} from "@prisma/client";
import type {SeedContext} from "./types";
import {seedSkills} from "./skills";
import {seedCareers} from "./careers";
import {
  seedAssessments,
  seedCertificates,
  seedLearnerSkills,
  seedRoadmap,
  seedUsers,
} from "./users";
import {seedJobsAndApplications} from "./jobs";
import {seedBilling} from "./billing";
import {seedLearning} from "./learning";

const prisma = new PrismaClient();

// Demo dataset. Every number rendered in the UI comes from this seed so the
// interface never shows invented production statistics (see DESIGN.md).
async function main() {
  console.info("Seeding Waylo demo data...");

  const context: SeedContext = {
    prisma,
    passwordHash: await bcrypt.hash("Password123", 10),
  };

  const skills = await seedSkills(context);
  const careers = await seedCareers(context, skills);
  const {learner, company} = await seedUsers(context);

  await seedLearnerSkills(context, learner.userId, skills);
  await seedRoadmap(context, learner.userId, careers);
  await seedAssessments(context);
  await seedCertificates(context, learner.userId);
  await seedJobsAndApplications(context, company.companyId, skills);
  await seedBilling(context, company.companyId);
  await seedLearning(context, skills);

  console.info("Seed complete. Demo login: hrd@nusadigital.test / Password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
