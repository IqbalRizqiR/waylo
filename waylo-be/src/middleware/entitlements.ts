import type {NextFunction, Request, Response} from "express";
import {prisma} from "../lib/prisma";
import {HttpError} from "../lib/http";

export type PlanName = "premium";

export function requirePlan(plan: PlanName) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw HttpError.unauthorized();
    }

    if (req.auth.role === "admin") {
      return next();
    }

    if (!req.auth.companyId) {
      throw HttpError.forbidden("Fitur ini hanya untuk akun perusahaan.");
    }

    const subscription = await prisma.subscription.findFirst({
      where: {companyId: req.auth.companyId},
      orderBy: {createdAt: "desc"},
    });

    const isPremium =
      plan === "premium" &&
      subscription?.planCode === "premium" &&
      (subscription.status === "active" || subscription.status === "trial");

    if (!isPremium) {
      throw HttpError.forbidden(
        "Fitur ini memerlukan langganan Premium.",
        "plan_required",
      );
    }

    next();
  };
}