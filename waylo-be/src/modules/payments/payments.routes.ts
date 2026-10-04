import {Router} from "express";
import {createPaymentIntentSchema, midtransNotificationSchema} from "@waylo/shared";
import {paymentController} from "./payments.controller";
import {authenticate} from "../../middleware/auth";
import {validate} from "../../middleware/validate";

const router = Router();

// Generate Midtrans Snap token for subscription checkout
router.post(
  "/snap-token",
  authenticate,
  validate({body: createPaymentIntentSchema}),
  paymentController.createSnapToken,
);

// Midtrans payment notification webhook (public, signature verified)
router.post(
  "/webhook",
  validate({body: midtransNotificationSchema}),
  paymentController.handleWebhook,
);

export {router as paymentRoutes};
