"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CheckCheck, Mail, MailOpen, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DashboardNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  NotificationReadStatus,
  NotificationType,
  setNotificationReadState,
} from "@/lib/notifications-api";

type NotificationFilter = "All" | "Unread" | "Agent" | "ROI" | "CRM" | "System";

const filters: {
  label: NotificationFilter;
  status?: NotificationReadStatus;
  type?: NotificationType;
}[] = [
  { label: "All", status: "ALL" },
  { label: "Unread", status: "UNREAD" },
  { label: "Agent", type: "AGENT_TASK_COMPLETED" },
  { label: "ROI", type: "WEEKLY_ROI_REPORT" },
  { label: "CRM", type: "MEETING_REMINDER" },
  { label: "System", type: "PRODUCT_UPDATE" },
];

const notificationStyle: Record<
  NotificationType,
  { accent: string; label: string }
> = {
  AGENT_TASK_COMPLETED: { accent: "bg-[#36CFA2]", label: "Agent" },
  MEETING_REMINDER: { accent: "bg-[#5B7FF0]", label: "CRM" },
  WEEKLY_ROI_REPORT: { accent: "bg-[#A855F7]", label: "ROI" },
  PRODUCT_UPDATE: { accent: "bg-[#F59E0B]", label: "System" },
};

type NotificationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
};

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function dashboardPath(actionUrl?: string) {
  if (!actionUrl) return undefined;

  if (actionUrl.startsWith("/tasks/")) {
    return `/dashboard/tasks/edit-task/${actionUrl.slice("/tasks/".length)}`;
  }

  const routeMap: Record<string, string> = {
    "/roi-dashboard": "/dashboard/roll-dashboard",
    "/calendar": "/dashboard/calendar",
    "/tasks": "/dashboard/tasks",
  };
  return routeMap[actionUrl] ?? actionUrl;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const selectedFilter = filters.find(
    (filter) => filter.label === activeFilter,
  )!;
  const isAuthenticated =
    sessionStatus === "authenticated" && Boolean(accessToken);

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count", accessToken],
    enabled: isAuthenticated,
    queryFn: () => getUnreadNotificationCount(accessToken!),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications", "list", activeFilter, accessToken],
    enabled: isOpen && isAuthenticated,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getNotifications(accessToken!, {
        status: selectedFilter.status ?? "ALL",
        type: selectedFilter.type,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    staleTime: 15_000,
  });

  const invalidateNotifications = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(accessToken!),
    onSuccess: invalidateNotifications,
  });

  const updateReadStateMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      setNotificationReadState(accessToken!, id, read),
    onSuccess: invalidateNotifications,
  });

  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data],
  );

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  const handleNotificationClick = async (
    notification: DashboardNotification,
  ) => {
    if (!notification.readAt) {
      try {
        await updateReadStateMutation.mutateAsync({
          id: notification.id,
          read: true,
        });
      } catch {
        return;
      }
    }

    const actionUrl = dashboardPath(notification.actionUrl);
    if (actionUrl) {
      onClose();
      router.push(actionUrl);
    }
  };

  const toggleReadState = async (notification: DashboardNotification) => {
    try {
      await updateReadStateMutation.mutateAsync({
        id: notification.id,
        read: !notification.readAt,
      });
    } catch {
      // A successful refetch will restore the server state.
    }
  };

  if (!isOpen) return null;

  const error =
    unreadCountQuery.error ??
    notificationsQuery.error ??
    markAllReadMutation.error ??
    updateReadStateMutation.error;
  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <>
      <button
        aria-label="Close notifications"
        className="fixed inset-0 z-40 cursor-default bg-[#24315c]/10 backdrop-blur-[3px]"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label="Notifications"
        aria-modal="true"
        className="fixed right-3 top-[74px] z-50 flex w-[calc(100vw-1.5rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:right-6 sm:top-[74px]"
        id="notifications-panel"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0E1224]">
              Notifications
            </h2>
            <p className="mt-0.5 text-sm text-[#8B93B8]">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="rounded-md px-2 py-1 text-xs font-medium text-[#4F73E8] transition hover:bg-[#F0F4FF] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              type="button"
            >
              {markAllReadMutation.isPending ? "Updating..." : "Mark all read"}
            </button>
            <button
              aria-label="Close notifications"
              className="rounded-md p-1.5 text-[#8B93B8] transition hover:bg-[#F5F7FF] hover:text-[#0E1224]"
              onClick={onClose}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto border-y border-[#EDF0FB] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.label;
            const label =
              filter.label === "Unread"
                ? `Unread (${unreadCount})`
                : filter.label;

            return (
              <button
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-[#5B7FF0] text-white shadow-sm"
                    : "text-[#8B93B8] hover:bg-[#F5F7FF] hover:text-[#4F73E8]"
                }`}
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="mt-3 rounded-md bg-[#FFF1F2] px-3 py-2 text-xs text-[#C2414C]">
            {errorMessage}
          </p>
        )}

        <div className="mt-2 max-h-[min(54vh,360px)] space-y-2 overflow-y-auto pr-1">
          {notificationsQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-[#8B93B8]">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => {
              const style = notificationStyle[notification.type];
              const isRead = Boolean(notification.readAt);

              return (
                <article
                  className={`relative cursor-pointer overflow-hidden rounded-lg border border-[#EEF1FA] bg-[#F8F9FE] py-2.5 pl-3 pr-8 transition hover:bg-[#F4F6FD] ${
                    isRead ? "opacity-75" : ""
                  }`}
                  key={notification.id}
                  onClick={() => void handleNotificationClick(notification)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void handleNotificationClick(notification);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 top-0 w-[3px] ${style.accent}`}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-medium leading-5 text-[#1B2340]">
                        {notification.title}
                      </h3>
                      <span className="text-[10px] font-medium text-[#5B7FF0]">
                        {style.label}
                      </span>
                    </div>
                    <time className="shrink-0 pt-0.5 text-[10px] text-[#8B93B8]">
                      {relativeTime(notification.createdAt)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-[15px] text-[#8B93B8]">
                    {notification.message}
                  </p>
                  <button
                    aria-label={`Mark ${notification.title} as ${isRead ? "unread" : "read"}`}
                    className="absolute right-2 top-2 rounded p-1 text-[#5B7FF0] transition hover:bg-[#EAF0FF] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={updateReadStateMutation.isPending}
                    onClick={(event) => {
                      event.stopPropagation();
                      void toggleReadState(notification);
                    }}
                    type="button"
                  >
                    {isRead ? (
                      <Mail className="size-3.5" strokeWidth={1.8} />
                    ) : (
                      <MailOpen className="size-3.5" strokeWidth={1.8} />
                    )}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-[#8B93B8]">
              No notifications to show.
            </div>
          )}
        </div>

        {notificationsQuery.hasNextPage && (
          <button
            className="mt-3 flex items-center justify-center gap-1 rounded-md py-2 text-xs font-medium text-[#4F73E8] transition hover:bg-[#F5F7FF] disabled:opacity-60"
            disabled={notificationsQuery.isFetchingNextPage}
            onClick={() => notificationsQuery.fetchNextPage()}
            type="button"
          >
            <CheckCheck className="size-3.5" />
            {notificationsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </section>
    </>
  );
}
