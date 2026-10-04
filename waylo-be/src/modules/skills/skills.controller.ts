import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {skillService} from "./skills.service";

export const skillController = {
  async list(_req: Request, res: Response) {
    res.json(ok(await skillService.list()));
  },
};
