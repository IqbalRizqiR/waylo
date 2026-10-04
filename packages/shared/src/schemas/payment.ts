import { z } from "zod";
import { planCodeSchema } from "./company";

export const createPaymentIntentSchema = z.object({
  planCode: planCodeSchema,
  idempotencyKey: z.string().uuid(),
});
export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;

export const paymentSnapResponseSchema = z.object({
  token: z.string(),
  redirectUrl: z.string().url(),
  orderId: z.string(),
});
export type PaymentSnapResponse = z.infer<typeof paymentSnapResponseSchema>;

export const midtransNotificationSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.enum([
    "capture",
    "settlement",
    "pending",
    "deny",
    "cancel",
    "expire",
    "refund",
  ]),
  fraud_status: z.string().optional(),
});
export type MidtransNotification = z.infer<typeof midtransNotificationSchema>;
