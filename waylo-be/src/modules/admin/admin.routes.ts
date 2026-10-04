import {Router} from "express";
import {
  createCareerInputSchema,
  createQuestionInputSchema,
  createSkillInputSchema,
  idParamSchema,
  mentorUpdateCourseSchema,
  updateUserRoleSchema,
} from "@waylo/shared";
import {adminController} from "./admin.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.listUsers);
router.patch(
  "/users/:userId/role",
  validate({body: updateUserRoleSchema}),
  adminController.updateUserRole,
);
router.post(
  "/skills",
  validate({body: createSkillInputSchema}),
  adminController.createSkill,
);
router.post(
  "/careers",
  validate({body: createCareerInputSchema}),
  adminController.createCareer,
);
router.post(
  "/questions",
  validate({body: createQuestionInputSchema}),
  adminController.createQuestion,
);
router.get("/courses", adminController.listCourses);
router.patch(
  "/courses/:id",
  validate({params: idParamSchema, body: mentorUpdateCourseSchema}),
  adminController.updateCourse,
);

export {router as adminRoutes};
