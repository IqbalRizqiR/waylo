import type {NextFunction, Request, Response} from "express";
import type {Role} from "@waylo/shared";
import {HttpError} from "../lib/http";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw HttpError.unauthorized();
    }
    if (!roles.includes(req.auth.role)) {
      throw HttpError.forbidden();
    }
    next();
  };
}