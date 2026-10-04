import type {NextFunction, Request, Response} from "express";

const AUDIT_PREFIX = "[audit]";

export function auditLog(action: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const actor = req.auth?.id ?? "anonymous";
    const role = req.auth?.role ?? "none";
    // Log identifiers only. Never log PII such as names, emails, or answers.
    console.info(`${AUDIT_PREFIX} action=${action} actor=${actor} role=${role}`);
    next();
  };
}