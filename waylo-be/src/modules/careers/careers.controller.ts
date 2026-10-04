import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {careerService} from "./careers.service";

export const careerController = {
  async list(_req: Request, res: Response) {
    res.json(ok(await careerService.list()));
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.auth?.id;
    res.json(ok(await careerService.getDetail(id, userId)));
  },
};
