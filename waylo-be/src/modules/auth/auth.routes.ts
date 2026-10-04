import {Router} from "express";
import {changePasswordSchema, loginSchema, registerSchema} from "@waylo/shared";
import {authController} from "./auth.controller";
import {validate} from "../../middleware/validate";
import {authenticate} from "../../middleware/auth";

const router = Router();

router.post(
  "/register",
  validate({body: registerSchema}),
  authController.register,
);

router.post("/login", validate({body: loginSchema}), authController.login);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.me);
router.patch(
  "/change-password",
  authenticate,
  validate({body: changePasswordSchema}),
  authController.changePassword,
);

export {router as authRoutes};
