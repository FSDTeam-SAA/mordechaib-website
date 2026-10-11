export type NotificationReadStatus = "ALL" | "UNREAD" | "READ";

export type NotificationType =
  | "AGENT_TASK_COMPLETED"
  | "MEETING_REMINDER"
  | "WEEKLY_ROI_REPORT"
  | "PRODUCT_UPDATE";

export type DashboardNotification = {
  id: string;
  actionUrl?: string;
  createdAt: string;
  message: string;
  metadata: Record<string, unknown>;
  readAt?: string;
  title: string;
  type: NotificationType;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type NotificationsPage = {
  items: DashboardNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  pages: number;
};

type NotificationQuery = {
  status?: NotificationReadStatus;
  type?: NotificationType;
  page?: number;
  limit?: number;
};

function apiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "Unable to complete the notification request.",
    );
  }

  return result.data;
}

export function getNotifications(
  accessToken: string,
  { status = "ALL", type, page = 1, limit = 20 }: NotificationQuery = {},
) {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });
  if (type) params.set("type", type);

  return request<NotificationsPage>(
    `/notifications?${params.toString()}`,
    accessToken,
  );
}

export function getUnreadNotificationCount(accessToken: string) {
  return request<{ unreadCount: number }>(
    "/notifications/unread-count",
    accessToken,
  );
}

export function markAllNotificationsRead(accessToken: string) {
  return request<{ updatedCount: number }>(
    "/notifications/read-all",
    accessToken,
    {
      method: "PATCH",
    },
  );
}

export function setNotificationReadState(
  accessToken: string,
  notificationId: string,
  read: boolean,
) {
  const state = read ? "read" : "unread";
  return request<DashboardNotification>(
    `/notifications/${encodeURIComponent(notificationId)}/${state}`,
    accessToken,
    { method: "PATCH" },
  );
}
