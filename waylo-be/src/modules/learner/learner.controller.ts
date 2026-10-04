import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {learnerService} from "./learner.service";

// Controllers own the HTTP boundary only (req/res, status codes). All logic
// lives in the service, which never sees Express types.

export const learnerController = {
  async getDashboard(req: Request, res: Response) {
    res.json(ok(await learnerService.dashboard(req.auth!.id)));
  },

  async getRoadmap(req: Request, res: Response) {
    res.json(ok(await learnerService.roadmap(req.auth!.id)));
  },

  async listAssessments(_req: Request, res: Response) {
    res.json(ok(await learnerService.assessments()));
  },

  async getAssessmentById(req: Request, res: Response) {
    const id = req.params.id as string;
    res.json(ok(await learnerService.getAssessmentDetail(id)));
  },

  async submitAssessment(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.auth!.id;
    res.json(ok(await learnerService.submitAssessment(id, userId, req.body)));
  },

  async listAssessmentResults(req: Request, res: Response) {
    res.json(ok(await learnerService.assessmentResults(req.auth!.id)));
  },

  async listMentors(_req: Request, res: Response) {
    res.json(ok(await learnerService.mentors()));
  },

  async getMentorById(req: Request, res: Response) {
    const id = req.params.id as string;
    res.json(ok(await learnerService.getMentorDetail(id)));
  },

  async bookSession(req: Request, res: Response) {
    const mentorId = req.params.id as string;
    const learnerId = req.auth!.id;
    res.json(ok(await learnerService.bookSession(mentorId, learnerId, req.body)));
  },

  async listSessions(req: Request, res: Response) {
    res.json(ok(await learnerService.listSessions(req.auth!.id)));
  },

  async listCertificates(req: Request, res: Response) {
    res.json(ok(await learnerService.certificates(req.auth!.id)));
  },

  async getCertificateById(req: Request, res: Response) {
    const id = req.params.id as string;
    res.json(ok(await learnerService.getCertificateDetail(id)));
  },

  async getSubscription(req: Request, res: Response) {
    res.json(ok(await learnerService.getSubscription(req.auth!.id)));
  },

  async listPlans(_req: Request, res: Response) {
    res.json(ok(await learnerService.listPlans()));
  },

  async subscribe(req: Request, res: Response) {
    const {planCode, idempotencyKey} = req.body;
    res.json(ok(await learnerService.subscribe(req.auth!.id, planCode, idempotencyKey)));
  },

  async updateRoadmapItem(req: Request, res: Response) {
    const itemId = req.params.itemId as string;
    const {status} = req.body;
    res.json(ok(await learnerService.updateRoadmapItem(req.auth!.id, itemId, status)));
  },

  async getProfile(req: Request, res: Response) {
    res.json(ok(await learnerService.getProfile(req.auth!.id)));
  },

  async updateProfile(req: Request, res: Response) {
    res.json(ok(await learnerService.updateProfile(req.auth!.id, req.body)));
  },

  getOnboardingQuestions(_req: Request, res: Response) {
    res.json(ok(learnerService.getOnboardingQuestions()));
  },

  async getOnboardingRecommendations(req: Request, res: Response) {
    res.json(ok(await learnerService.getOnboardingRecommendations(req.body)));
  },

  async completeOnboarding(req: Request, res: Response) {
    res.json(ok(await learnerService.completeOnboarding(req.auth!.id, req.body)));
  },

  async getSkillGap(req: Request, res: Response) {
    res.json(ok(await learnerService.skillGap(req.auth!.id)));
  },
};
