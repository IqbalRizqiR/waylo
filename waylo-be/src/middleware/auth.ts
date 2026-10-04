import type {NextFunction, Request, Response} from "express";
import {HttpError} from "../lib/http";
import {verifyAccessToken} from "../lib/tokens";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw HttpError.unauthorized();
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.auth = {
      id: payload.sub,
      email: "",
      role: payload.role,
      companyId: payload.companyId,
    };
    next();
  } catch {
    throw HttpError.unauthorized("Token tidak valid atau kedaluwarsa.");
  }
}