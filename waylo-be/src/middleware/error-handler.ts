import type {NextFunction, Request, Response} from "express";
import {HttpError, fail} from "../lib/http";

type ZodLikeIssue = {message?: string};
type ZodLikeError = {name: string; issues: ZodLikeIssue[]};

function isZodError(error: unknown): error is ZodLikeError {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const candidate = error as Partial<ZodLikeError>;
  return (
    candidate.name === "ZodError" &&
    Array.isArray(candidate.issues) &&
    candidate.issues.length > 0
  );
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json(fail("not_found", "Endpoint tidak ditemukan."));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (isZodError(error)) {
    const first = error.issues[0];
    res
      .status(400)
      .json(fail("validation_error", first?.message ?? "Input tidak valid."));
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json(fail(error.code, error.message));
    return;
  }

  // Never leak raw errors or stack traces to the client.
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    console.error("[error] unexpected", error.message, "\n", error.stack);
  } else {
    console.error(
      "[error] unexpected",
      error instanceof Error ? error.name : typeof error,
    );
  }
  res.status(500).json(fail("internal_error", "Terjadi kesalahan internal."));
}