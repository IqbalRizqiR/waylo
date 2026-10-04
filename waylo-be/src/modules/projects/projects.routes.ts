import {Router} from "express";
import {idParamSchema, submitProjectSchema} from "@waylo/shared";
import {projectController} from "./projects.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate);

router.get("/", projectController.list);
router.get("/:id", validate({params: idParamSchema}), projectController.getById);
router.post(
  "/:id/submit",
  requireRole("learner"),
  validate({params: idParamSchema, body: submitProjectSchema}),
  projectController.submit,
);

export {router as projectRoutes};
