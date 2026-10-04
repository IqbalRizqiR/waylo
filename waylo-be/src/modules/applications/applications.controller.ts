import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {applicationService} from "./applications.service";
import {validatedQuery} from "../../middleware/validate";
import type {ApplicationStage} from "@waylo/shared";

type ListQuery = {jobId?: string; stage?: ApplicationStage};

export const applicationController = {
  async list(req: Request, res: Response) {
    const query = validatedQuery<ListQuery>(req);
    const applications = await applicationService.listByCompany(
      req.auth!.companyId!,
      query.jobId,
    );
    const filtered = query.stage
      ? applications.filter((a) => a.stage === query.stage)
      : applications;
    res.json(ok(filtered));
  },

  async getById(req: Request, res: Response) {
    const {id} = req.params as {id: string};
    res.json(ok(await applicationService.getById(req.auth!.companyId!, id)));
  },

  // State-machine transitions are their own endpoint (RULE section 4).
  async advance(req: Request, res: Response) {
    const {id} = req.params as {id: string};
    res.json(
      ok(
        await applicationService.advance(
          req.auth!.companyId!,
          id,
          req.body.to,
          req.body.note,
          req.auth!.id,
        ),
      ),
    );
  },
};
