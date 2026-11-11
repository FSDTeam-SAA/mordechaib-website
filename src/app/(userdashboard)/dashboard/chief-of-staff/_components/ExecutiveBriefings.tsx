"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DiscussTeamChallenges } from "./DiscussTeamChallenges";
import { ExecutiveAgentUpdates } from "./ExecutiveAgentUpdates";
import { ExecutiveMetrics } from "./ExecutiveMetrics";
import { WeeklyReview } from "./WeeklyReview";

type BriefingType = "TODAY" | "TEAM_CHALLENGES" | "WEEKLY_REVIEW";
type BriefingStatus = "QUEUED" | "GENERATING" | "READY" | "FAILED";
type Availability = "AVAILABLE" | "PARTIAL" | "UNAVAILABLE";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string | string[];
};

type BriefingItem = {
  id: string;
  label: string;
  detail?: string;
  status?: string;
  severity?: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  value?: string | number;
  unit?: string;
  proposalId?: string;
  proposalRecordId?: string;
  proposalAction?: "APPROVE" | "RETRY";
};

export type BriefingSection = {
  id: string;
  title: string;
  kind: "TEXT" | "LIST" | "AGENT_CARDS" | "DECISION_CARDS" | "METRIC_GRID" | "PROGRESS" | "DONUT";
  availability: Availability;
  summary: string;
  items: BriefingItem[];
};

type HeadlineMetric = {
  key: string;
  label: string;
  value: string | number;
  unit: string;
};

type ExecutiveBriefing = {
  id: string;
  briefingType: BriefingType;
  status: BriefingStatus;
  pollAfterMs?: number;
  failure?: { message?: string; retryable?: boolean };
  content?: {
    summary: string;
    trajectory: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "UNKNOWN";
    headlineMetrics: HeadlineMetric[];
    sections: BriefingSection[];
  };
};

type GenerateResponse = {
  briefingId: string;
  status: BriefingStatus;
  pollAfterMs?: number;
};

type BriefingUiState = {
  briefing: ExecutiveBriefing | null;
  loading: boolean;
  error: string | null;
  refreshing?: { briefingId?: string; pollAfterMs?: number };
  refreshError?: string | null;
};

type ProposalActionState = {
  action: BriefingItem["proposalAction"];
  status: "LOADING" | "SUCCESS" | "ERROR";
  message?: string;
};

const briefingOptions: Array<{ type: BriefingType; label: string }> = [
  { type: "TODAY", label: "Get today’s briefing" },
  { type: "TEAM_CHALLENGES", label: "Discuss team challenges" },
  { type: "WEEKLY_REVIEW", label: "Weekly Review" },
];

function createInitialState(): Record<BriefingType, BriefingUiState> {
  return {
    TODAY: { briefing: null, loading: false, error: null },
    TEAM_CHALLENGES: { briefing: null, loading: false, error: null },
    WEEKLY_REVIEW: { briefing: null, loading: false, error: null },
  };
}

function messageOf(result: ApiEnvelope<unknown>, fallback: string) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || fallback;
}

