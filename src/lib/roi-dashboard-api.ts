export type RoiRange = "7_DAYS" | "30_DAYS" | "90_DAYS";
export type Availability = "AVAILABLE" | "UNAVAILABLE";

export type Comparison = { current: number; previous: number; changePercent: number | null };
export type RoiConfiguration = {
  organizationId: string; methodologyVersion: string;
  source: "PLATFORM_DEFAULT" | "ORGANIZATION_OVERRIDE"; isEstimated: true;
  taskCreationMinutes: number; meetingSchedulingMinutes: number;
  crmUpdateMinutes: number; emailDraftMinutes: number;
  hourlyLaborCost: number; currency: string; updatedAt: string | null;
};
export type RoiCategory = {
  key: string; label: string; availability: Availability; count: number | null;
  minutesPerAction?: number; minutesSaved: number | null; hoursSaved: number | null;
  moneySaved: number | null; currency: string; isEstimated: true; reason?: string;
};
export type RoiDashboard = {
  organization: { id: string; name: string }; asOf: string; timezone: string;
  configuration: RoiConfiguration;
  range: { key: RoiRange; start: string; end: string; days: number };
  cards: {
    tasksAutomated: { availability: Availability; total: number; isEstimated: false; comparison: Comparison };
    meetingsAutoScheduled: { availability: Availability; total: number; isEstimated: false; comparison: Comparison };
    hoursSaved: { availability: Availability; value: number; minutes: number; isEstimated: true; comparison: Comparison };
    moneySaved: { availability: Availability; amount: number; currency: string; isEstimated: true; comparison: Comparison };
  };
  projection: { availability: Availability; period: string; method: string; historyDays: number; projectedMinutesSaved: number; projectedHoursSaved: number; projectedMoneySaved: number; currency: string; isEstimated: true };
  savingsTrend: Array<{ date: string; counts: Record<string, number>; minutesSaved: number; hoursSaved: number; moneySaved: number; currency: string; isEstimated: true }>;
  growthOverview: {
    tasksAutomated: Array<{ date: string; value: number }>;
    meetingsAutoScheduled: Array<{ date: string; value: number }>;
    comparison: { tasksAutomated: Comparison; meetingsAutoScheduled: Comparison };
  };
  tasksByAgent: { availability: Availability; total: number; averageScore: { availability: Availability; value: number | null; reason?: string }; items: Array<{ agentId: string; agentName: string; agentType: string; count: number; percentage: number }> };
  timeSavedByCategory: RoiCategory[];
  savingsBreakdown: { availability: Availability; currency: string; isEstimated: true; items: RoiCategory[]; totalMinutesSaved: number; totalHoursSaved: number; totalMoneySaved: number };
  crmRevenue: { availability: Availability; currencies?: Array<{ currency: string; totalAmount: number; dealCount: number; items?: unknown[] }>; attribution: "NONE"; notice: string; reason?: string };
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string | string[] };
export type RoiSettingsInput = Pick<RoiConfiguration, "taskCreationMinutes" | "meetingSchedulingMinutes" | "crmUpdateMinutes" | "emailDraftMinutes" | "hourlyLaborCost" | "currency">;

function url(path: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("Backend API URL is not configured.");
  return `${base}${path}`;
}

async function jsonRequest<T>(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(url(path), { ...init, cache: "no-store", headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...init.headers } });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | T | null;
  const envelope = body as ApiEnvelope<T> | null;
  if (!response.ok || (envelope && envelope.success === false)) {
    const message = envelope?.message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || "Unable to load ROI data.");
  }
  if (envelope && "data" in envelope) return envelope.data as T;
  return body as T;
}

export const getRoiDashboard = (token: string, range: RoiRange) => jsonRequest<RoiDashboard>(`/roi-dashboard?${new URLSearchParams({ range })}`, token);
export const getRoiSettings = (token: string) => jsonRequest<RoiConfiguration>("/roi-dashboard/settings", token);
export const updateRoiSettings = (token: string, input: RoiSettingsInput) => jsonRequest<RoiConfiguration>("/roi-dashboard/settings", token, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });

export async function downloadRoiReport(token: string, range: RoiRange) {
  const response = await fetch(url(`/roi-dashboard/report?${new URLSearchParams({ range })}`), { headers: { Accept: "application/pdf", Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as ApiEnvelope<never> | null;
    const message = error?.message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || "Unable to download the ROI report.");
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error("The downloaded report is empty.");
  const disposition = response.headers.get("content-disposition");
  const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || "noltra-roi-report.pdf";
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = objectUrl; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(objectUrl);
}
