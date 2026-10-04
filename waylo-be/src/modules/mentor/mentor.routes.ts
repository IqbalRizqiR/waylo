import {Router} from "express";
import {
  idParamSchema,
  mentorCreateCourseSchema,
  mentorUpdateCourseSchema,
  submitMentorReviewSchema,
  updateMentorProfileInputSchema,
} from "@waylo/shared";
import {mentorController} from "./mentor.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate, requireRole("mentor", "admin"));

router.get("/dashboard", mentorController.getDashboard);
router.get("/reviews", mentorController.listReviews);
router.post(
  "/reviews/:referenceId",
  validate({body: submitMentorReviewSchema}),
  mentorController.submitReview,
);
router.post(
  "/courses",
  validate({body: mentorCreateCourseSchema}),
  mentorController.createCourse,
);
router.patch(
  "/courses/:id",
  validate({params: idParamSchema, body: mentorUpdateCourseSchema}),
  mentorController.updateCourse,
);
router.get("/profile", mentorController.getProfile);
router.patch(
  "/profile",
  validate({body: updateMentorProfileInputSchema}),
  mentorController.updateProfile,
);

export {router as mentorRoutes};
