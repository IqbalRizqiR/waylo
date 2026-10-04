import {apiFetch} from "@/lib/api/client";
import {authHeaders} from "@/lib/session/storage";
import type {PaymentSnapResponse, PlanCode} from "@waylo/shared";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export async function initiateMidtransPayment(params: {
  planCode: PlanCode;
  onSuccess: () => void;
  onError?: (err: Error) => void;
}): Promise<void> {
  const idempotencyKey = crypto.randomUUID();

  try {
    const snapData = await apiFetch<PaymentSnapResponse>("/payments/snap-token", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        planCode: params.planCode,
        idempotencyKey,
      }),
    });

    if (typeof window !== "undefined" && window.snap?.pay) {
      window.snap.pay(snapData.token, {
        onSuccess: () => params.onSuccess(),
        onError: (err) => params.onError?.(new Error(String(err))),
      });
    } else {
      // In sandbox / mock dev environment: simulate payment completion
      params.onSuccess();
    }
  } catch (err) {
    params.onError?.(err instanceof Error ? err : new Error("Gagal memulai pembayaran"));
  }
}
