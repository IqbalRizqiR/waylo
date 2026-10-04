import type {
  Assessment,
  AssessmentDetail,
  AssessmentGradedResult,
  AssessmentResult,
  BookSessionInput,
  Certificate,
  LearnerDashboard,
  LearnerProfile,
  Mentor,
  MentorDetail,
  MentoringSession,
  Question,
  QuestionOption,
  QuestionType,
  Roadmap,
  RoadmapItemDetail,
  RoadmapModuleStatus,
  SkillLevel,
  SubmitAssessmentInput,
  UpdateLearnerProfileInput,
  CompleteOnboardingInput,
  GetRecommendationsInput,
  OnboardingQuestion,
  OnboardingRecommendation,
  AggregateSkillGap,
  GapSeverity,
  RecommendedAction,
  SkillGapActionItem,
  SkillGapRadarPoint,
} from "@waylo/shared";
import {HttpError} from "../../lib/http";
import {learnerRepository} from "./learner.repository";
import {
  DEMO_EVENTS,
  DEMO_LEARNING_HOURS,
  DEMO_RECOMMENDATIONS,
  DEMO_ROADMAP_REWARDS,
  DEMO_TASKS,
} from "../../fixtures/learner-demo";

// Read-only projections for the learner hub. No Prisma access here; all data
// comes from the repository. Demo placeholders come from fixtures.

