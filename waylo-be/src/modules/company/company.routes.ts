import {Router} from "express";
import {
  createSubscriptionSchema,
  inviteMentorPartnerSchema,
  updateCompanyProfileSchema,
} from "@waylo/shared";
import {companyController} from "./company.controller";
import {authenticate} from "../../middleware/auth";
import {requireRole} from "../../middleware/rbac";
import {validate} from "../../middleware/validate";

const router = Router();

router.use(authenticate, requireRole("company_member", "admin"));

router.get("/dashboard", companyController.getDashboard);
router.get("/plans", companyController.listPlans);
router.get("/subscription", companyController.getSubscription);
router.get("/profile", companyController.getProfile);
router.patch(
  "/profile",
  validate({body: updateCompanyProfileSchema}),
  companyController.updateProfile,
);
router.post(
  "/subscribe",
  validate({body: createSubscriptionSchema}),
  companyController.subscribe,
);
router.get("/mentor-partners", companyController.listMentorPartners);
router.post(
  "/mentor-partners/invite",
  validate({body: inviteMentorPartnerSchema}),
  companyController.inviteMentorPartner,
);

export {router as companyRoutes};
