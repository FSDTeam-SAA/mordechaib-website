"use client";

import Image from "next/image";
import {
  AlertCircle,
  Activity,
  BarChart3,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  direction?: "UP" | "DOWN" | "FLAT" | "UNKNOWN";
  value?: string | number;
  unit?: string;
  sourceRefs?: string[];
  recommendationOnly?: boolean;
  proposalId?: string;
  proposalRecordId?: string;
  proposalAction?: "APPROVE" | "RETRY";
};

export type BriefingSection = {
  id: string;
  title: string;
  kind:
    | "TEXT"
    | "LIST"
    | "AGENT_CARDS"
    | "DECISION_CARDS"
    | "METRIC_GRID"
    | "PROGRESS"
    | "DONUT";
  availability: Availability;
  summary: string;
  items: BriefingItem[];
};

type HeadlineMetric = {
  key: string;
  label: string;
  value: string | number;
  unit: string;
  direction?: "UP" | "DOWN" | "FLAT" | "UNKNOWN";
  severity?: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRefs?: string[];
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

const FIGMA_SECTION_COPY: Partial<Record<BriefingType, Record<string, { title: string; description: string }>>> = {
  TODAY: {
    primary_focus: { title: "Today’s Primary Focus (Single Strategic Objective)", description: "One sentence defining the most important thing today." },
    overnight_movements: { title: "Overnight Movements (Critical Updates Since Yesterday)", description: "Short, high-signal updates from:" },
    ceo_action_items: { title: "CEO Action Items (Immediate Decisions Required)", description: "Only items that must be done by you before noon." },
    pipeline_revenue: { title: "Pipeline & Revenue Signals (Sales + Forecast)", description: "Three priorities aligned with your strategic direction" },
    client_health: { title: "Client Health & Support Status", description: "From Cassie:" },
    operational_status: { title: "Operational Status & Blockers", description: "From Vizzy:" },
    financial_pulse: { title: "Financial Pulse (Cash, AR, AP, Burn)", description: "From Dexter:" },
    vendor_accountability: { title: "Vendor Accountability Snapshot", description: "From Vizzy + Dexter:" },
    marketing_growth: { title: "Marketing & Growth Signals", description: "From Vizzy + Dexter:" },
    design_status: { title: "Design & Creative Status", description: "From Havi:" },
    ceo_notes: { title: "CEO Notes (Your Strategic Direction)", description: "Your space:" },
  },
  TEAM_CHALLENGES: {
    completed_milestones: { title: "Completed Milestones (Daily Achievements)", description: "Daily Achievement" },
    ceo_action_items: { title: "CEO Action Items", description: "Awaiting Executive Decision or Approval" },
    next_day_decisions: { title: "Next day Decision Framework", description: "Pre - Framed Options for Tomorrow" },
    key_risks: { title: "Key Risks & Red Flags", description: "Top Three" },
    strategic_blockers: { title: "Strategic blockers", description: "Cross-Team/ Cross Vendor" },
    financial_movements: { title: "financial Movements & Variances", description: "Todays Financial Summary" },
    operational_metrics: { title: "Operational & Financial Metrics Pulse", description: "KPI Snapshot" },
    vendor_performance: { title: "Vendor Performance & Accountability", description: "Deliverables, SLAs & overdue items" },
    priority_alignment: { title: "Priority Alignment Update", description: "What Shifted Today" },
    team_accountability: { title: "Internal Team Accountability", description: "Throughput & Performance Signals" },
    escalations: { title: "Escalations & Rapid Resolution Items", description: "Needs Immediate Executive Attention" },
    ceo_notes: { title: "CEO Notes (Your Strategic Direction)", description: "Your space:" },
  },
  WEEKLY_REVIEW: {
    executive_summary: { title: "Executive Summary", description: "" },
    roi_efficiency: { title: "Aggregate ROI & Efficiency Gains", description: "" },
    sales_revenue: { title: "Sales & Revenue Performance", description: "" },
    client_health: { title: "Client Health & Support Quality", description: "" },
    delivery_milestones: { title: "Operational Delivery & Milestones", description: "" },
    marketing_growth: { title: "Marketing & Growth Signals", description: "" },
    product_creative: { title: "Product & Creative Output", description: "" },
    ai_system_health: { title: "Accuracy, Reliability & System Health", description: "" },
    financial_movements: { title: "Financial Movements & Variances", description: "" },
    vendor_performance: { title: "Vendor Performance & Accountability", description: "" },
    strategic_shift: { title: "Strategic Shift & Priority Re-Alignment", description: "" },
    ceo_notes: { title: "CEO Notes (Your Strategic Direction)", description: "Your space:" },
  },
};

const briefingOptions: Array<{ type: BriefingType; label: string }> = [
  { type: "TODAY", label: "Get today’s briefing" },
  { type: "TEAM_CHALLENGES", label: "Discuss team challenges" },
  { type: "WEEKLY_REVIEW", label: "Weekly Review" },
];

type AgentVisual = {
  src: string;
  badge: string;
};

const AGENT_AVATARS: Record<string, AgentVisual> = {
  steve: {
    src: "/executive-briefings/today-steve.png",
    badge: "/executive-briefings/today-steve-badge.svg",
  },
  cassie: {
    src: "/executive-briefings/today-cassie.png",
    badge: "/executive-briefings/today-cassie-badge.svg",
  },
  vizzy: {
    src: "/executive-briefings/today-vizzy.png",
    badge: "/executive-briefings/today-vizzy-badge.svg",
  },
  dexter: {
    src: "/executive-briefings/today-dexter.png",
    badge: "/executive-briefings/today-dexter-badge.svg",
  },
  havi: {
    src: "/executive-briefings/today-havi.png",
    badge: "/executive-briefings/today-havi-badge.svg",
  },
  soshie: {
    src: "/executive-briefings/today-soshie.png",
    badge: "/executive-briefings/today-soshie-badge.svg",
  },
};

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

function itemValue(item: BriefingItem) {
  return valueWithUnit(item.value, item.unit, item.status);
}

function valueWithUnit(
  value: string | number | undefined,
  unit?: string,
  fallbackStatus?: string,
) {
  if (value === undefined) {
    return fallbackStatus ? labelOf(fallbackStatus) : undefined;
  }
  if (!unit || unit === "TEXT") return String(value);
  if (unit === "PERCENT") return `${value}%`;
  if (unit === "CURRENCY_USD") return `$${value}`;
  return `${value} ${labelOf(unit)}`;
}

function hasMetricValues(items: BriefingItem[]) {
  return items.some((item) => item.value !== undefined);
}

function agentAvatarFor(name: string) {
  const normalized = name.toLowerCase();
  return Object.entries(AGENT_AVATARS).find(([agent]) =>
    normalized.includes(agent),
  )?.[1];
}

function MetricIcon({ label, index }: { label: string; index: number }) {
  const normalized = label.toLowerCase();
  const Icon = normalized.includes("revenue") || normalized.includes("cost")
    ? DollarSign
    : normalized.includes("time") || normalized.includes("hour")
      ? Clock3
      : normalized.includes("rate") || normalized.includes("risk") || normalized.includes("burn")
        ? BarChart3
        : normalized.includes("project") || normalized.includes("health")
          ? Activity
          : normalized.includes("growth") || normalized.includes("margin") || normalized.includes("performance")
            ? TrendingUp
            : [Target, Activity, TrendingUp, BarChart3][index % 4];
  return <Icon className="size-4" />;
}

type MetricIconSet = "TEAM" | "WEEKLY_ROI" | "WEEKLY_MARKETING";

const FIGMA_METRIC_ICONS: Record<MetricIconSet, string[]> = {
  TEAM: [
    "/executive-briefings/team-revenue.svg",
    "/executive-briefings/team-active-project.svg",
    "/executive-briefings/team-gross-margin.svg",
    "/executive-briefings/team-burn-rate.svg",
  ],
  WEEKLY_ROI: [
    "/executive-briefings/weekly-cost-savings.svg",
    "/executive-briefings/weekly-hours-saved.svg",
    "/executive-briefings/weekly-productivity-lift.svg",
    "/executive-briefings/weekly-automation-impact.svg",
  ],
  WEEKLY_MARKETING: [
    "/executive-briefings/weekly-funnel-performance.svg",
    "/executive-briefings/weekly-leads-generated.svg",
    "/executive-briefings/weekly-campaign-result.svg",
    "/executive-briefings/weekly-social-mentions.svg",
    "/executive-briefings/weekly-brand-momentum.svg",
  ],
};

function BriefingMetricIcon({
  label,
  index,
  iconSet,
}: {
  label: string;
  index: number;
  iconSet?: MetricIconSet;
}) {
  const icon = iconSet ? FIGMA_METRIC_ICONS[iconSet][index] : undefined;
  return icon ? (
    <Image src={icon} alt="" width={24} height={24} aria-hidden="true" />
  ) : (
    <MetricIcon label={label} index={index} />
  );
}

function DecisionIcon({ label }: { label: string; index: number }) {
  const normalized = label.toLowerCase();
  const icon = normalized.includes("escal") || normalized.includes("risk")
    ? "/executive-briefings/escalation.svg"
    : normalized.includes("review")
      ? "/executive-briefings/review.svg"
      : normalized.includes("sign")
        ? "/executive-briefings/sign-off.svg"
        : "/executive-briefings/approval.svg";
  return <Image src={icon} alt="" width={24} height={24} aria-hidden="true" />;
}

function SectionHeading({
  section,
  number,
  briefingType,
}: {
  section: BriefingSection;
  number: number;
  briefingType?: BriefingType;
}) {
  const copy = briefingType ? FIGMA_SECTION_COPY[briefingType]?.[section.id] : undefined;
  return (
    <div className="mb-3.5">
      <h2 className="text-[0.9375rem]/[1.5rem] font-medium leading-5 text-[#0E1224]">
        {number}. {copy?.title || section.title}
      </h2>
      <p className="mt-3.5 text-sm leading-[18px] text-[#0E1224]">
        {copy?.description || section.summary}
      </p>
    </div>
  );
}

function NoData() {
  return (
    <div className="rounded-xl bg-[#F3F5FF] px-2.5 py-2.5 text-[13px] text-[#8B93B8]">
      No data available
    </div>
  );
}

function DataRows({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  return (
    <div className="rounded-2xl bg-white p-2.5">
      <div className="space-y-2">
        {items.map((item) => {
          const value = itemValue(item);
          const critical =
            item.severity === "CRITICAL" || item.severity === "HIGH";
          return (
            <article
              key={item.id}
              className="flex min-h-[35px] items-center gap-2 rounded-xl bg-[#F5F7FF] px-2"
            >
              <span
                className={`h-[18px] w-1 shrink-0 rounded-[2px] ${critical ? "bg-[#F04438]" : "bg-[#12B981]"}`}
              />
              <p
                className="min-w-0 flex-1 truncate text-sm text-[#8B93B8]"
                title={item.detail || item.label}
              >
                {item.label}
              </p>
              {value ? (
                <span
                  className={
                    critical
                      ? "shrink-0 text-sm text-[#F04438]"
                      : "shrink-0 text-sm text-[#0ABF83]"
                  }
                >
                  {value}
                </span>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MetricTiles({
  items,
  emptyLabels = [],
  columns = "sm:grid-cols-4",
  iconSet,
}: {
  items: BriefingItem[];
  emptyLabels?: string[];
  columns?: "sm:grid-cols-4" | "sm:grid-cols-5";
  iconSet?: MetricIconSet;
}) {
  const displayItems = items.length
    ? items
    : emptyLabels.map((label, index) => ({ id: `empty-${index}`, label }));
  if (!displayItems.length) return <NoData />;
  return (
    <div className={`grid grid-cols-2 gap-2 ${columns}`}>
      {displayItems.map((item, index) => {
        const colors = [
          "text-[#5B7FF0]",
          "text-[#D946EF]",
          "text-[#F59E0B]",
          "text-[#F04438]",
          "text-[#12B981]",
        ];
        const iconBackgrounds = [
          "bg-[rgba(91,127,240,0.10)]",
          "bg-[rgba(210,79,199,0.10)]",
          "bg-[rgba(245,158,11,0.10)]",
          "bg-[rgba(239,68,68,0.10)]",
          "bg-[rgba(18,185,129,0.10)]",
        ];
        return (
          <article key={item.id} className="min-h-[112px] rounded-2xl bg-[#F5F7FF] p-2.5 text-center">
            <span
              className={`mx-auto flex size-10 items-center justify-center rounded-xl text-sm ${iconBackgrounds[index % iconBackgrounds.length]} ${colors[index % colors.length]}`}
            >
              <BriefingMetricIcon
                label={item.label}
                index={index}
                iconSet={iconSet}
              />
            </span>
            <p
              className="mt-2 truncate text-sm font-medium text-[#1D2338]"
              title={item.label}
            >
              {item.label}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${colors[index % colors.length]}`}
            >
              {itemValue(item) || "—"}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function ActionTiles({
  items,
  proposalActions,
  onAction,
}: {
  items: BriefingItem[];
  proposalActions: Record<string, ProposalActionState | undefined>;
  onAction: (id: string, action: "APPROVE" | "RETRY") => void;
}) {
  if (!items.length) return <NoData />;
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const state = item.proposalRecordId
          ? proposalActions[item.proposalRecordId]
          : undefined;
        const canAct = Boolean(item.proposalAction && item.proposalRecordId);
        const colours = [
          "text-[#5B7FF0]",
          "text-[#F59E0B]",
          "text-[#F04438]",
          "text-[#D946EF]",
        ];
        const body = (
          <>
            <span
              className={`mx-auto flex size-10 items-center justify-center rounded-xl ${[
                "bg-[rgba(91,127,240,0.10)]",
                "bg-[rgba(245,158,11,0.10)]",
                "bg-[rgba(239,68,68,0.10)]",
                "bg-[rgba(210,79,199,0.10)]",
              ][index % colours.length]} ${colours[index % colours.length]}`}
            >
              <DecisionIcon label={item.label} index={index} />
            </span>
            <p
              className={`mt-2 text-[17px] font-bold leading-none ${colours[index % colours.length]}`}
            >
              {state?.status === "SUCCESS"
                ? "Submitted"
                : item.status
                  ? labelOf(item.status)
                  : item.proposalAction
                    ? labelOf(item.proposalAction)
                    : item.label}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-[18px] text-[#8B93B8]">
              {item.label}
            </p>
            {state?.status === "ERROR" ? (
              <p className="mt-1 text-[11px] text-[#F04438]">{state.message}</p>
            ) : null}
          </>
        );
        return canAct ? (
          <button
            key={item.id}
            type="button"
            disabled={state?.status === "LOADING"}
            onClick={() =>
              onAction(item.proposalRecordId!, item.proposalAction!)
            }
            className="min-h-[124px] rounded-2xl bg-[#F5F7FF] px-2 py-3.5 text-center transition hover:bg-[#E8EDFF] disabled:opacity-60"
          >
            {state?.status === "LOADING" ? (
              <Loader2 className="mx-auto size-5 animate-spin text-[#5B7FF0]" />
            ) : (
              body
            )}
          </button>
        ) : (
          <article
            key={item.id}
            className="min-h-[124px] rounded-2xl bg-[#F5F7FF] px-2 py-3.5 text-center"
          >
            {body}
          </article>
        );
      })}
    </div>
  );
}

function PriorityCards({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  const tones = [
    { text: "text-[#5B7FF0]", surface: "bg-[rgba(91,127,240,0.10)]" },
    { text: "text-[#10B981]", surface: "bg-[rgba(16,185,129,0.10)]" },
    { text: "text-[#264AFF]", surface: "bg-[rgba(38,74,255,0.10)]" },
  ];
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {items.slice(0, 3).map((item, index) => {
        const tone = tones[index % tones.length];
        const details = (item.detail || "").split(/\n|•/).map((value) => value.trim()).filter(Boolean);
        return (
          <article key={item.id} className="flex min-h-[97px] items-start gap-2 rounded-2xl bg-[#F5F7FF] px-2 py-3.5">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[1.1875rem]/[1.75rem] font-bold ${tone.surface} ${tone.text}`}>
              {index + 1}
            </span>
            <div className="min-w-0 space-y-[3px]">
              <p className={`truncate text-[0.9375rem]/[1.5rem] font-medium ${tone.text}`} title={item.label}>{item.label}</p>
              <p className="truncate text-sm text-[#8B93B8]">{details[0] || item.status || "—"}</p>
              <p className="truncate text-sm text-[#141936]">{details[1] || itemValue(item) || ""}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MilestoneProgress({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  const completed = Math.max(0, Number(items[0]?.value) || 0);
  const total = Math.max(completed, Number(items[1]?.value) || 0, 1);
  const progress = Math.min(100, Math.round((completed / total) * 100));
  const labels = ["Completed", "Missed", "Blocker", "On Track"];
  const tones = ["text-[#10B981]", "text-[#F04438]", "text-[#D24FC7]", "text-[#264AFF]"];
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between text-sm text-[#0E1224]">
        <span className="font-medium">Milestones Completed</span>
        <span>{completed}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-[#F5F7FF]">
        <div className="h-full rounded-full bg-[#5B7FF0]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {labels.map((label, index) => {
          const item = items[index];
          return (
            <article key={label} className="min-h-[58px] rounded-2xl bg-[#F5F7FF] p-2.5 text-center">
              <p className={`text-sm ${tones[index]}`}>{label}</p>
              <p className={`mt-1 text-[0.9375rem]/[1.5rem] font-medium ${tones[index]}`}>
                {itemValue(item || { id: label, label }) || "—"}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ActionRows({
  items,
  proposalActions,
  onAction,
}: {
  items: BriefingItem[];
  proposalActions: Record<string, ProposalActionState | undefined>;
  onAction: (id: string, action: "APPROVE" | "RETRY") => void;
}) {
  if (!items.length) return <NoData />;
  const colors = ["text-[#5B7FF0]", "text-[#F59E0B]", "text-[#F04438]"];
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const state = item.proposalRecordId
          ? proposalActions[item.proposalRecordId]
          : undefined;
        const actionable = Boolean(item.proposalAction && item.proposalRecordId);
        const color = colors[index % colors.length];
        const surfaces = [
          "bg-[rgba(91,127,240,0.10)]",
          "bg-[rgba(245,158,11,0.10)]",
          "bg-[rgba(239,68,68,0.10)]",
        ];
        const content = (
          <>
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${surfaces[index % surfaces.length]} ${color}`}>
              <DecisionIcon label={item.label} index={index} />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className={`truncate text-[17px] font-bold leading-[23px] ${color}`}>
                {state?.status === "SUCCESS"
                  ? "Submitted"
                  : item.status
                    ? labelOf(item.status)
                    : item.proposalAction
                      ? labelOf(item.proposalAction)
                      : item.label}
              </p>
              <p className="truncate text-sm leading-[18px] text-[#8B93B8]">{item.label}</p>
            </div>
            {itemValue(item) ? (
              <span className={`shrink-0 text-sm ${color}`}>{itemValue(item)}</span>
            ) : null}
          </>
        );
        const className = "flex min-h-[60px] w-full items-center gap-4 rounded-2xl bg-[#F5F7FF] px-2";
        return actionable ? (
          <button
            key={item.id}
            type="button"
            className={`${className} transition hover:bg-[#E8EDFF]`}
            disabled={state?.status === "LOADING"}
            onClick={() => onAction(item.proposalRecordId!, item.proposalAction!)}
          >
            {state?.status === "LOADING" ? <Loader2 className="mx-auto size-5 animate-spin text-[#5B7FF0]" /> : content}
          </button>
        ) : (
          <article key={item.id} className={className}>{content}</article>
        );
      })}
    </div>
  );
}

function AgentCards({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const borderColors = [
          "border-[#ACCDE9]",
          "border-[#82DAE9]",
          "border-[#D24FC7]",
          "border-[#5B7FF0]",
          "border-[#F59E0B]",
          "border-[#12B981]",
        ];
        const updates = (item.detail || "No update available")
          .split(/(?:\n|•)/)
          .map((entry) => entry.trim())
          .filter(Boolean);
        const avatar = agentAvatarFor(item.label);
        return (
        <article
          key={item.id}
          className={`min-h-[166px] rounded-2xl border-x border-b border-t-4 bg-white p-2.5 ${borderColors[index % borderColors.length]}`}
        >
          <div className="flex items-center gap-3">
            <span className={`relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-[#F5F7FF] ${borderColors[index % borderColors.length]}`}>
              {avatar ? (
                <>
                  <Image
                    src={avatar.src}
                    alt={`${item.label} avatar`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                  <Image
                    src={avatar.badge}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden="true"
                    className="relative z-10"
                  />
                </>
              ) : (
                <Target className="size-5 text-[#5B7FF0]" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-[1.1875rem]/[1.75rem] font-medium">{item.label}</h3>
              <p className="truncate text-[0.9375rem]/[1.5rem] text-[#1D2338]">
                {item.status ? labelOf(item.status) : "Agent update"}
              </p>
            </div>
          </div>
          <ul className="mt-3.5 list-disc space-y-1 pl-3.5 text-[0.9375rem]/[1.5rem] leading-5 text-[#0E1224]">
            {updates.slice(0, 3).map((update) => <li key={update}>{update}</li>)}
          </ul>
        </article>
      );})}
    </div>
  );
}

function Funnel({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  const colors = ["#264AFF", "#5B7FF0", "#209B78", "#F79009"];
  return (
    <div className="space-y-3 py-0.5">
      {items.slice(0, 4).map((item, index) => (
        <div
          key={item.id}
          className="mx-auto flex h-9 items-center"
          style={{ width: `${Math.max(56, 86 - index * 7)}%` }}
        >
          <span
            className="flex h-full flex-1 items-center justify-center px-2.5 text-sm text-white"
            style={{
              backgroundColor: colors[index],
              clipPath: "polygon(0 0, 100% 0, 94% 100%, 6% 100%)",
            }}
          >
            {item.label}
          </span>
          <span
            className="flex h-full w-[30%] items-center justify-center bg-[#F5F7FF] px-2.5 text-sm text-[#0E1224]"
            style={{ clipPath: "polygon(5% 0, 100% 0, 94% 100%, 0 100%)" }}
          >
            {itemValue(item) || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function Donut({ items }: { items: BriefingItem[] }) {
  if (!items.length) return <NoData />;
  const values = items.map((item) => Math.max(0, Number(item.value) || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const colors = ["#12B981", "#F59E0B", "#F04438", "#8B93B8"];
  const gradient = values.reduce(
    (stops, value, index) => {
      const start = stops.cursor;
      const end = total ? start + (value / total) * 360 : start;
      stops.parts.push(`${colors[index % colors.length]} ${start}deg ${Math.max(start, end - 2)}deg`);
      if (index < values.length - 1) stops.parts.push(`#fff ${Math.max(start, end - 2)}deg ${end}deg`);
      stops.cursor = end;
      return stops;
    },
    { parts: [] as string[], cursor: 0 },
  ).parts.join(", ");
  return (
    <div className="flex flex-wrap items-center gap-6 px-5 py-2">
      <div
        className="flex size-40 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${gradient || "#E4EAF8 0deg 360deg"})`,
        }}
      >
        <div className="flex size-[132px] flex-col items-center justify-center rounded-full bg-white">
          <span className="text-[1.375rem]/[2rem] font-medium">{total || "—"}</span>
          <span className="text-[11px] text-[#667085]">Total</span>
        </div>
      </div>
      <div className="min-w-[180px] flex-1 space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="flex-1">{item.label}</span>
            <span>{itemValue(item) || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveNote({ section }: { section: BriefingSection }) {
  const note = section.items[0]?.detail || section.items[0]?.label || section.summary;
  return (
    <div className="flex min-h-[104px] items-center gap-2 rounded-2xl bg-[#F5F7FF] p-2.5">
      <Image
        src="/executive-briefings/today-laura.png"
        alt="Laura"
        width={80}
        height={80}
        className="size-20 shrink-0 rounded-full border border-[#8B93B8] object-cover"
      />
      <p className="text-sm leading-6 text-[#667085]">{note}</p>
    </div>
  );
}

function Section({
  section,
  number,
  children,
  className = "",
  briefingType,
}: {
  section: BriefingSection;
  number: number;
  children: React.ReactNode;
  className?: string;
  briefingType?: BriefingType;
}) {
  return (
    <section className={`min-w-0 ${className}`}>
      <SectionHeading section={section} number={number} briefingType={briefingType} />
      {children}
    </section>
  );
}

function TodayLayout({
  sections,
  proposalActions,
  onAction,
}: {
  sections: BriefingSection[];
  proposalActions: Record<string, ProposalActionState | undefined>;
  onAction: (id: string, action: "APPROVE" | "RETRY") => void;
}) {
  const byId = (id: string) => sections.find((section) => section.id === id);
  const section = (
    id: string,
    number: number,
    child: (data: BriefingSection) => React.ReactNode,
    className?: string,
  ) => {
    const data = byId(id);
    return data ? (
      <Section key={id} section={data} number={number} className={className} briefingType="TODAY">
        {child(data)}
      </Section>
    ) : null;
  };
  return (
    <div className="space-y-4">
      {section("primary_focus", 1, (data) => (
        <div className="rounded-xl bg-[#F3F5FF] px-2.5 py-1.5 text-[13px]">
          {data.items[0]?.label || "No data available"}
        </div>
      ))}
      {section("overnight_movements", 2, (data) => (
        data.kind === "AGENT_CARDS" ? (
          <AgentCards items={data.items} />
        ) : (
          <DataRows items={data.items} />
        )
      ))}
      {section("ceo_action_items", 3, (data) => (
        <ActionTiles
          items={data.items}
          proposalActions={proposalActions}
          onAction={onAction}
        />
      ))}
      {section("pipeline_revenue", 4, (data) => (
        data.kind === "METRIC_GRID" ? (
          <MetricTiles items={data.items} />
        ) : (
          <PriorityCards items={data.items} />
        )
      ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {section("pipeline_revenue", 5, (data) => (
          <DataRows items={data.items} />
        ))}
        {section("client_health", 6, (data) => (
          <DataRows items={data.items} />
        ))}
      </div>
      {section("operational_status", 7, (data) => (
        hasMetricValues(data.items) ? (
          <MetricTiles items={data.items} />
        ) : (
          <DataRows items={data.items} />
        )
      ))}
      {section("financial_pulse", 8, (data) => (
        hasMetricValues(data.items) && data.kind === "METRIC_GRID" ? (
          <MetricTiles items={data.items} />
        ) : (
          <Funnel items={data.items} />
        )
      ))}
      <div className="grid gap-4 xl:grid-cols-3">
        {section("vendor_accountability", 9, (data) => (
          <DataRows items={data.items} />
        ))}
        {section("marketing_growth", 10, (data) => (
          data.kind === "METRIC_GRID" ? (
            <MetricTiles items={data.items} />
          ) : (
            <DataRows items={data.items} />
          )
        ))}
        {section("design_status", 11, (data) => (
          data.kind === "PROGRESS" ? (
            <MilestoneProgress items={data.items} />
          ) : (
            <DataRows items={data.items} />
          )
        ))}
      </div>
      {section("ceo_notes", 12, (data) => (
        <ExecutiveNote section={data} />
      ))}
    </div>
  );
}

function TeamLayout({
  sections,
  proposalActions,
  onAction,
}: {
  sections: BriefingSection[];
  proposalActions: Record<string, ProposalActionState | undefined>;
  onAction: (id: string, action: "APPROVE" | "RETRY") => void;
}) {
  const byId = (id: string) => sections.find((section) => section.id === id);
  const s = (
    id: string,
    number: number,
    content: (data: BriefingSection) => React.ReactNode,
  ) => {
    const data = byId(id);
    return data ? (
      <Section key={id} section={data} number={number} briefingType="TEAM_CHALLENGES">
        {content(data)}
      </Section>
    ) : null;
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        {s("completed_milestones", 1, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("ceo_action_items", 2, (data) => (
          <ActionRows
            items={data.items}
            proposalActions={proposalActions}
            onAction={onAction}
          />
        ))}
        {s("next_day_decisions", 3, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("key_risks", 4, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("strategic_blockers", 5, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("financial_movements", 6, (data) => (
          <DataRows items={data.items} />
        ))}
      </div>
      {s("operational_metrics", 7, (data) => (
        <MetricTiles
          items={data.items}
          emptyLabels={["Revenue", "Active Project", "Gross Margin", "Burn Rate"]}
          iconSet="TEAM"
        />
      ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {s("vendor_performance", 8, (data) => (
          <Donut items={data.items} />
        ))}
        {s("priority_alignment", 9, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("team_accountability", 10, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("escalations", 11, (data) => (
          <DataRows items={data.items} />
        ))}
      </div>
      {s("ceo_notes", 12, (data) => (
        <ExecutiveNote section={data} />
      ))}
    </div>
  );
}

function WeeklyLayout({
  content,
  sections,
}: {
  content: NonNullable<ExecutiveBriefing["content"]>;
  sections: BriefingSection[];
}) {
  const byId = (id: string) => sections.find((section) => section.id === id);
  const s = (
    id: string,
    number: number,
    child: (data: BriefingSection) => React.ReactNode,
  ) => {
    const data = byId(id);
    return data ? (
      <Section key={id} section={data} number={number} briefingType="WEEKLY_REVIEW">
        {child(data)}
      </Section>
    ) : null;
  };
  return (
    <div className="space-y-4">
      <Section
        section={{
          id: "executive_summary",
          title: "Executive Summary",
          kind: "TEXT",
          availability: "AVAILABLE",
          summary: "",
          items: [],
        }}
        number={1}
        briefingType="WEEKLY_REVIEW"
      >
        <div className="rounded-2xl bg-[#F5F7FF] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(91,156,213,0.08)]">
                <Image
                  src="/executive-briefings/weekly-chat-summary.svg"
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
              </span>
              <h3 className="font-medium">Chat Summary</h3>
            </div>
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(244,190,94,0.15)]">
              <Image
                src="/executive-briefings/weekly-warning.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
              />
            </span>
          </div>
          <p className="mt-2.5 text-sm text-[#667085]">{content.summary}</p>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {content.headlineMetrics.slice(0, 4).map((metric) => (
            <div
              key={metric.key}
              className="min-h-[58px] rounded-2xl bg-[#F5F7FF] p-2.5 text-center"
            >
              <p className="text-xs text-[#667085]">{metric.label}</p>
              <p className="mt-1 font-semibold text-[#5B7FF0]">
                {valueWithUnit(metric.value, metric.unit)}
              </p>
            </div>
          ))}
        </div>
      </Section>
      {s("roi_efficiency", 2, (data) => (
        <MetricTiles
          items={data.items}
          emptyLabels={["Cost Savings", "Hours Saved", "Productivity Lift", "Automation Impact"]}
          iconSet="WEEKLY_ROI"
        />
      ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {s("sales_revenue", 3, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("client_health", 4, (data) => (
          <DataRows items={data.items} />
        ))}
      </div>
      {s("delivery_milestones", 5, (data) => (
        <MilestoneProgress items={data.items} />
      ))}
      {s("marketing_growth", 6, (data) => (
        <MetricTiles
          items={data.items}
          emptyLabels={["Funnel Performance", "Leads Generate", "Campaign result", "Social Mentions", "Brand Momentum"]}
          columns="sm:grid-cols-5"
          iconSet="WEEKLY_MARKETING"
        />
      ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {s("product_creative", 7, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("ai_system_health", 8, (data) => (
          hasMetricValues(data.items) ? (
            <MetricTiles items={data.items} />
          ) : (
            <DataRows items={data.items} />
          )
        ))}
        {s("financial_movements", 9, (data) => (
          <DataRows items={data.items} />
        ))}
        {s("vendor_performance", 10, (data) => (
          <Donut items={data.items} />
        ))}
      </div>
      {s("strategic_shift", 11, (data) => (
        <DataRows items={data.items} />
      ))}
      {s("ceo_notes", 12, (data) => (
        <ExecutiveNote section={data} />
      ))}
    </div>
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
      const result = (await response
        .json()
        .catch(() => ({}))) as ApiEnvelope<T>;
      if (!response.ok || !result.success) {
        throw new Error(
          messageOf(result, "Unable to load the executive briefing."),
        );
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
    const pendingBriefings = (
      Object.entries(briefings) as Array<[BriefingType, BriefingUiState]>
    ).flatMap(([type, state]) => {
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

    const timeout = window.setTimeout(
      () => {
        void Promise.all(
          pendingBriefings.map(
            ({ type, briefingId, preserveExistingReadyBriefing }) =>
              loadById(type, briefingId, preserveExistingReadyBriefing),
          ),
        );
      },
      Math.min(
        ...pendingBriefings.map(({ pollAfterMs }) => pollAfterMs ?? 2_000),
      ),
    );

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
  return (
    <>
      <section className="rounded-xl bg-white p-2.5">
        <h2 className="border-b border-[#E4EAF8] pb-3.5 text-[0.9375rem]/[1.5rem] font-medium">
          Quick Actions
        </h2>
        <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
          {briefingOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => selectBriefing(option.type)}
              disabled={!canManageBriefings || briefings[option.type].loading}
              className={`flex h-8 items-center pr-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 ${activeType === option.type ? "bg-[#F5F7FF] before:mr-2.5 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "px-2.5"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-3.5 rounded-2xl bg-white p-3.5">
        {sessionStatus === "loading" || active.loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-[#5B7FF0]" />
            <p className="mt-2.5 font-medium">Loading executive briefing…</p>
          </div>
        ) : !canManageBriefings ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-[#B54708]" />
            <p className="mt-2.5 font-medium">
              Executive briefings are restricted
            </p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">
              Only workspace owners and administrators can view or action
              executive briefings.
            </p>
          </div>
        ) : active.error ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-[#EF4444]" />
            <p className="mt-2.5 font-medium">Briefing could not be loaded</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">
              {active.error}
            </p>
            <button
              type="button"
              onClick={() => void loadLatest(activeType)}
              className="mt-3.5 inline-flex rounded-lg bg-[#5B7FF0] px-3.5 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : isWaiting ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Clock3 className="size-8 text-[#5B7FF0]" />
            <p className="mt-2.5 font-medium">Your briefing is being prepared</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">
              We&apos;ll refresh this page automatically when it is ready.
            </p>
          </div>
        ) : !content ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <FileText className="size-8 text-[#8B93B8]" />
            <p className="mt-2.5 font-medium">No briefing is available yet</p>
            <p className="mt-1 max-w-lg text-sm text-[#8B93B8]">
              Generate the latest briefing for this view to see grounded
              updates.
            </p>
            <button
              type="button"
              onClick={() => void generate(activeType)}
              className="mt-3.5 inline-flex items-center gap-2 rounded-lg bg-[#5B7FF0] px-3.5 py-2 text-sm font-medium text-white"
            >
              <Sparkles className="size-4" /> Generate briefing
            </button>
          </div>
        ) : (
          <>
            {activeType === "TODAY" ? (
              <TodayLayout
                sections={content.sections}
                proposalActions={proposalActions}
                onAction={runProposalAction}
              />
            ) : activeType === "TEAM_CHALLENGES" ? (
              <TeamLayout
                sections={content.sections}
                proposalActions={proposalActions}
                onAction={runProposalAction}
              />
            ) : (
              <WeeklyLayout content={content} sections={content.sections} />
            )}
          </>
        )}
      </div>
    </>
  );
}
