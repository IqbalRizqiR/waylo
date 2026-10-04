import type {SeedContext} from "./types";

const PLAN_DEFS = [
  {
    code: "free_trial" as const,
    name: "Free Trial",
    priceAmount: 0,
    billingPeriod: "trial",
    features: [
      "Basic recruitment dan general screening otomatis",
      "Akses database kandidat terbatas",
      "Tanpa akses mentor partner",
    ],
    isRecommended: false,
  },
  {
    code: "premium" as const,
    name: "Premium",
    priceAmount: 2_500_000,
    billingPeriod: "monthly",
    features: [
      "Lowongan tak terbatas",
      "Premium Recruitment dengan screening mentor ahli",
      "Skill assessment dan mentor review tiap kandidat",
      "Akses penuh mentor partner program",
      "Dukungan prioritas",
    ],
    isRecommended: true,
  },
];

export async function seedBilling(
  {prisma}: SeedContext,
  companyId: string,
): Promise<void> {
  for (const def of PLAN_DEFS) {
    await prisma.plan.upsert({
      where: {code: def.code},
      update: {},
      create: def,
    });
  }

  const existing = await prisma.subscription.findFirst({where: {companyId}});
  if (!existing) {
    await prisma.subscription.create({
      data: {
        companyId,
        planCode: "premium",
        status: "active",
        currentPeriodEndsAt: new Date("2026-10-29"),
      },
    });
  }
}
