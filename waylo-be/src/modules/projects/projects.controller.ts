import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {projectService} from "./projects.service";

export const projectController = {
  async list(req: Request, res: Response) {
    const userId = req.auth?.id;
    res.json(ok(await projectService.list(userId)));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.auth?.id;
    res.json(ok(await projectService.getDetail(id, userId)));
  },

  async submit(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.auth!.id;
    res.json(ok(await projectService.submit(id, userId, req.body)));
  },
};
