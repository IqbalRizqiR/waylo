import {Router} from "express";
import {idParamSchema, updateLessonProgressSchema} from "@waylo/shared";
import {courseController} from "./courses.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate);

router.get("/", courseController.list);
router.get("/:id", validate({params: idParamSchema}), courseController.getById);
router.post("/:id/enroll", requireRole("learner"), validate({params: idParamSchema}), courseController.enroll);
router.patch(
  "/:id/lessons/:lessonId/progress",
  requireRole("learner"),
  validate({body: updateLessonProgressSchema}),
  courseController.updateLessonProgress,
);

export {router as courseRoutes};
