import {Router} from "express";
import {
  advanceApplicationSchema,
  applicationStageSchema,
  idParamSchema,
} from "@waylo/shared";
import {z} from "zod";
import {applicationController} from "./applications.controller";
import {validate} from "../../middleware/validate";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";

const router = Router();

router.use(authenticate);

const listQuerySchema = z.object({
  jobId: z.string().optional(),
  stage: applicationStageSchema.optional(),
});

router.get(
  "/",
  requireRole("company_member", "admin"),
  validate({query: listQuerySchema}),
  applicationController.list,
);

router.get(
  "/:id",
  requireRole("company_member", "admin"),
  validate({params: idParamSchema}),
  applicationController.getById,
);

router.post(
  "/:id/advance",
  requireRole("company_member"),
  validate({params: idParamSchema, body: advanceApplicationSchema}),
  applicationController.advance,
);

export {router as applicationRoutes};
