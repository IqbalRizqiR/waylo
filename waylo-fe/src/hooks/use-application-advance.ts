"use client";

import {useTranslations} from "next-intl";
import {useQueryClient} from "@tanstack/react-query";
import type {ApplicationDetail, ApplicationStage} from "@waylo/shared";
import {pipelineActions, REJECT_ACTION_LABEL_KEY} from "@waylo/shared";
import {useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";

// Encapsulates advancing a candidate through the pipeline: the mutation, the
// invalidation, and the action list derived from the shared transition table.
export function useApplicationAdvance(applicationId: string) {
  const t = useTranslations("company.candidateDetail");
  const queryClient = useQueryClient();

  const mutation = useApiMutation<ApplicationDetail, {to: ApplicationStage; note?: string}>({
    invalidateKeys: [
      queryKeys.company.application(applicationId),
      queryKeys.company.applications,
      queryKeys.company.dashboard,
    ],
    mapVariables: (vars) => ({
      path: `/applications/${applicationId}/advance`,
      method: "POST",
      body: vars,
    }),
  });

  function actionsFor(application: ApplicationDetail) {
    const actions = pipelineActions(application.stage, application.track);
    return actions.map((action) => ({
      to: action.to,
      label: t(`actions.${action.labelKey}`),
    }));
  }

  function advance(to: ApplicationStage, note?: string) {
    return mutation.mutateAsync({to, note});
  }

  return {
    advance,
    actionsFor,
    rejectLabel: t(`actions.${REJECT_ACTION_LABEL_KEY}`),
    isPending: mutation.isPending,
    error: mutation.error,
    invalidateApplication: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.application(applicationId),
      }),
  };
}
