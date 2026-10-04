import type {SkillLevel} from "@prisma/client";
import type {SeedContext, SkillMap} from "./types";

type SkillDef = {slug: string; name: string; category: string};

export const SKILL_DEFS: SkillDef[] = [
  {slug: "html-css", name: "HTML/CSS", category: "Frontend"},
  {slug: "javascript", name: "JavaScript", category: "Frontend"},
  {slug: "react", name: "React.js", category: "Frontend"},
  {slug: "typescript", name: "TypeScript", category: "Frontend"},
  {slug: "tailwind", name: "TailwindCSS", category: "Frontend"},
  {slug: "git", name: "Git & GitHub", category: "Tools"},
  {slug: "figma", name: "Figma", category: "Design"},
  {slug: "user-research", name: "User Research", category: "Design"},
  {slug: "python", name: "Python", category: "Backend"},
  {slug: "sql", name: "SQL", category: "Data"},
];

type CareerDef = {
  slug: string;
  title: string;
  summary: string;
  requirements: {slug: string; level: SkillLevel}[];
};

export const CAREER_DEFS: CareerDef[] = [
  {
    slug: "front-end-developer",
    title: "Front-End Developer",
    summary: "Membangun antarmuka web yang interaktif dan responsif untuk pengguna.",
    requirements: [
      {slug: "html-css", level: "advanced"},
      {slug: "javascript", level: "advanced"},
      {slug: "react", level: "intermediate"},
      {slug: "tailwind", level: "intermediate"},
      {slug: "git", level: "intermediate"},
    ],
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    summary: "Merancang pengalaman dan tampilan produk yang mudah digunakan.",
    requirements: [
      {slug: "figma", level: "advanced"},
      {slug: "user-research", level: "intermediate"},
    ],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    summary: "Mengolah data menjadi wawasan untuk keputusan bisnis.",
    requirements: [
      {slug: "python", level: "intermediate"},
      {slug: "sql", level: "advanced"},
    ],
  },
];

export async function seedSkills({prisma}: SeedContext): Promise<SkillMap> {
  const skills: SkillMap = new Map();
  for (const def of SKILL_DEFS) {
    const skill = await prisma.skill.upsert({
      where: {slug: def.slug},
      update: {name: def.name, category: def.category},
      create: def,
    });
    skills.set(def.slug, skill.id);
  }
  return skills;
}
