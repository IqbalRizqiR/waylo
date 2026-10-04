import crypto from "node:crypto";
import {prisma} from "../../lib/prisma";
import {HttpError} from "../../lib/http";
import type {
  CreatePaymentIntentInput,
  MidtransNotification,
  PaymentSnapResponse,
  PlanCode,
} from "@waylo/shared";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-waylo-demo";
const IS_SANDBOX = process.env.MIDTRANS_IS_PRODUCTION !== "true";

export const paymentService = {
  async createSnapToken(params: {
    userId: string;
    role: string;
    companyId?: string;
    input: CreatePaymentIntentInput;
  }): Promise<PaymentSnapResponse> {
    const plan = await prisma.plan.findUnique({
      where: {code: params.input.planCode},
    });

    if (!plan) {
      throw HttpError.notFound("Paket langganan tidak ditemukan.", "plan_not_found");
    }

    const orderId = `WAYLO-${params.input.planCode.toUpperCase()}-${Date.now()}`;
    const grossAmount = plan.priceAmount;

    let token = `snap-token-${orderId}`;
    let redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`;

    // If real Midtrans key is provided, attempt to request token from Midtrans Snap API
    if (process.env.MIDTRANS_SERVER_KEY && grossAmount > 0) {
      try {
        const snapEndpoint = IS_SANDBOX
          ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
          : "https://app.midtrans.com/snap/v1/transactions";

        const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
        const res = await fetch(snapEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: grossAmount,
            },
            credit_card: {
              secure: true,
            },
            customer_details: {
              email: `${params.userId}@waylo.test`,
            },
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as {token: string; redirect_url: string};
          token = data.token;
          redirectUrl = data.redirect_url;
        }
      } catch {
        // Fall back to sandbox token
      }
    }

    // Upsert subscription record with orderId and payment token
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    if (params.companyId) {
      await prisma.subscription.create({
        data: {
          companyId: params.companyId,
          planCode: params.input.planCode,
          status: grossAmount === 0 ? "active" : "trial",
          externalOrderId: orderId,
          paymentToken: token,
          paymentUrl: redirectUrl,
          idempotencyKey: params.input.idempotencyKey,
          currentPeriodEndsAt: endsAt,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: params.userId,
          planCode: params.input.planCode,
          status: grossAmount === 0 ? "active" : "trial",
          externalOrderId: orderId,
          paymentToken: token,
          paymentUrl: redirectUrl,
          idempotencyKey: params.input.idempotencyKey,
          currentPeriodEndsAt: endsAt,
        },
      });
    }

    return {
      token,
      redirectUrl,
      orderId,
    };
  },

  async handleWebhook(notification: MidtransNotification): Promise<{status: string}> {
    // Verify signature key: SHA512(order_id + status_code + gross_amount + ServerKey)
    const rawSignature = `${notification.order_id}${notification.status_code}${notification.gross_amount}${MIDTRANS_SERVER_KEY}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(rawSignature)
      .digest("hex");

    // In production, signature must match
    if (
      process.env.NODE_ENV === "production" &&
      notification.signature_key !== expectedSignature
    ) {
      throw HttpError.forbidden("Signature Midtrans tidak valid.", "invalid_signature");
    }

    const sub = await prisma.subscription.findUnique({
      where: {externalOrderId: notification.order_id},
    });

    if (!sub) {
      return {status: "order_not_found"};
    }

    let nextStatus: "active" | "cancelled" | "past_due" | "trial" = sub.status;

    if (
      notification.transaction_status === "settlement" ||
      notification.transaction_status === "capture"
    ) {
      nextStatus = "active";
    } else if (notification.transaction_status === "pending") {
      nextStatus = "trial";
    } else if (
      notification.transaction_status === "deny" ||
      notification.transaction_status === "cancel" ||
      notification.transaction_status === "expire"
    ) {
      nextStatus = "cancelled";
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    await prisma.subscription.update({
      where: {id: sub.id},
      data: {
        status: nextStatus,
        currentPeriodEndsAt: nextStatus === "active" ? endsAt : sub.currentPeriodEndsAt,
      },
    });

    return {status: nextStatus};
  },
};
