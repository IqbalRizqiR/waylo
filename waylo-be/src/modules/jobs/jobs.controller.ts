import type {Request, Response} from "express";
import type {z} from "zod";
import {idParamSchema} from "@waylo/shared";
import {ok} from "../../lib/http";
import {jobService} from "./jobs.service";

type IdParams = z.infer<typeof idParamSchema>;

export const jobController = {
  async list(req: Request, res: Response) {
    res.json(ok(await jobService.listByCompany(req.auth!.companyId!)));
  },

  async create(req: Request, res: Response) {
    const job = await jobService.create(req.auth!.companyId!, req.body);
    res.status(201).json(ok(job));
  },

  async getById(req: Request, res: Response) {
    const {id} = req.params as IdParams;
    res.json(ok(await jobService.getById(id)));
  },

  async publish(req: Request, res: Response) {
    const {id} = req.params as IdParams;
    res.json(ok(await jobService.publish(req.auth!.companyId!, id)));
  },

  async update(req: Request, res: Response) {
    const {id} = req.params as IdParams;
    res.json(ok(await jobService.update(req.auth!.companyId!, id, req.body)));
  },
};
