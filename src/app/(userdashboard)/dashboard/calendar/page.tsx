"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CalendarBoard } from "./_components/CalendarBoard";
import { CalendarDashboardSkeleton } from "./_components/CalendarDashboardSkeleton";
import { CalendarSidebar } from "./_components/CalendarSidebar";
import { CalendarStats } from "./_components/CalendarStats";
import { ConflictIntegration } from "./_components/ConflictIntegration";
import { MeetingsTable } from "./_components/MeetingsTable";
import { PriorityAutomation } from "./_components/PriorityAutomation";
import { NewMeetingModal } from "./_components/NewMeetingModal";
import type { CalendarDashboard, CalendarFilters } from "./_components/types";

type DashboardResponse = { success?: boolean; data?: CalendarDashboard; message?: string | string[] };
type CalendarConnection = {
  provider: "GOOGLE_CALENDAR" | "OUTLOOK_CALENDAR";
  connected: boolean;
  status: string;
  isDefault: boolean;
};
type CalendarConnectionsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    defaultProvider?: "GOOGLE_CALENDAR" | "OUTLOOK_CALENDAR";
    connections?: CalendarConnection[];
  };
};

function monthRange(date: Date) {
  return {
    from: new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)).toISOString(),
    to: new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1)).toISOString(),
  };
}

function dayRange(date: Date) {
  return {
    from: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString(),
    to: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)).toISOString(),
  };
}

function messageOf(result: { message?: string | string[] }) {
  return Array.isArray(result.message) ? result.message.join(", ") : result.message || "Unable to load calendar dashboard.";
}

function CalendarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isNewMeetingParam =
    searchParams.get("newMeeting") === "true" ||
    searchParams.get("action") === "new-meeting";
  const initialEmail = searchParams.get("email") || "";
  const initialName = searchParams.get("name") || "";
  const initialTitleParam =
    searchParams.get("title") ||
    (initialName ? `Meeting with ${initialName}` : "");

  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

  useEffect(() => {
    if (isNewMeetingParam) {
      setIsRedirectModalOpen(true);
    }
  }, [isNewMeetingParam]);

  const handleCloseRedirectModal = (nextOpen: boolean) => {
    setIsRedirectModalOpen(nextOpen);
    if (!nextOpen && isNewMeetingParam) {
      router.replace(pathname, { scroll: false });
    }
  };

  const { data: session, status } = useSession();
  const accessToken = session?.user.accessToken;
  const [filters, setFilters] = useState<CalendarFilters>(() => ({
    date: new Date(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    bufferMinutes: 15,
    upcomingLimit: 8,
    conflictLimit: 20,
  }));
  const [selectedRangeDate, setSelectedRangeDate] = useState<Date | null>(null);
  const [calendarProvider, setCalendarProvider] = useState<"GOOGLE" | "OUTLOOK">("GOOGLE");
  const range = selectedRangeDate ? dayRange(selectedRangeDate) : monthRange(filters.date);

  const connectionsQuery = useQuery({
    queryKey: ["calendar-connections"],
    enabled: status === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/connections`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response.json().catch(() => ({}))) as CalendarConnectionsResponse;
      if (!response.ok || !result.success || !result.data) throw new Error(messageOf(result));
      return result.data;
    },
  });

  useEffect(() => {
    if (!connectionsQuery.data) return;

    const defaultConnection = connectionsQuery.data.connections?.find(
      (connection) => connection.connected && connection.isDefault,
    );
    const defaultProvider =
      defaultConnection?.provider ?? connectionsQuery.data.defaultProvider;

    if (defaultProvider === "OUTLOOK_CALENDAR") {
      setCalendarProvider("OUTLOOK");
    } else if (defaultProvider === "GOOGLE_CALENDAR") {
      setCalendarProvider("GOOGLE");
    }
  }, [connectionsQuery.data]);

  const dashboardQuery = useQuery({
    queryKey: [
      "calendar-dashboard",
      range.from,
      range.to,
      filters.timezone,
      filters.bufferMinutes,
      filters.upcomingLimit,
      filters.conflictLimit,
    ],
    enabled: status === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        timezone: filters.timezone,
        bufferMinutes: String(filters.bufferMinutes),
        upcomingLimit: String(filters.upcomingLimit),
        conflictLimit: String(filters.conflictLimit),
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/dashboard?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response.json().catch(() => ({}))) as DashboardResponse;
      if (!response.ok || !result.success || !result.data) throw new Error(messageOf(result));
      return result.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const provider = calendarProvider === "OUTLOOK" ? "OUTLOOK_CALENDAR" : "GOOGLE_CALENDAR";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ provider, from: range.from, to: range.to }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
      };
      if (!response.ok || result.success === false) {
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(
          message || `Unable to sync ${calendarProvider === "OUTLOOK" ? "Outlook" : "Google"} Calendar.`,
        );
      }
      return result;
    },
    onSuccess: async (result) => {
      const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
      toast.success(
        message || `${calendarProvider === "OUTLOOK" ? "Outlook" : "Google"} Calendar synced successfully.`,
      );
      await dashboardQuery.refetch();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to sync calendar."),
  });

  const defaultCalendarMutation = useMutation({
    mutationFn: async (provider: "GOOGLE" | "OUTLOOK") => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider === "OUTLOOK" ? "OUTLOOK_CALENDAR" : "GOOGLE_CALENDAR" }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
      };
      if (!response.ok || result.success === false) {
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(message || "Unable to update the default calendar.");
      }
      return { provider, result };
    },
    onMutate: (provider) => {
      const previousProvider = calendarProvider;
      setCalendarProvider(provider);
      return { previousProvider };
    },
    onSuccess: ({ provider, result }) => {
      const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
      toast.success(message || `${provider === "OUTLOOK" ? "Outlook" : "Google"} Calendar set as default.`);
    },
    onError: (error, _provider, context) => {
      if (context?.previousProvider) setCalendarProvider(context.previousProvider);
      toast.error(error instanceof Error ? error.message : "Unable to update the default calendar.");
    },
  });

  if (status === "loading" || dashboardQuery.isPending || connectionsQuery.isPending) {
    return (
      <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5">
        <CalendarDashboardSkeleton />
        {isRedirectModalOpen && (
          <NewMeetingModal
            open={isRedirectModalOpen}
            onOpenChange={handleCloseRedirectModal}
            initialInvitees={initialEmail ? [initialEmail] : []}
            initialTitle={initialTitleParam}
            onScheduled={() => {
              handleCloseRedirectModal(false);
              void dashboardQuery.refetch();
            }}
          />
        )}
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5">
        <div className="flex min-h-56 flex-col items-center justify-center rounded-[12px] bg-white p-5 text-center">
          <AlertCircle className="size-10 text-[#EF4444]" />
          <h2 className="mt-2.5 text-[1.0625rem]/[1.75rem] font-semibold">Calendar could not be loaded</h2>
          <p className="mt-1 max-w-md text-sm text-[#8B93B8]">
            {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => void dashboardQuery.refetch()}
            className="mt-[1.125rem] flex h-10 items-center gap-2 rounded-[8px] bg-[#5B7FF0] px-[1.125rem] text-sm text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const providerMeetings = dashboard.items.filter((meeting) => {
    const provider = `${meeting.provider || ""} ${meeting.sourceType || ""}`.toUpperCase();
    return calendarProvider === "GOOGLE"
      ? provider.includes("GOOGLE")
      : provider.includes("OUTLOOK") || provider.includes("MICROSOFT") || provider.includes("OFFICE");
  });
  const providerSummary = {
    ...dashboard.summary,
    total: providerMeetings.length,
    scheduled: providerMeetings.filter((meeting) => meeting.status === "SCHEDULED").length,
    completed: providerMeetings.filter((meeting) => meeting.status === "COMPLETED").length,
    cancelled: providerMeetings.filter((meeting) => meeting.status === "CANCELLED").length,
    failed: providerMeetings.filter((meeting) => meeting.status === "FAILED").length,
  };

  return (
    <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4">
      <CalendarStats summary={providerSummary} />
      <section className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 xl:col-span-9">
          <CalendarBoard
            meetings={providerMeetings}
            filters={filters}
            provider={calendarProvider}
            onProviderChange={(provider) => {
              if (!defaultCalendarMutation.isPending && provider !== calendarProvider)
                defaultCalendarMutation.mutate(provider);
            }}
            onFiltersChange={(value) => {
              setFilters(value);
              setSelectedRangeDate(null);
            }}
            onDateSelect={(date) => {
              setFilters((current) => ({ ...current, date }));
              setSelectedRangeDate(date);
            }}
          />
        </div>
        <div className="col-span-12 xl:col-span-3">
          <CalendarSidebar
            meetings={providerMeetings}
            upcoming={dashboard.upcoming.filter((meeting) =>
              providerMeetings.some((item) => item.id === meeting.id),
            )}
            selectedDate={filters.date}
            timezone={dashboard.timezone}
            onRefresh={() => syncMutation.mutate()}
            isRefreshing={syncMutation.isPending || dashboardQuery.isFetching}
          />
        </div>
      </section>
      <ConflictIntegration
        conflicts={dashboard.conflicts}
        taskAndCalls={dashboard.taskAndCalls}
        timezone={dashboard.timezone}
      />
      <PriorityAutomation
        priority={dashboard.priority}
        automation={dashboard.automation}
      />
      <MeetingsTable
        meetings={providerMeetings}
        timezone={dashboard.timezone}
        onMeetingUpdated={() => dashboardQuery.refetch()}
      />
      {isRedirectModalOpen && (
        <NewMeetingModal
          open={isRedirectModalOpen}
          onOpenChange={handleCloseRedirectModal}
          initialInvitees={initialEmail ? [initialEmail] : []}
          initialTitle={initialTitleParam}
          onScheduled={() => {
            handleCloseRedirectModal(false);
            void dashboardQuery.refetch();
          }}
        />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5">
          <CalendarDashboardSkeleton />
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}
