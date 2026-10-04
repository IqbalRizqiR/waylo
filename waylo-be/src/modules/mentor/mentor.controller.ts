import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {mentorService} from "./mentor.service";

export const mentorController = {
  async getDashboard(req: Request, res: Response) {
    res.json(ok(await mentorService.dashboard(req.auth!.id)));
  },

  async listReviews(req: Request, res: Response) {
    res.json(ok(await mentorService.listReviews(req.auth!.id)));
  },

  async submitReview(req: Request, res: Response) {
    const referenceId = req.params.referenceId as string;
    const type = req.query.type === "project" ? "project_submission" : "candidate_screening";
    res.json(
      ok(await mentorService.submitReview(req.auth!.id, referenceId, type, req.body)),
    );
  },

  async createCourse(req: Request, res: Response) {
    res.status(201).json(ok(await mentorService.createCourse(req.auth!.id, req.body)));
  },

  async updateCourse(req: Request, res: Response) {
    const id = req.params.id as string;
    res.json(ok(await mentorService.updateCourse(req.auth!.id, id, req.body)));
  },

  async getProfile(req: Request, res: Response) {
    res.json(ok(await mentorService.getProfile(req.auth!.id)));
  },

  async updateProfile(req: Request, res: Response) {
    res.json(ok(await mentorService.updateProfile(req.auth!.id, req.body)));
  },
};
