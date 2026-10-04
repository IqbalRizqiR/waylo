import type {ApplicationStage} from "@prisma/client";
import type {SeedContext, SkillMap} from "./types";

type CandidateDef = {
  email: string;
  fullName: string;
  initials: string;
  track: "premium" | "free";
  stage: ApplicationStage;
  match: number;
};

const CANDIDATE_DEFS: CandidateDef[] = [
  {email: "sarah@waylo.test", fullName: "Sarah Wijaya", initials: "SW", track: "premium", stage: "shortlisted", match: 92},
  {email: "bagas@waylo.test", fullName: "Bagas Wicaksono", initials: "BW", track: "premium", stage: "mentor_review", match: 85},
  {email: "dewi@waylo.test", fullName: "Dewi Puspita", initials: "DP", track: "premium", stage: "skill_assessment", match: 78},
  {email: "siti@waylo.test", fullName: "Siti Nurhaliza", initials: "SN", track: "free", stage: "applied", match: 70},
];

const JOB_SKILL_SLUGS = ["html-css", "javascript", "react"];

export async function seedJobsAndApplications(
  {prisma, passwordHash}: SeedContext,
  companyId: string,
  skills: SkillMap,
): Promise<void> {
  const existingJob = await prisma.job.findFirst({
    where: {companyId, title: "Front-End Developer"},
  });

  const job =
    existingJob ??
    (await prisma.job.create({
      data: {
        companyId,
        title: "Front-End Developer",
        description:
          "Kami mencari Front-End Developer untuk membangun antarmuka web yang responsif dan interaktif, berkolaborasi dengan tim desain dan backend.",
        employmentType: "full_time",
        workMode: "hybrid",
        location: "Jakarta",
        salaryMin: 8_000_000,
        salaryMax: 12_000_000,
        experienceMinYears: 1,
        experienceMaxYears: 3,
        status: "published",
        isPremium: true,
      },
    }));

  for (const slug of JOB_SKILL_SLUGS) {
    const skillId = skills.get(slug)!;
    await prisma.jobSkill.upsert({
      where: {jobId_skillId: {jobId: job.id, skillId}},
      update: {},
      create: {jobId: job.id, skillId, minLevel: "intermediate"},
    });
  }

  for (const def of CANDIDATE_DEFS) {
    const candidate = await prisma.user.upsert({
      where: {email: def.email},
      update: {},
      create: {
        email: def.email,
        passwordHash,
        fullName: def.fullName,
        role: "learner",
        avatarInitials: def.initials,
        learnerProfile: {create: {}},
      },
    });

    const existing = await prisma.application.findUnique({
      where: {jobId_candidateId: {jobId: job.id, candidateId: candidate.id}},
    });
    if (!existing) {
      await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          track: def.track,
          stage: def.stage,
          skillMatchPercent: def.match,
          stageHistory: {create: {stage: "applied", actor: def.fullName}},
        },
      });
    }
  }
}
