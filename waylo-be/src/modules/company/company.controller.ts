import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {companyService} from "./company.service";

export const companyController = {
  async getDashboard(req: Request, res: Response) {
    res.json(ok(await companyService.dashboard(req.auth!.companyId!)));
  },

  async listPlans(_req: Request, res: Response) {
    res.json(ok(await companyService.plans()));
  },

  async getSubscription(req: Request, res: Response) {
    res.json(ok(await companyService.subscription(req.auth!.companyId!)));
  },

  async getProfile(req: Request, res: Response) {
    res.json(ok(await companyService.getProfile(req.auth!.companyId!)));
  },

  async updateProfile(req: Request, res: Response) {
    res.json(ok(await companyService.updateProfile(req.auth!.companyId!, req.body)));
  },

  async subscribe(req: Request, res: Response) {
    const {planCode, idempotencyKey} = req.body;
    res.json(
      ok(await companyService.subscribe(req.auth!.companyId!, planCode, idempotencyKey)),
    );
  },

  async listMentorPartners(_req: Request, res: Response) {
    res.json(ok(await companyService.mentorPartners()));
  },

  async inviteMentorPartner(req: Request, res: Response) {
    const {mentorId, note} = req.body;
    res.json(
      ok(await companyService.inviteMentor(req.auth!.companyId!, mentorId, note)),
    );
  },
};
