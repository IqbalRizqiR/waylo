import type {SkillLevel} from "@prisma/client";
import type {CareerMap, SeedContext, SkillMap} from "./types";

export type SeededCompany = {companyId: string; ownerId: string};
export type SeededLearner = {userId: string};

const MENTOR_DEFS = [
  {email: "sarah.mentor@waylo.test", fullName: "Sarah Wijaya", initials: "SW", headline: "Senior Front-End Developer", rating: 4.9, reviewCount: 120},
  {email: "budi.mentor@waylo.test", fullName: "Budi Santoso", initials: "BS", headline: "Tech Lead", rating: 4.8, reviewCount: 96},
  {email: "maya.mentor@waylo.test", fullName: "Maya Putri", initials: "MP", headline: "UI/UX Designer", rating: 4.9, reviewCount: 79},
];

export async function seedUsers(
  {prisma, passwordHash}: SeedContext,
): Promise<{learner: SeededLearner; company: SeededCompany}> {
  const learner = await prisma.user.upsert({
    where: {email: "kalandra@waylo.test"},
    update: {},
    create: {
      email: "kalandra@waylo.test",
      passwordHash,
      fullName: "Kalandra Putra",
      role: "learner",
      avatarInitials: "KP",
      learnerProfile: {
        create: {headline: "Aspiring Front-End Developer", location: "Jakarta, Indonesia"},
      },
    },
  });

  const owner = await prisma.user.upsert({
    where: {email: "hrd@nusadigital.test"},
    update: {},
    create: {
      email: "hrd@nusadigital.test",
      passwordHash,
      fullName: "Nadia Utami",
      role: "company_member",
      avatarInitials: "NU",
    },
  });

  const company = await prisma.company.upsert({
    where: {slug: "pt-nusa-digital"},
    update: {},
    create: {name: "PT Nusa Digital", slug: "pt-nusa-digital"},
  });

  await prisma.companyMember.upsert({
    where: {userId_companyId: {userId: owner.id, companyId: company.id}},
    update: {},
    create: {userId: owner.id, companyId: company.id, subRole: "owner"},
  });

  for (const def of MENTOR_DEFS) {
    const mentorUser = await prisma.user.upsert({
      where: {email: def.email},
      update: {},
      create: {
        email: def.email,
        passwordHash,
        fullName: def.fullName,
        role: "mentor",
        avatarInitials: def.initials,
      },
    });
    await prisma.mentorProfile.upsert({
      where: {userId: mentorUser.id},
      update: {headline: def.headline, rating: def.rating, reviewCount: def.reviewCount},
      create: {
        userId: mentorUser.id,
        headline: def.headline,
        rating: def.rating,
        reviewCount: def.reviewCount,
      },
    });
  }

  await prisma.user.upsert({
    where: {email: "admin@waylo.test"},
    update: {},
    create: {
      email: "admin@waylo.test",
      passwordHash,
      fullName: "Waylo Administrator",
      role: "admin",
      avatarInitials: "AD",
    },
  });

  return {
    learner: {userId: learner.id},
    company: {companyId: company.id, ownerId: owner.id},
  };
}

export async function seedLearnerSkills(
  {prisma}: SeedContext,
  userId: string,
  skills: SkillMap,
): Promise<void> {
  const levels: {slug: string; level: SkillLevel; verified: boolean}[] = [
    {slug: "html-css", level: "advanced", verified: true},
    {slug: "javascript", level: "intermediate", verified: false},
    {slug: "react", level: "beginner", verified: false},
  ];

  for (const item of levels) {
    const skillId = skills.get(item.slug)!;
    await prisma.userSkill.upsert({
      where: {userId_skillId: {userId, skillId}},
      update: {level: item.level, isVerified: item.verified},
      create: {
        userId,
        skillId,
        level: item.level,
        isVerified: item.verified,
        sourceType: item.verified ? "assessment" : null,
      },
    });
  }
}

const MODULE_DEFS = [
  {order: 1, title: "HTML Dasar", summary: "Memahami struktur dasar HTML", status: "completed"},
  {order: 2, title: "CSS Fundamental", summary: "Mempelajari tampilan dasar dengan CSS", status: "completed"},
  {order: 3, title: "JavaScript Fundamentals", summary: "Dasar-dasar JavaScript untuk interaktivitas web", status: "in_progress"},
  {order: 4, title: "Responsive Web Design", summary: "Membuat website yang responsif di semua perangkat", status: "not_started"},
  {order: 5, title: "JavaScript DOM", summary: "Manipulasi elemen HTML dengan JavaScript", status: "not_started"},
] as const;

export async function seedRoadmap(
  {prisma}: SeedContext,
  userId: string,
  careers: CareerMap,
): Promise<void> {
  const careerId = careers.get("front-end-developer")!;
  const existing = await prisma.roadmap.findFirst({where: {userId, careerId}});
  const roadmap =
    existing ??
    (await prisma.roadmap.create({
      data: {
        userId,
        careerId,
        trackTitle: "Web Development",
        progressPercent: 65,
      },
    }));

  for (const mod of MODULE_DEFS) {
    const found = await prisma.roadmapItem.findFirst({
      where: {roadmapId: roadmap.id, order: mod.order},
    });
    if (!found) {
      await prisma.roadmapItem.create({
        data: {
          roadmapId: roadmap.id,
          order: mod.order,
          title: mod.title,
          summary: mod.summary,
          status: mod.status,
        },
      });
    }
  }
}

const ASSESSMENT_DEFS = [
  {type: "career_interest", title: "Asesmen Minat Karier", description: "Temukan bidang yang paling sesuai dengan minatmu.", durationMinutes: 20, questionCount: 25},
  {type: "learning_style", title: "Asesmen Gaya Belajar", description: "Kenali gaya belajar yang efektif untukmu.", durationMinutes: 15, questionCount: 20},
  {type: "personality", title: "Asesmen Kepribadian", description: "Pahami kepribadian dan cara kamu bekerja.", durationMinutes: 25, questionCount: 30},
  {type: "skill_basic", title: "Asesmen Skill Dasar", description: "Uji kemampuan dasar dalam berbagai bidang.", durationMinutes: 30, questionCount: 40},
] as const;

export async function seedAssessments({prisma}: SeedContext): Promise<void> {
  for (const def of ASSESSMENT_DEFS) {
    const existing = await prisma.assessment.findFirst({where: {title: def.title}});
    if (!existing) {
      await prisma.assessment.create({data: def});
    }
  }
}

const CERTIFICATE_DEFS = [
  {title: "Microsoft Azure Fundamentals", issuer: "Microsoft", category: "Cloud", status: "obtained", obtainedAt: new Date("2026-08-15")},
  {title: "Google Analytics Individual Qualification", issuer: "Google", category: "Data", status: "obtained", obtainedAt: new Date("2026-08-02")},
  {title: "Responsive Web Design", issuer: "Free Code Camp", category: "Frontend", status: "obtained", obtainedAt: new Date("2026-07-30")},
  {title: "JavaScript Algorithms and Data Structures", issuer: "Free Code Camp", category: "Frontend", status: "available"},
] as const;

export async function seedCertificates(
  {prisma}: SeedContext,
  userId: string,
): Promise<void> {
  for (const def of CERTIFICATE_DEFS) {
    const existing = await prisma.certificate.findFirst({
      where: {userId, title: def.title},
    });
    if (!existing) {
      await prisma.certificate.create({
        data: {
          userId,
          title: def.title,
          issuer: def.issuer,
          category: def.category,
          status: def.status,
          obtainedAt: "obtainedAt" in def ? def.obtainedAt : null,
        },
      });
    }
  }
}
