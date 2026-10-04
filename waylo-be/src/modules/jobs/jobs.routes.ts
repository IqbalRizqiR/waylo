import {Router} from "express";
import {createJobSchema, idParamSchema, jobListQuerySchema, updateJobSchema} from "@waylo/shared";
import {jobController} from "./jobs.controller";
import {validate} from "../../middleware/validate";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requireRole("company_member", "admin"),
  validate({query: jobListQuerySchema}),
  jobController.list,
);

router.post(
  "/",
  requireRole("company_member"),
  validate({body: createJobSchema}),
  jobController.create,
);

router.get("/:id", validate({params: idParamSchema}), jobController.getById);

router.patch(
  "/:id",
  requireRole("company_member"),
  validate({params: idParamSchema, body: updateJobSchema}),
  jobController.update,
);

router.post(
  "/:id/publish",
  requireRole("company_member"),
  validate({params: idParamSchema}),
  jobController.publish,
);

export {router as jobRoutes};
