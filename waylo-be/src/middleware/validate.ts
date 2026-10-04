import type {NextFunction, Request, Response} from "express";
import type {ZodTypeAny} from "zod";

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

// Express 5 exposes `req.query` as a getter-only property, so parsed query and
// params are attached to dedicated fields rather than reassigned.
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request["params"];
    }
    if (schemas.query) {
      (req as Request & {validatedQuery?: unknown}).validatedQuery =
        schemas.query.parse(req.query);
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    next();
  };
}

export function validatedQuery<T>(req: Request): T {
  return (req as Request & {validatedQuery?: T}).validatedQuery as T;
}