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
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatCurrency} from "@/lib/format";

export function LearnerSubscriptionView() {
  const t = useTranslations("learner.subscription");
  const tc = useTranslations("common");

  const subQuery = useApiQuery<Subscription>(
    queryKeys.learner.subscription,
    "/learner/subscription",
  );
  const plansQuery = useApiQuery<Plan[]>(
    queryKeys.learner.plans,
    "/learner/plans",
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
        void queryClient.invalidateQueries({queryKey: queryKeys.learner.subscription});
        void queryClient.invalidateQueries({queryKey: queryKeys.learner.dashboard});
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
      {(plans) => {
        const currentPlanCode = subQuery.data?.planCode ?? "free_trial";

        return (
          <div className="flex flex-col gap-8">
            <PageHeader title={t("title")} subtitle={t("subtitle")} />

            {subscribedPlan ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-success">
                <Icon name="mingcute:check-circle-line" className="text-xl" />
                <span>{t("upgradeSuccess")}</span>
              </div>
            ) : null}

            {/* Plans grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {plans.map((plan) => {
                const isCurrent = currentPlanCode === plan.code;
                const isPro = plan.code === "premium";

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col justify-between p-8 transition-all ${
                      plan.isRecommended
                        ? "border-2 border-primary shadow-[0_0_30px_0_rgba(0,30,192,0.12)]"
                        : "border border-border"
                    }`}
                  >
                    {plan.isRecommended ? (
                      <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        {t("recommended")}
                      </span>
                    ) : null}

                    <div>
                      <h2 className="text-2xl font-medium text-black">{plan.name}</h2>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-black sm:text-4xl">
                          {plan.priceAmount === 0
                            ? t("free")
                            : formatCurrency(plan.priceAmount, plan.priceCurrency)}
                        </span>
                        {plan.priceAmount > 0 ? (
                          <span className="text-sm text-[var(--muted-foreground)]">
                            /{plan.billingPeriod === "monthly" ? t("perMonth") : plan.billingPeriod}
                          </span>
                        ) : null}
                      </div>

                      <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                            <Icon
                              name="mingcute:check-line"
                              className="mt-0.5 text-base text-success shrink-0"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 border-t border-border pt-6">
                      {isCurrent ? (
                        <Button variant="outline" disabled className="w-full">
                          {t("currentPlan")}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isPro ? "primary" : "outline"}
                          disabled={isProcessing}
                          onClick={() => void handleCheckout(plan.code)}
                        >
                          {isProcessing ? tc("loading") : t("selectPlan")}
                          <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
