export type AvailabilityMetric = {
  availability: string;
  value: number | null;
  reason: string;
};

export type AgentDashboardItem = {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  organizationSettings: {
    enabled: boolean;
    approvalRequired: boolean;
    concurrencyLimit: number | null;
    configured: boolean;
  };
  runtime: {
    status: string;
    latestStatus: string | null;
    latestActivityAt: string | null;
    runningJobs: number;
    staleStartedJobs: number;
    runningFreshnessMinutes: number;
  };
  capacity: {
    availability: string;
    concurrencyLimit: number | null;
    runningJobs: number;
    utilizationPercent: number | null;
    queuedJobs: AvailabilityMetric;
    retryingJobs: AvailabilityMetric;
  };
  performance: {
    jobsRun: number;
    succeededJobs: number;
    failedJobs: number;
    skippedJobs: number;
    retryAttempts: number;
    averageProcessingTimeMs: number | null;
    successRatePercent: number | null;
    proposals: {
      total: number;
      approved: number;
      rejected: number;
      executed: number;
      failed: number;
    };
    tasks: { created: number; completed: number };
  };
  compliance: AvailabilityMetric;
  revenueAttribution: AvailabilityMetric;
};

export type AgentDashboardData = {
  range: { from: string; to: string };
  measuredAt: string;
  summary: {
    agentsOnPage: number;
    enabledAgents: number;
    workingAgents: number;
    totalJobsRun: number;
    capacity: {
      availability: string;
      configuredAgents: number;
      configuredConcurrency: number | null;
      runningJobs: number;
      utilizationPercent: number | null;
      queuedJobs: AvailabilityMetric;
      retryingJobs: AvailabilityMetric;
    };
  };
  items: AgentDashboardItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AgentDashboardResponse = {
  success?: boolean;
  message?: string | string[];
  data?: AgentDashboardData;
};

export const roleLabel = (type: string) =>
  `${type.charAt(0)}${type.slice(1).toLowerCase()} Agent`;

const agentColors = [
  "#5B9CD5",
  "#06B6D4",
  "#D24FC7",
  "#5B7FF0",
  "#F59E0B",
  "#10B981",
] as const;

export const agentColor = (index: number) =>
  agentColors[index % agentColors.length];

export const formatDuration = (milliseconds: number | null) => {
  if (milliseconds === null) return "—";
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(milliseconds < 10000 ? 1 : 0)}s`;
};

export const formatMetric = (metric: AvailabilityMetric) =>
  metric.availability === "AVAILABLE" && metric.value !== null
    ? metric.value.toLocaleString()
    : "Unavailable";