export const learnerService = {
  async dashboard(userId: string): Promise<LearnerDashboard> {
    const user = await learnerRepository.findDashboardUser(userId);
    const roadmap = user?.roadmaps[0];
    const firstName = (user?.fullName ?? "Learner").split(" ")[0];
    const obtainedCertificates =
      user?.certificates.filter((c) => c.status === "obtained") ?? [];
    const inProgressModule = roadmap?.modules.find((m) => m.status === "in_progress");

    return {
      greetingName: firstName,
      progressPercent: roadmap?.progressPercent ?? 0,
      certificateCount: obtainedCertificates.length,
      learningHours: DEMO_LEARNING_HOURS,
      nextLessonTitle: inProgressModule?.title ?? null,
      currentTrack: {
        title: roadmap?.trackTitle ?? "-",
        careerTitle: roadmap?.career.title ?? "-",
        progressPercent: roadmap?.progressPercent ?? 0,
      },
      recommendations: DEMO_RECOMMENDATIONS,
      tasks: DEMO_TASKS,
      events: DEMO_EVENTS,
    };
  },

  async roadmap(userId: string): Promise<Roadmap | null> {
    const roadmap = await learnerRepository.findRoadmap(userId);
    if (!roadmap) {
      return null;
    }

    const countBy = (status: string) =>
      roadmap.modules.filter((m) => m.status === status).length;

    return {
      id: roadmap.id,
      trackTitle: roadmap.trackTitle,
      progressPercent: roadmap.progressPercent,
      stats: {
        totalModules: roadmap.modules.length,
        completed: countBy("completed"),
        inProgress: countBy("in_progress"),
        notStarted: countBy("not_started"),
      },
      modules: roadmap.modules.map((m) => ({
        id: m.id,
        order: m.order,
        title: m.title,
        summary: m.summary,
        status: m.status,
      })),
      rewards: DEMO_ROADMAP_REWARDS,
    };
  },

  async assessments(): Promise<Assessment[]> {
    const rows = await learnerRepository.listAssessments();
    return rows.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      durationMinutes: a.durationMinutes,
      questionCount: a.questionCount,
    }));
  },

  async getAssessmentDetail(id: string): Promise<AssessmentDetail> {
    const row = await learnerRepository.findAssessmentWithQuestions(id);
    if (!row) {
      throw HttpError.notFound("Asesmen tidak ditemukan.", "assessment_not_found");
    }

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      durationMinutes: row.durationMinutes,
      questionCount: row.questions.length || row.questionCount,
      questions: row.questions.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.type as QuestionType,
        prompt: q.prompt,
        options: (q.options as unknown as QuestionOption[]) ?? null,
        points: q.points,
      })),
    };
  },

  async submitAssessment(
    id: string,
    userId: string,
    input: SubmitAssessmentInput,
  ): Promise<AssessmentGradedResult> {
    const assessment = await learnerRepository.findAssessmentWithQuestions(id);
    if (!assessment) {
      throw HttpError.notFound("Asesmen tidak ditemukan.", "assessment_not_found");
    }

    const answerMap = new Map(
      input.answers.map((a) => [a.questionId, a.answer]),
    );

    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;

    for (const q of assessment.questions) {
      totalPoints += q.points;
      const userAnswer = answerMap.get(q.id);
      const correctAnswer = q.correctAnswer;

      let isCorrect = false;

      if (q.type === "multiple_choice" || q.type === "true_false" || q.type === "short_answer") {
        if (typeof userAnswer === "string" && typeof correctAnswer === "string") {
          isCorrect =
            userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        }
      } else if (q.type === "multiple_select") {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSet = new Set(userAnswer.map((s) => String(s).trim().toLowerCase()));
          const correctSet = new Set(correctAnswer.map((s) => String(s).trim().toLowerCase()));
          if (userSet.size === correctSet.size) {
            isCorrect = [...userSet].every((val) => correctSet.has(val));
          }
        }
      } else if (q.type === "ordering") {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          isCorrect =
            userAnswer.length === correctAnswer.length &&
            userAnswer.every((val, idx) => String(val) === String(correctAnswer[idx]));
        }
      }

      if (isCorrect) {
        earnedPoints += q.points;
        correctCount++;
      }
    }

    const scorePercent =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= 70;

    // Create attempt record
    await learnerRepository.createAttempt({
      assessmentId: id,
      userId,
      answers: input.answers,
      scorePercent,
      label: `${assessment.title} - ${scorePercent}%`,
      completedAt: new Date(),
    });

    // Auto-verify skill if passed and type is skill_basic
    let verifiedSkill: string | null = null;
    if (passed && assessment.type === "skill_basic") {
      const htmlSkill = await learnerRepository.findSkillBySlug("html-css");
      if (htmlSkill) {
        await learnerRepository.upsertUserSkill(userId, htmlSkill.id, "intermediate", true);
        verifiedSkill = htmlSkill.name;
      }
    }

    return {
      scorePercent,
      passed,
      totalQuestions: assessment.questions.length,
      correctCount,
      verifiedSkill,
    };
  },

  async assessmentResults(userId: string): Promise<AssessmentResult[]> {
    const rows = await learnerRepository.listCompletedAttempts(userId);
    return rows.map((r) => ({
      id: r.id,
      assessmentId: r.assessmentId,
      label: r.label ?? r.assessment.title,
      scorePercent: r.scorePercent ?? 0,
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    }));
  },

  async mentors(): Promise<Mentor[]> {
    const rows = await learnerRepository.listMentors();
    return rows.map((m) => ({
      id: m.id,
      fullName: m.user.fullName,
      headline: m.headline,
      avatarInitials: m.user.avatarInitials,
      rating: m.rating ? Number(m.rating) : null,
      reviewCount: m.reviewCount,
      skills: [],
    }));
  },

  async getMentorDetail(id: string): Promise<MentorDetail> {
    const m = await learnerRepository.findMentorWithAvailability(id);
    if (!m) {
      throw HttpError.notFound("Mentor tidak ditemukan.", "mentor_not_found");
    }

    return {
      id: m.id,
      fullName: m.user.fullName,
      headline: m.headline,
      avatarInitials: m.user.avatarInitials,
      rating: m.rating ? Number(m.rating) : null,
      reviewCount: m.reviewCount,
      skills: ["Frontend", "React", "TypeScript", "Career Advice"],
      bio: `${m.headline} dengan pengalaman membimbing lebih dari ${m.reviewCount} sesi mentoring. Siap membantu persiapan kariermu di industri teknologi.`,
      availability: m.availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    };
  },

  async bookSession(
    mentorId: string,
    learnerId: string,
    input: BookSessionInput,
  ): Promise<MentoringSession> {
    const mentor = await learnerRepository.findMentorWithAvailability(mentorId);
    if (!mentor) {
      throw HttpError.notFound("Mentor tidak ditemukan.", "mentor_not_found");
    }

    const session = await learnerRepository.createSession({
      mentorId,
      learnerId,
      topic: input.topic,
      startsAt: new Date(input.startsAt),
      note: input.note,
    });

    return {
      id: session.id,
      mentorName: session.mentor.user.fullName,
      topic: session.topic,
      startsAt: session.startsAt.toISOString(),
      status: "upcoming",
      meetingUrl: session.meetingUrl,
    };
  },

  async listSessions(learnerId: string): Promise<MentoringSession[]> {
    const rows = await learnerRepository.listLearnerSessions(learnerId);
    return rows.map((s) => ({
      id: s.id,
      mentorName: s.mentor.user.fullName,
      topic: s.topic,
      startsAt: s.startsAt.toISOString(),
      status: s.status === "scheduled" ? "upcoming" : (s.status as any),
      meetingUrl: s.meetingUrl,
    }));
  },

  async certificates(userId: string): Promise<Certificate[]> {
    const rows = await learnerRepository.listCertificates(userId);
    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      category: c.category,
      status: c.status,
      obtainedAt: c.obtainedAt ? c.obtainedAt.toISOString() : null,
      verificationUrl: c.verificationUrl,
    }));
  },

  async getCertificateDetail(id: string): Promise<Certificate> {
    const c = await learnerRepository.findCertificate(id);
    if (!c) {
      throw HttpError.notFound("Sertifikat tidak ditemukan.", "certificate_not_found");
    }

    return {
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      category: c.category,
      status: c.status,
      obtainedAt: c.obtainedAt ? c.obtainedAt.toISOString() : null,
      verificationUrl: c.verificationUrl,
    };
  },

  async getSubscription(userId: string) {
    const sub = await learnerRepository.findSubscription(userId);
    if (!sub) {
      return {
        id: "none",
        planCode: "free_trial",
        status: "trial",
        currentPeriodEndsAt: null,
      };
    }

    return {
      id: sub.id,
      planCode: sub.planCode,
      status: sub.status,
      currentPeriodEndsAt: sub.currentPeriodEndsAt
        ? sub.currentPeriodEndsAt.toISOString()
        : null,
    };
  },

  async listPlans() {
    const plans = await learnerRepository.listPlans();
    return plans.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      priceAmount: p.priceAmount,
      priceCurrency: p.priceCurrency,
      billingPeriod: p.billingPeriod,
      features: p.features,
      isRecommended: p.isRecommended,
    }));
  },

  async subscribe(
    userId: string,
    planCode: "free_trial" | "premium",
    idempotencyKey?: string,
  ) {
    return learnerRepository.createSubscription({
      userId,
      planCode,
      idempotencyKey,
    });
  },

  async getProfile(userId: string): Promise<LearnerProfile> {
    const user = await learnerRepository.findLearnerProfile(userId);
    if (!user) {
      throw HttpError.notFound("Profil learner tidak ditemukan.", "profile_not_found");
    }

    const p = user.learnerProfile;

    return {
      id: p?.id ?? user.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarInitials: user.avatarInitials,
      headline: p?.headline ?? "",
      bio: p?.bio ?? "",
      location: p?.location ?? "",
      targetCareerId: p?.targetCareerId ?? null,
      targetCareerTitle: p?.targetCareer?.title ?? null,
      openToWork: p?.openToWork ?? false,
      talentPoolOptIn: p?.talentPoolOptIn ?? false,
      skills: user.userSkills.map((us) => ({
        skill: {
          id: us.skill.id,
          slug: us.skill.slug,
          name: us.skill.name,
          category: us.skill.category,
        },
        level: us.level as SkillLevel,
        isVerified: us.isVerified,
        sourceType: us.sourceType as any,
      })),
      certificates: user.certificates.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        category: c.category,
        status: c.status as any,
        obtainedAt: c.obtainedAt ? c.obtainedAt.toISOString() : null,
        verificationUrl: c.verificationUrl,
      })),
      createdAt: user.createdAt.toISOString(),
    };
  },

  async updateProfile(
    userId: string,
    input: UpdateLearnerProfileInput,
  ): Promise<LearnerProfile> {
    const user = await learnerRepository.findDashboardUser(userId);
    if (!user) {
      throw HttpError.notFound("Pengguna tidak ditemukan.");
    }

    const profileData: any = {};
    if (input.headline !== undefined) profileData.headline = input.headline;
    if (input.bio !== undefined) profileData.bio = input.bio;
    if (input.location !== undefined) profileData.location = input.location;
    if (input.openToWork !== undefined) profileData.openToWork = input.openToWork;
    if (input.talentPoolOptIn !== undefined)
      profileData.talentPoolOptIn = input.talentPoolOptIn;
    if (input.targetCareerId !== undefined) {
      profileData.targetCareer = input.targetCareerId
        ? {connect: {id: input.targetCareerId}}
        : {disconnect: true};
    }

    await learnerRepository.updateLearnerProfile(
      userId,
      profileData,
      input.fullName,
    );

    return this.getProfile(userId);
  },

  async updateRoadmapItem(
    userId: string,
    itemId: string,
    status: RoadmapModuleStatus,
  ): Promise<RoadmapItemDetail> {
    const item = await learnerRepository.findRoadmapItem(itemId);
    if (!item) {
      throw HttpError.notFound("Item roadmap tidak ditemukan.", "item_not_found");
    }
    if (item.roadmap.userId !== userId) {
      throw HttpError.forbidden("Tidak memiliki akses ke item ini.", "forbidden");
    }

    const updated = await learnerRepository.updateRoadmapItemStatus(itemId, status);
    return {
      id: updated.id,
      order: updated.order,
      title: updated.title,
      summary: updated.summary,
      status: updated.status as RoadmapModuleStatus,
      skillName: updated.skill?.name ?? null,
    };
  },

  getOnboardingQuestions(): OnboardingQuestion[] {
    return [
      {
        id: "q1",
        prompt: "Bidang pekerjaan apa yang paling membuatmu bersemangat?",
        options: [
          {key: "a", label: "Membuat tampilan website yang interaktif dan responsif", trait: "frontend"},
          {key: "b", label: "Membangun sistem backend, API, dan mengelola database", trait: "backend"},
          {key: "c", label: "Merancang wireframe, prototype, dan user experience", trait: "ui_ux"},
          {key: "d", label: "Menganalisis data, statistik, dan pola tren bisnis", trait: "data"},
        ],
      },
      {
        id: "q2",
        prompt: "Bagian mana dari aplikasi yang paling ingin kamu kuasai secara mendalam?",
        options: [
          {key: "a", label: "Komponen antarmuka, CSS animasi, dan interaksi pengguna", trait: "frontend"},
          {key: "b", label: "Autentikasi keamanan, optimasi query, dan arsitektur server", trait: "backend"},
          {key: "c", label: "Desain sistem, riset pengguna, dan konsistensi visual", trait: "ui_ux"},
          {key: "d", label: "Dashboard metrik, pipeline ETL, dan machine learning", trait: "data"},
        ],
      },
      {
        id: "q3",
        prompt: "Tipe proyek portofolio impian yang ingin kamu selesaikan:",
        options: [
          {key: "a", label: "Web app SaaS modern dengan Next.js dan Tailwind", trait: "frontend"},
          {key: "b", label: "Restful API berskala tinggi dengan PostgreSQL & Redis", trait: "backend"},
          {key: "c", label: "Studi kasus desain produk komprehensif di Figma", trait: "ui_ux"},
          {key: "d", label: "Model prediksi analitik dengan visualisasi grafik interaktif", trait: "data"},
        ],
      },
      {
        id: "q4",
        prompt: "Apa kekuatan terbesarmu saat menyelesaikan tugas?",
        options: [
          {key: "a", label: "Perhatian terhadap detail estetika dan kenyamanan interaksi", trait: "frontend"},
          {key: "b", label: "Logika pemecahan masalah dan efisiensi algoritma", trait: "backend"},
          {key: "c", label: "Empati terhadap kebutuhan user dan alur berpikir intuitif", trait: "ui_ux"},
          {key: "d", label: "Ketelitian dalam mengolah angka dan menemukan anomali", trait: "data"},
        ],
      },
      {
        id: "q5",
        prompt: "Teknologi yang paling ingin kamu pelajari minggu ini:",
        options: [
          {key: "a", label: "React, TypeScript, dan Tailwind CSS", trait: "frontend"},
          {key: "b", label: "Node.js, Express, dan PostgreSQL", trait: "backend"},
          {key: "c", label: "Figma Design System dan Usability Testing", trait: "ui_ux"},
          {key: "d", label: "Python, Pandas, dan SQL Querying", trait: "data"},
        ],
      },
    ];
  },

  async getOnboardingRecommendations(
    input: GetRecommendationsInput,
  ): Promise<OnboardingRecommendation[]> {
    const questions = this.getOnboardingQuestions();
    const traitScores: Record<string, number> = {
      frontend: 0,
      backend: 0,
      ui_ux: 0,
      data: 0,
    };

    for (const ans of input.answers) {
      const q = questions.find((item) => item.id === ans.questionId);
      const opt = q?.options.find((o) => o.key === ans.optionKey);
      if (opt?.trait) {
        traitScores[opt.trait] = (traitScores[opt.trait] ?? 0) + 1;
      }
    }

    const careers = await learnerRepository.listAllCareersWithRequirements();
    const totalAnswers = Math.max(1, input.answers.length);

    const scored = careers.map((career) => {
      let weight = 0.5;
      const lowerSlug = career.slug.toLowerCase();
      if (lowerSlug.includes("front") || lowerSlug.includes("web")) {
        weight = (traitScores.frontend ?? 0) / totalAnswers;
      } else if (lowerSlug.includes("back") || lowerSlug.includes("devops")) {
        weight = (traitScores.backend ?? 0) / totalAnswers;
      } else if (lowerSlug.includes("design") || lowerSlug.includes("ui")) {
        weight = (traitScores.ui_ux ?? 0) / totalAnswers;
      } else if (lowerSlug.includes("data") || lowerSlug.includes("analyst")) {
        weight = (traitScores.data ?? 0) / totalAnswers;
      }

      // Match percent between 65% and 98%
      const matchPercent = Math.min(98, Math.max(65, Math.round(weight * 50 + 48)));

      return {
        careerId: career.id,
        title: career.title,
        summary: career.summary,
        matchPercent,
        keySkills: career.requirements.slice(0, 4).map((r) => r.skill.name),
      };
    });

    return scored.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 3);
  },

  async completeOnboarding(
    userId: string,
    input: CompleteOnboardingInput,
  ): Promise<{roadmapId: string; trackTitle: string}> {
    const career = await learnerRepository.findCareerForOnboarding(input.careerId);

    if (!career) {
      throw HttpError.notFound("Karier yang dipilih tidak valid.", "invalid_career");
    }

    const modules = career.requirements.map((req: {skill: {name: string}; skillId: string}, idx: number) => ({
      order: idx + 1,
      title: `${req.skill.name} Fundamental`,
      summary: `Penguasaan materi dasar dan praktik terbaik untuk ${req.skill.name}`,
      skillId: req.skillId,
    }));

    const skills = career.requirements.map((req: {skillId: string}) => ({
      skillId: req.skillId,
      level: input.experienceLevel,
    }));

    const roadmap = await learnerRepository.completeOnboarding({
      userId,
      careerId: career.id,
      careerTitle: career.title,
      skills,
      modules,
    });

    return {
      roadmapId: roadmap.id,
      trackTitle: roadmap.trackTitle,
    };
  },

  async skillGap(userId: string): Promise<AggregateSkillGap> {
    const LEVEL_MAP: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };

    // Find user target career or first roadmap career
    const user = await learnerRepository.findLearnerProfile(userId);
    let targetCareerId = user?.learnerProfile?.targetCareerId;

    if (!targetCareerId) {
      const roadmaps = await learnerRepository.findDashboardUser(userId);
      targetCareerId = roadmaps?.roadmaps[0]?.careerId;
    }

    const allCareers = await learnerRepository.listAllCareersWithRequirements();
    const career =
      allCareers.find((c) => c.id === targetCareerId) ?? allCareers[0];

    if (!career) {
      return {
        targetCareer: null,
        overallMatchPercent: 0,
        radarData: [],
        actions: [],
        stats: {
          totalRequired: 0,
          verifiedCount: 0,
          inProgressCount: 0,
          missingCount: 0,
        },
      };
    }

    const userSkills = user?.userSkills ?? [];
    const userSkillMap = new Map(
      userSkills.map((us) => [us.skillId, us]),
    );

    let verifiedCount = 0;
    let inProgressCount = 0;
    let missingCount = 0;
    let totalScore = 0;
    const maxScore = career.requirements.length * 4;

    const actions: SkillGapActionItem[] = [];
    const radarData: SkillGapRadarPoint[] = [];

    for (const req of career.requirements) {
      const uSkill = userSkillMap.get(req.skillId);
      const reqRank = LEVEL_MAP[req.requiredLevel] ?? 1;
      const curRank = uSkill?.level ? (LEVEL_MAP[uSkill.level] ?? 0) : 0;
      const isVerified = uSkill?.isVerified ?? false;

      totalScore += Math.min(reqRank, curRank);

      let gapSeverity: GapSeverity = "missing";
      let recommendedAction: RecommendedAction = "learn";

      if (curRank >= reqRank && isVerified) {
        gapSeverity = "met";
        recommendedAction = "practice";
        verifiedCount++;
      } else if (curRank >= reqRank && !isVerified) {
        gapSeverity = "unverified";
        recommendedAction = "assess";
        inProgressCount++;
      } else if (curRank > 0) {
        gapSeverity = "missing";
        recommendedAction = "learn";
        inProgressCount++;
      } else {
        gapSeverity = "missing";
        recommendedAction = "learn";
        missingCount++;
      }

      actions.push({
        skillId: req.skill.id,
        skillName: req.skill.name,
        category: req.skill.category,
        requiredLevel: req.requiredLevel as SkillLevel,
        currentLevel: (uSkill?.level as SkillLevel) ?? null,
        isVerified,
        gapSeverity,
        recommendedAction,
      });

      // Keep up to 6 skills for radar chart clarity
      if (radarData.length < 6) {
        radarData.push({
          subject: req.skill.name,
          required: reqRank,
          current: curRank,
          fullMark: 4,
        });
      }
    }

    const overallMatchPercent =
      maxScore > 0 ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 0;

    return {
      targetCareer: {
        id: career.id,
        title: career.title,
        summary: career.summary,
      },
      overallMatchPercent,
      radarData,
      actions,
      stats: {
        totalRequired: career.requirements.length,
        verifiedCount,
        inProgressCount,
        missingCount,
      },
    };
  },
};
