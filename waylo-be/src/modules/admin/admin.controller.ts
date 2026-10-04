import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {adminService} from "./admin.service";

export const adminController = {
  async getDashboard(_req: Request, res: Response) {
    res.json(ok(await adminService.getDashboard()));
  },

  async listUsers(_req: Request, res: Response) {
    res.json(ok(await adminService.listUsers()));
  },

  async updateUserRole(req: Request, res: Response) {
    const userId = req.params.userId as string;
    const {role} = req.body;
    res.json(ok(await adminService.updateUserRole(userId, role)));
  },

  async createSkill(req: Request, res: Response) {
    res.status(201).json(ok(await adminService.createSkill(req.body)));
  },

  async createCareer(req: Request, res: Response) {
    res.status(201).json(ok(await adminService.createCareer(req.body)));
  },

  async createQuestion(req: Request, res: Response) {
    res.status(201).json(ok(await adminService.createQuestion(req.body)));
  },

  async listCourses(_req: Request, res: Response) {
    res.json(ok(await adminService.listCourses()));
  },

  async updateCourse(req: Request, res: Response) {
    const id = req.params.id as string;
    res.json(ok(await adminService.updateCourse(id, req.body)));
  },
};
