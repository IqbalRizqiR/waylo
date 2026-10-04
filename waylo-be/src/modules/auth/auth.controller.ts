import type {Request, Response} from "express";
import {ok} from "../../lib/http";
import {config, isProduction} from "../../config";
import {verifyRefreshToken} from "../../lib/tokens";
import {HttpError} from "../../lib/http";
import {authService} from "./auth.service";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(config.jwt.refreshCookieName, token, REFRESH_COOKIE_OPTIONS);
}

export const authController = {
  async register(req: Request, res: Response) {
    const session = await authService.register(req.body);
    setRefreshCookie(res, session.refreshToken);
    res.status(201).json(ok({accessToken: session.accessToken, user: session.user}));
  },

  async login(req: Request, res: Response) {
    const session = await authService.login(req.body);
    setRefreshCookie(res, session.refreshToken);
    res.json(ok({accessToken: session.accessToken, user: session.user}));
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[config.jwt.refreshCookieName];
    if (!token) {
      throw HttpError.unauthorized();
    }
    const payload = verifyRefreshToken(token);
    const session = await authService.refresh(payload.sub);
    res.json(ok({accessToken: session.accessToken, user: session.user}));
  },

  logout(_req: Request, res: Response) {
    res.clearCookie(config.jwt.refreshCookieName, {path: "/auth"});
    res.json(ok({success: true}));
  },

  async me(req: Request, res: Response) {
    res.json(ok(await authService.me(req.auth!.id)));
  },

  async changePassword(req: Request, res: Response) {
    res.json(ok(await authService.changePassword(req.auth!.id, req.body)));
  },
};
