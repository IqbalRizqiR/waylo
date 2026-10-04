import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {paymentService} from "./payments.service";

export const paymentController = {
  async createSnapToken(req: Request, res: Response) {
    const userId = req.auth!.id;
    const role = req.auth!.role;
    const companyId = req.auth?.companyId;

    const result = await paymentService.createSnapToken({
      userId,
      role,
      companyId,
      input: req.body,
    });

    res.json(ok(result));
  },

  async handleWebhook(req: Request, res: Response) {
    const result = await paymentService.handleWebhook(req.body);
    res.json(ok(result));
  },
};
