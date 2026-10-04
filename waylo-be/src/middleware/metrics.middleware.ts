import type {Request, Response, NextFunction} from "express";
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  httpRateLimitBlocksTotal,
} from "../monitoring/metrics";

function normalizeRoute(req: Request): string {
  if (req.route?.path) {
    const baseUrl = req.baseUrl || "";
    const routePath = typeof req.route.path === "string" ? req.route.path : "";
    return `${baseUrl}${routePath}` || "/";
  }

  const rawPath = req.baseUrl || req.path || "/";
  return rawPath
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
    .replace(/c[a-z0-9]{24}/gi, ":id")
    .replace(/\/\d+(?=\/|$)/g, "/:id");
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === "/metrics" || req.path === "/health") {
    return next();
  }

  const startNs = process.hrtime.bigint();

  res.on("finish", () => {
    const endNs = process.hrtime.bigint();
    const durationSeconds = Number(endNs - startNs) / 1e9;
    const route = normalizeRoute(req);
    const status = String(res.statusCode);

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status,
    });

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route,
        status,
      },
      durationSeconds,
    );

    if (res.statusCode === 429) {
      httpRateLimitBlocksTotal.inc({route});
    }
  });

  next();
}
