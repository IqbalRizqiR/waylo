import {Router} from "express";
import {
  bookSessionSchema,
  completeOnboardingSchema,
  getRecommendationsInputSchema,
  idParamSchema,
  submitAssessmentSchema,
  updateLearnerProfileSchema,
  updateRoadmapItemStatusSchema,
} from "@waylo/shared";
import {learnerController} from "./learner.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate, requireRole("learner", "admin"));

router.get("/dashboard", learnerController.getDashboard);
router.get("/roadmap", learnerController.getRoadmap);
router.patch(
  "/roadmap/items/:itemId",
  validate({body: updateRoadmapItemStatusSchema}),
  learnerController.updateRoadmapItem,
);
router.get("/assessments", learnerController.listAssessments);
router.get(
  "/assessments/:id",
  validate({params: idParamSchema}),
  learnerController.getAssessmentById,
);
router.post(
  "/assessments/:id/submit",
  validate({params: idParamSchema, body: submitAssessmentSchema}),
  learnerController.submitAssessment,
);
router.get("/assessment-results", learnerController.listAssessmentResults);
router.get("/mentors", learnerController.listMentors);
router.get(
  "/mentors/:id",
  validate({params: idParamSchema}),
  learnerController.getMentorById,
);
router.post(
  "/mentors/:id/book-session",
  validate({params: idParamSchema, body: bookSessionSchema}),
  learnerController.bookSession,
);
router.get("/sessions", learnerController.listSessions);
router.get("/certificates", learnerController.listCertificates);
router.get(
  "/certificates/:id",
  validate({params: idParamSchema}),
  learnerController.getCertificateById,
);
router.get("/subscription", learnerController.getSubscription);
router.get("/plans", learnerController.listPlans);
router.post("/subscribe", learnerController.subscribe);

router.get("/profile", learnerController.getProfile);
router.patch(
  "/profile",
  validate({body: updateLearnerProfileSchema}),
  learnerController.updateProfile,
);
router.get("/onboarding/questions", learnerController.getOnboardingQuestions);
router.post(
  "/onboarding/recommendations",
  validate({body: getRecommendationsInputSchema}),
  learnerController.getOnboardingRecommendations,
);
router.post(
  "/onboarding/complete",
  validate({body: completeOnboardingSchema}),
  learnerController.completeOnboarding,
);
router.get("/skill-gap", learnerController.getSkillGap);

export {router as learnerRoutes};
