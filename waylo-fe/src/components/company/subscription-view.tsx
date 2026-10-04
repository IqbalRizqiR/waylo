"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiQuery} from "@/lib/query/hooks";
import {useQueryClient} from "@tanstack/react-query";
import {queryKeys} from "@/lib/query/keys";
import type {Plan, PlanCode, Subscription} from "@waylo/shared";
import {initiateMidtransPayment} from "@/lib/payments/snap";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatCurrency} from "@/lib/format";

export function CompanySubscriptionView() {
  const t = useTranslations("company.subscription");
  const tc = useTranslations("common");
  const plansQuery = useApiQuery<Plan[]>(
    queryKeys.company.plans,
    "/company/plans",
  );
  const subscriptionQuery = useApiQuery<Subscription | null>(
    queryKeys.company.subscription,
    "/company/subscription",
  );

  const queryClient = useQueryClient();
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCheckout(planCode: PlanCode) {
    setIsProcessing(true);
    await initiateMidtransPayment({
      planCode,
      onSuccess: () => {
        setIsProcessing(false);
        setSubscribedPlan(planCode);
        void queryClient.invalidateQueries({queryKey: queryKeys.company.subscription});
        void queryClient.invalidateQueries({queryKey: queryKeys.company.dashboard});
      },
      onError: () => {
        setIsProcessing(false);
      },
    });
  }

  return (
    <DataState
      query={plansQuery}
      data={plansQuery.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(plans) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={undefined}
          />

          {subscribedPlan ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success">
              <Icon name="mingcute:check-circle-line" className="text-lg" />
              <span>{t("upgradeSuccess")}</span>
            </div>
          ) : null}

          {subscriptionQuery.data ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {t("currentPlan", {
                plan:
                  subscriptionQuery.data.planCode === "premium"
                    ? "Premium"
                    : "Free Trial",
                status: t(`status.${subscriptionQuery.data.status}`),
              })}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrent = subscriptionQuery.data?.planCode === plan.code;

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col gap-5 p-6 ${
                    plan.isRecommended ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Chip tone={plan.isRecommended ? "status" : "muted"}>
                      {plan.code === "premium" ? t("badgePremium") : t("badgeTrial")}
                    </Chip>
                    {plan.isRecommended ? (
                      <span className="text-xs font-medium text-primary">
                        {t("recommended")}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-3xl font-medium text-primary">
                      {formatCurrency(plan.priceAmount, plan.priceCurrency)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {plan.billingPeriod === "trial" ? t("perTrial") : t("perMonth")}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Icon
                          name="mingcute:check-circle-line"
                          className="mt-0.5 shrink-0 text-[var(--success)]"
                        />
                        <span className="text-[var(--text-secondary)]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full">
                        {t("currentPlanBadge")}
                      </Button>
                    ) : (
                      <Button
                        variant={plan.isRecommended ? "primary" : "outline"}
                        disabled={isProcessing}
                        onClick={() => void handleCheckout(plan.code)}
                        className="w-full"
                      >
                        {isProcessing
                          ? tc("loading")
                          : plan.code === "premium"
                          ? t("subscribeCta")
                          : t("trialCta")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </DataState>
  );
}
