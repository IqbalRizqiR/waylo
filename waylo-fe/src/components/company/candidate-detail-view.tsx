"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import {useApplicationAdvance} from "@/hooks/use-application-advance";
import {isTerminalStage, type ApplicationDetail, type ApplicationStage} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {StageBadge} from "@/components/shared/stage-badge";
import {formatLongDate} from "@/lib/format";

export function CandidateDetailView({id}: {id: string}) {
  const t = useTranslations("company.candidateDetail");
  const tc = useTranslations("common");
  const router = useRouter();
  const query = useApiQuery<ApplicationDetail>(
    queryKeys.company.application(id),
    `/applications/${id}`,
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(data) => (
        <CandidateDetailContent
          data={data}
          applicationId={id}
          onBack={() => router.push("/company/candidates")}
          backLabel={tc("back")}
        />
      )}
    </DataState>
  );
}

function CandidateDetailContent({
  data,
  applicationId,
  onBack,
  backLabel,
}: {
  data: ApplicationDetail;
  applicationId: string;
  onBack: () => void;
  backLabel: string;
}) {
  const t = useTranslations("company.candidateDetail");
  const tc = useTranslations("common");
  const {advance, actionsFor, rejectLabel, isPending, error} =
    useApplicationAdvance(applicationId);

  const actions = actionsFor(data);
  const terminal = isTerminalStage(data.stage);

  const [pendingAction, setPendingAction] = useState<{
    to: ApplicationStage;
    label: string;
  } | null>(null);
  const [advanceNote, setAdvanceNote] = useState("");

  async function handleConfirmAdvance() {
    if (!pendingAction) return;
    try {
      await advance(pendingAction.to, advanceNote.trim() || undefined);
      setPendingAction(null);
      setAdvanceNote("");
    } catch {
      // error is handled by mutation
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="mingcute:arrow-left-line" /> {backLabel}
        </Button>
      </div>

      <PageHeader
        title={data.candidateName}
        subtitle={`${t("appliedAs", {position: data.summary.position})} | ${
          data.summary.track === "premium" ? t("track.premium") : t("track.free")
        }`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <h2 className="text-xl font-medium text-black">{t("historyTitle")}</h2>
          <ol className="flex flex-col gap-4">
            {data.history.map((entry, index) => (
              <li key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  {index < data.history.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="pb-2">
                  <StageBadge stage={entry.stage} />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {formatLongDate(entry.occurredAt)}
                  </p>
                  {entry.note ? (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-medium text-black">{t("summaryTitle")}</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <SummaryRow label={t("position")} value={data.summary.position} />
            <SummaryRow
              label={t("experience")}
              value={
                data.summary.experienceYears !== null
                  ? t("yearsValue", {count: data.summary.experienceYears})
                  : "-"
              }
            />
            <SummaryRow label={t("location")} value={data.summary.location} />
            <SummaryRow
              label={t("skillMatch")}
              value={
                data.skillMatchPercent !== null ? `${data.skillMatchPercent}%` : "-"
              }
            />
          </dl>

          <div className="mt-2 flex flex-col gap-2">
            <span className="text-sm text-[var(--muted-foreground)]">
              {t("currentStage")}
            </span>
            <StageBadge stage={data.stage} />
          </div>
        </Card>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : null}

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-xl font-medium text-black">{t("nextStepTitle")}</h2>
        {terminal ? (
          <p className="text-sm text-[var(--text-secondary)]">
            {data.stage === "hired" ? t("alreadyHired") : t("alreadyRejected")}
          </p>
        ) : pendingAction ? (
          <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-secondary/15 p-5">
            <div>
              <h3 className="font-medium text-black">
                {t("confirmActionTitle", {action: pendingAction.label})}
              </h3>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                {t("confirmActionSubtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="advanceNote" className="text-xs font-medium text-primary">
                {t("noteLabel")} ({tc("optional")})
              </label>
              <Textarea
                id="advanceNote"
                rows={3}
                maxLength={500}
                value={advanceNote}
                onChange={(e) => setAdvanceNote(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="bg-white text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPendingAction(null);
                  setAdvanceNote("");
                }}
                disabled={isPending}
              >
                {tc("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAdvance}
                disabled={isPending}
              >
                {isPending ? tc("loading") : tc("confirm")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Button
                key={action.to}
                disabled={isPending}
                onClick={() => {
                  setPendingAction({to: action.to, label: action.label});
                  setAdvanceNote("");
                }}
              >
                {action.label}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setPendingAction({to: "rejected", label: rejectLabel});
                setAdvanceNote("");
              }}
            >
              {rejectLabel}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryRow({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right font-medium text-black">{value}</dd>
    </div>
  );
}