function labelOf(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function availabilityClass(availability: Availability) {
  if (availability === "UNAVAILABLE") return "text-[#8B93B8]";
  if (availability === "PARTIAL") return "text-[#B54708]";
  return "text-[#15803D]";
}

function severityClass(severity: BriefingItem["severity"]) {
  if (severity === "CRITICAL" || severity === "HIGH") {
    return "bg-[#FEE2E2] text-[#B42318]";
  }
  if (severity === "MEDIUM") return "bg-[#FEF3C7] text-[#B54708]";
  if (severity === "LOW") return "bg-[#DBEAFE] text-[#1D4ED8]";
  return "bg-[#DCFCE7] text-[#15803D]";
}

function itemValue(item: BriefingItem) {
  if (item.value === undefined) {
    return item.status ? labelOf(item.status) : undefined;
  }
  if (!item.unit || item.unit === "TEXT") return String(item.value);
  if (item.unit === "PERCENT") return `${item.value}%`;
  if (item.unit === "CURRENCY_USD") return `$${item.value}`;
  return `${item.value} ${labelOf(item.unit)}`;
}

function HeadlineValue({ metric }: { metric: HeadlineMetric }) {
  const value =
    metric.unit === "PERCENT"
      ? `${metric.value}%`
      : metric.unit === "CURRENCY_USD"
        ? `$${metric.value}`
        : metric.value;
  return <>{value}</>;
}

function percentageOf(item: BriefingItem) {
  const value = Number(item.value);
  if (!Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function ProposalActionButton({
  item,
  actionState,
  onAction,
}: {
  item: BriefingItem;
  actionState?: ProposalActionState;
  onAction: (proposalRecordId: string, action: "APPROVE" | "RETRY") => void;
}) {
  if (!item.proposalAction) return null;

  if (!item.proposalRecordId) {
    return (
      <p className="mt-3 text-xs text-[#B54708]">
        This recommendation is not linked to an executable proposal.
      </p>
    );
  }

  if (actionState?.status === "SUCCESS") {
    return (
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#15803D]">
        <CheckCircle2 className="size-3.5" />
        {labelOf(item.proposalAction)} request submitted
      </p>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={actionState?.status === "LOADING"}
        onClick={() => onAction(item.proposalRecordId!, item.proposalAction!)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#5B7FF0] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4569DB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionState?.status === "LOADING" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : null}
        {labelOf(item.proposalAction)} proposal
      </button>
      {actionState?.status === "ERROR" ? (
        <p className="mt-2 text-xs text-[#B42318]">{actionState.message}</p>
      ) : null}
    </div>
  );
}

function ProgressItems({ items }: { items: BriefingItem[] }) {
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-white p-3">
      {items.map((item) => {
        const percentage = percentageOf(item);
        const value = itemValue(item);
        return (
          <article key={item.id} className="rounded-lg bg-[#F5F7FF] p-3">
            <div className="flex items-start justify-between gap-3 text-sm">
              <h3 className="font-medium text-[#0E1224]">{item.label}</h3>
              {value ? (
                <span className="shrink-0 font-medium text-[#5B7FF0]">{value}</span>
              ) : null}
            </div>
            {percentage !== null ? (
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-[#E4EAF8]"
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
              >
                <div
                  className="h-full rounded-full bg-[#5B7FF0]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : null}
            {item.detail ? (
              <p className="mt-2 text-sm text-[#667085]">{item.detail}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function DonutItems({ items }: { items: BriefingItem[] }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const percentage = percentageOf(item);
        const value = itemValue(item);
        return (
          <article key={item.id} className="rounded-lg bg-[#F5F7FF] p-4">
            <div className="flex items-center gap-4">
              {percentage !== null ? (
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#5B7FF0 0 ${percentage}%, #E4EAF8 ${percentage}% 100%)`,
                  }}
                  aria-label={`${item.label}: ${percentage}%`}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#5B7FF0]">
                    {value}
                  </div>
                </div>
              ) : null}
              <div className="min-w-0">
                <h3 className="font-medium text-[#0E1224]">{item.label}</h3>
                {percentage === null && value ? (
                  <p className="mt-1 text-lg font-semibold text-[#5B7FF0]">{value}</p>
                ) : null}
              </div>
            </div>
            {item.detail ? (
              <p className="mt-3 text-sm text-[#667085]">{item.detail}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function BriefingSectionCard({
  section,
  number,
  proposalActions,
  onProposalAction,
}: {
  section: BriefingSection;
  number: number;
  proposalActions: Record<string, ProposalActionState | undefined>;
  onProposalAction: (proposalRecordId: string, action: "APPROVE" | "RETRY") => void;
}) {
  const cardGrid =
    section.kind === "AGENT_CARDS" ||
    section.kind === "DECISION_CARDS" ||
    section.kind === "METRIC_GRID";

  return (
    <section className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium">
            {number}. {section.title}
          </h2>
          <p className="mt-2 break-words text-sm text-[#667085]">{section.summary}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium ${availabilityClass(section.availability)}`}
        >
          {labelOf(section.availability)}
        </span>
      </div>

      {section.items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[#CBD5EE] bg-[#FAFBFF] p-4 text-sm text-[#8B93B8]">
          No data is available for this section yet.
        </div>
      ) : section.kind === "PROGRESS" ? (
        <ProgressItems items={section.items} />
      ) : section.kind === "DONUT" ? (
        <DonutItems items={section.items} />
      ) : cardGrid ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {section.items.map((item) => {
            const value = itemValue(item);
            const showAgentBadge = section.kind === "AGENT_CARDS";
            return (
              <article key={item.id} className="rounded-lg bg-[#F5F7FF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {showAgentBadge ? (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#DFE7FF] text-xs font-semibold text-[#4569DB]">
                        {item.label.charAt(0).toUpperCase()}
                      </span>
                    ) : null}
                    <h3 className="min-w-0 font-medium text-[#0E1224]">
                      {item.label}
                    </h3>
                  </div>
                  {item.severity ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${severityClass(item.severity)}`}
                    >
                      {labelOf(item.severity)}
                    </span>
                  ) : null}
                </div>
                {value ? (
                  <p className="mt-2 text-lg font-semibold text-[#5B7FF0]">
                    {value}
                  </p>
                ) : null}
                {item.detail ? (
                  <p className="mt-2 text-sm text-[#667085]">{item.detail}</p>
                ) : null}
                <ProposalActionButton
                  item={item}
                  actionState={
                    item.proposalRecordId
                      ? proposalActions[item.proposalRecordId]
                      : undefined
                  }
                  onAction={onProposalAction}
                />
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 space-y-2 rounded-2xl bg-white p-3">
          {section.items.map((item) => {
            const value = itemValue(item);
            const marker =
              item.severity === "CRITICAL" || item.severity === "HIGH"
                ? "bg-[#EF4444]"
                : item.severity === "MEDIUM"
                  ? "bg-[#F59E0B]"
                  : "bg-[#10B981]";
            return (
              <article key={item.id} className="rounded-lg bg-[#F5F7FF] px-3 py-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${marker}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium text-[#0E1224]">{item.label}</h3>
                      {value ? (
                        <span className="shrink-0 text-sm font-medium text-[#5B7FF0]">
                          {value}
                        </span>
                      ) : null}
                    </div>
                    {item.detail ? (
                      <p className="mt-1 text-sm text-[#667085]">{item.detail}</p>
                    ) : null}
                    <ProposalActionButton
                      item={item}
                      actionState={
                        item.proposalRecordId
                          ? proposalActions[item.proposalRecordId]
                          : undefined
                      }
                      onAction={onProposalAction}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ExecutiveBriefings() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;
  const canManageBriefings = ["OWNER", "ADMIN"].includes(
    session?.user.role?.toUpperCase() ?? "",
  );
  const [activeType, setActiveType] = useState<BriefingType>("TODAY");
  const [briefings, setBriefings] = useState(createInitialState);
  const [proposalActions, setProposalActions] = useState<
    Record<string, ProposalActionState | undefined>
  >({});

  const updateState = useCallback(
    (type: BriefingType, update: Partial<BriefingUiState>) => {
      setBriefings((current) => ({
        ...current,
        [type]: { ...current[type], ...update },
      }));
    },
    [],
  );

  const request = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`,
        {
          ...init,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...init?.headers,
          },
          cache: "no-store",
        },
      );
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result, "Unable to load the executive briefing."));
      }
      return result.data as T;
    },
    [accessToken],
  );

  const loadById = useCallback(
    async (
      type: BriefingType,
      briefingId: string,
      preserveExistingReadyBriefing = false,
    ) => {
      try {
        const briefing = await request<ExecutiveBriefing>(
          `/chief-of-staff/briefings/id/${encodeURIComponent(briefingId)}`,
        );

        if (preserveExistingReadyBriefing) {
          setBriefings((current) => {
            const previous = current[type];
            if (briefing.status === "READY") {
              return {
                ...current,
                [type]: {
                  ...previous,
                  briefing,
                  loading: false,
                  error: null,
                  refreshing: undefined,
                  refreshError: null,
                },
              };
            }
            if (briefing.status === "FAILED") {
              return {
                ...current,
                [type]: {
                  ...previous,
                  loading: false,
                  refreshing: undefined,
                  refreshError:
                    briefing.failure?.message || "Briefing refresh failed.",
                },
              };
            }
            return {
              ...current,
              [type]: {
                ...previous,
                loading: false,
                refreshing: {
                  briefingId: briefing.id,
                  pollAfterMs: briefing.pollAfterMs,
                },
                refreshError: null,
              },
            };
          });
          return;
        }

        updateState(type, {
          briefing,
          loading: false,
          error:
            briefing.status === "FAILED"
              ? briefing.failure?.message || "Briefing generation failed."
              : null,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load the executive briefing.";
        if (preserveExistingReadyBriefing) {
          updateState(type, {
            loading: false,
            refreshing: undefined,
            refreshError: message,
          });
        } else {
          updateState(type, { loading: false, error: message });
        }
      }
    },
    [request, updateState],
  );

  const loadLatest = useCallback(
    async (type: BriefingType) => {
      updateState(type, { loading: true, error: null });
      try {
        const briefing = await request<ExecutiveBriefing | null>(
          `/chief-of-staff/briefings/${type}`,
        );
        updateState(type, {
          briefing,
          loading: false,
          error:
            briefing?.status === "FAILED"
              ? briefing.failure?.message || "Briefing generation failed."
              : null,
        });
      } catch (error) {
        updateState(type, {
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load the executive briefing.",
        });
      }
    },
    [request, updateState],
  );

  const generate = useCallback(
    async (type: BriefingType) => {
      setActiveType(type);
      updateState(type, { loading: true, error: null });
      try {
        const generated = await request<GenerateResponse>(
          `/chief-of-staff/briefings/${type}/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asOf: new Date().toISOString() }),
          },
        );
        await loadById(type, generated.briefingId);
      } catch (error) {
        updateState(type, {
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to generate the executive briefing.",
        });
      }
    },
    [loadById, request, updateState],
  );

  const refresh = useCallback(
    async (type: BriefingType) => {
      setActiveType(type);
      updateState(type, { refreshing: {}, refreshError: null });
      try {
        const generated = await request<GenerateResponse>(
          `/chief-of-staff/briefings/${type}/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ asOf: new Date().toISOString() }),
          },
        );
        updateState(type, {
          refreshing: {
            briefingId: generated.briefingId,
            pollAfterMs: generated.pollAfterMs,
          },
          refreshError: null,
        });
        await loadById(type, generated.briefingId, true);
      } catch (error) {
        updateState(type, {
          refreshing: undefined,
          refreshError:
            error instanceof Error
              ? error.message
              : "Unable to refresh the executive briefing.",
        });
      }
    },
    [loadById, request, updateState],
  );

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !accessToken ||
      !canManageBriefings
    ) {
      return;
    }
    void Promise.all(briefingOptions.map((option) => loadLatest(option.type)));
  }, [accessToken, canManageBriefings, loadLatest, sessionStatus]);

  const selectBriefing = useCallback(
    (type: BriefingType) => {
      setActiveType(type);
      const current = briefings[type];
      if (!current.briefing && !current.loading && !current.error) {
        void loadLatest(type);
      }
    },
    [briefings, loadLatest],
  );

  const active = briefings[activeType];
  useEffect(() => {
    const pendingBriefings = (Object.entries(briefings) as Array<
      [BriefingType, BriefingUiState]
    >).flatMap(([type, state]) => {
      const briefing = state.briefing;
      if (
        briefing &&
        (briefing.status === "QUEUED" || briefing.status === "GENERATING")
      ) {
        return [
          {
            type,
            briefingId: briefing.id,
            pollAfterMs: briefing.pollAfterMs,
            preserveExistingReadyBriefing: false,
          },
        ];
      }
      if (state.refreshing?.briefingId) {
        return [
          {
            type,
            briefingId: state.refreshing.briefingId,
            pollAfterMs: state.refreshing.pollAfterMs,
            preserveExistingReadyBriefing: true,
          },
        ];
      }
      return [];
    });

    if (!canManageBriefings || pendingBriefings.length === 0) return;

    const timeout = window.setTimeout(() => {
      void Promise.all(
        pendingBriefings.map(
          ({ type, briefingId, preserveExistingReadyBriefing }) =>
            loadById(type, briefingId, preserveExistingReadyBriefing),
        ),
      );
    }, Math.min(...pendingBriefings.map(({ pollAfterMs }) => pollAfterMs ?? 2_000)));

    return () => window.clearTimeout(timeout);
  }, [briefings, canManageBriefings, loadById]);

  const runProposalAction = useCallback(
    async (proposalRecordId: string, action: "APPROVE" | "RETRY") => {
      setProposalActions((current) => ({
        ...current,
        [proposalRecordId]: { action, status: "LOADING" },
      }));
      try {
        await request<unknown>(
          `/ai-actions/proposals/${encodeURIComponent(proposalRecordId)}/action`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          },
        );
        setProposalActions((current) => ({
          ...current,
          [proposalRecordId]: { action, status: "SUCCESS" },
        }));
      } catch (error) {
        setProposalActions((current) => ({
          ...current,
          [proposalRecordId]: {
            action,
            status: "ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Unable to submit this proposal action.",
          },
        }));
      }
    },
    [request],
  );

  const isWaiting =
    active.briefing?.status === "QUEUED" ||
    active.briefing?.status === "GENERATING";
  const content =
    active.briefing?.status === "READY" ? active.briefing.content : undefined;
  const renderSection = (section: BriefingSection, index: number) => (
    <BriefingSectionCard
      key={section.id}
      section={section}
      number={index + 1}
      proposalActions={proposalActions}
      onProposalAction={runProposalAction}
    />
  );

  return (
    <>
      <section className="rounded-lg bg-white p-3">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {briefingOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => selectBriefing(option.type)}
              disabled={!canManageBriefings || briefings[option.type].loading}
              className={`flex h-8 items-center pr-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 ${activeType === option.type ? "bg-[#F5F7FF] before:mr-3 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "px-3"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 space-y-6 rounded-2xl bg-white p-4 sm:p-6">
        {sessionStatus === "loading" || active.loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-[#5B7FF0]" />
            <p className="mt-3 font-medium">Loading executive briefing…</p>
          </div>
        ) : !canManageBriefings ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-[#B54708]" />
            <p className="mt-3 font-medium">Executive briefings are restricted</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">
              Only workspace owners and administrators can view or action executive briefings.
            </p>
          </div>
        ) : active.error ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-[#EF4444]" />
            <p className="mt-3 font-medium">Briefing could not be loaded</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">{active.error}</p>
            <button type="button" onClick={() => void loadLatest(activeType)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#5B7FF0] px-4 py-2 text-sm font-medium text-white">
              <RefreshCw className="size-4" /> Try again
            </button>
          </div>
        ) : isWaiting ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Clock3 className="size-8 text-[#5B7FF0]" />
            <p className="mt-3 font-medium">Your briefing is being prepared</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">We&apos;ll refresh this page automatically when it is ready.</p>
          </div>
        ) : !content ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <FileText className="size-8 text-[#8B93B8]" />
            <p className="mt-3 font-medium">No briefing is available yet</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">Generate the latest briefing for this view to see grounded updates.</p>
            <button type="button" onClick={() => void generate(activeType)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#5B7FF0] px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="size-4" /> Generate briefing
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void refresh(activeType)}
                disabled={active.loading || Boolean(active.refreshing)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#C9D5FF] px-3 py-2 text-sm font-medium text-[#4569DB] transition-colors hover:bg-[#F5F7FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {active.refreshing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                {active.refreshing ? "Refreshing…" : "Refresh briefing"}
              </button>
            </div>
            {active.refreshError ? (
              <div className="rounded-lg border border-[#FEC84B] bg-[#FFFAEB] px-3 py-2 text-sm text-[#B54708]">
                Refresh failed. Showing the last successful briefing: {active.refreshError}
              </div>
            ) : null}
            <section className="rounded-xl bg-[#F5F7FF] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#5B7FF0]">{labelOf(content.trajectory)} trajectory</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#475467]">{content.summary}</p>
                </div>
                <CheckCircle2 className="size-5 shrink-0 text-[#10B981]" />
              </div>
            </section>

            {content.headlineMetrics.length ? (
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {content.headlineMetrics.map((metric) => (
                  <article key={metric.key} className="rounded-lg bg-[#F5F7FF] p-4 text-center">
                    <p className="text-sm text-[#667085]">{metric.label}</p>
                    <p className="mt-1 text-xl font-semibold text-[#5B7FF0]"><HeadlineValue metric={metric} /></p>
                  </article>
                ))}
              </section>
            ) : null}

            <div className="space-y-6">
              {activeType === "TEAM_CHALLENGES" ? (
                <DiscussTeamChallenges
                  sections={content.sections}
                  renderSection={renderSection}
                />
              ) : activeType === "WEEKLY_REVIEW" ? (
                <WeeklyReview
                  sections={content.sections}
                  renderSection={renderSection}
                />
              ) : (
                content.sections.map((section, index) =>
                  section.kind === "AGENT_CARDS" ? (
                    <ExecutiveAgentUpdates
                      key={section.id}
                      section={section}
                      index={index}
                      renderSection={renderSection}
                    />
                  ) : (
                    <ExecutiveMetrics
                      key={section.id}
                      section={section}
                      index={index}
                      renderSection={renderSection}
                    />
                  ),
                )
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
