"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationSettings = {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  agentTaskCompletions: boolean;
  meetingReminders: boolean;
  weeklyRoiReports: boolean;
  productUpdates: boolean;
};

type PreferenceKey = Exclude<keyof NotificationSettings, "userId">;

type NotificationSettingsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: NotificationSettings;
};

const preferences: ReadonlyArray<
  readonly [PreferenceKey, string, string]
> = [
  [
    "emailNotifications",
    "Email notifications",
    "Get notified by email for important events",
  ],
  [
    "inAppNotifications",
    "In-app notifications",
    "Show notifications within the dashboard",
  ],
  [
    "agentTaskCompletions",
    "Agent task completions",
    "When an AI agent finishes a task",
  ],
  [
    "meetingReminders",
    "Meeting reminders",
    "Reminders 1 hour before scheduled meetings",
  ],
  [
    "weeklyRoiReports",
    "Weekly ROI report",
    "Receive your weekly savings summary",
  ],
  [
    "productUpdates",
    "Product updates & news",
    "New features and Noltra announcements",
  ],
];

const initialPreferences: Record<PreferenceKey, boolean> = {
  emailNotifications: false,
  inAppNotifications: false,
  agentTaskCompletions: false,
  meetingReminders: false,
  weeklyRoiReports: false,
  productUpdates: false,
};

function getMessage(result: NotificationSettingsResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function toPreferenceState(
  settings: NotificationSettings
): Record<PreferenceKey, boolean> {
  return {
    emailNotifications: settings.emailNotifications,
    inAppNotifications: settings.inAppNotifications,
    agentTaskCompletions: settings.agentTaskCompletions,
    meetingReminders: settings.meetingReminders,
    weeklyRoiReports: settings.weeklyRoiReports,
    productUpdates: settings.productUpdates,
  };
}

export function NotificationPreferences() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [enabled, setEnabled] =
    useState<Record<PreferenceKey, boolean>>(initialPreferences);

  const settingsQuery = useQuery({
    queryKey: ["notification-settings", session?.user.id],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    retry: false,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings/notifications`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as NotificationSettingsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          getMessage(result, "Unable to load notification preferences")
        );
      }

      return result.data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async ({
      nextSettings,
    }: {
      nextSettings: Record<PreferenceKey, boolean>;
      previousSettings: Record<PreferenceKey, boolean>;
    }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings/notifications`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nextSettings),
        }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as NotificationSettingsResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getMessage(result, "Unable to update notification preferences")
        );
      }

      return result;
    },
    onSuccess: (result, variables) => {
      const nextSettings = result.data
        ? toPreferenceState(result.data)
        : variables.nextSettings;

      setEnabled(nextSettings);
      queryClient.setQueryData<NotificationSettings>(
        ["notification-settings", session?.user.id],
        (current) => ({
          userId: current?.userId ?? session?.user.id ?? "",
          ...nextSettings,
        })
      );
      toast.success(
        getMessage(result, "Notification preferences updated successfully.")
      );
    },
    onError: (error, variables) => {
      setEnabled(variables.previousSettings);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update notification preferences"
      );
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setEnabled(toPreferenceState(settingsQuery.data));
  }, [settingsQuery.data]);

  useEffect(() => {
    if (settingsQuery.error) {
      toast.error(
        settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : "Unable to load notification preferences"
      );
    }
  }, [settingsQuery.error]);

  const isLoading = sessionStatus === "loading" || settingsQuery.isLoading;

  const handleToggle = (key: PreferenceKey) => {
    if (updatePreferences.isPending) return;

    const nextSettings = { ...enabled, [key]: !enabled[key] };
    setEnabled(nextSettings);
    updatePreferences.mutate({
      nextSettings,
      previousSettings: enabled,
    });
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">
          Notification Preferences
        </h2>
      </header>
      <div className="px-4 py-4">
        {preferences.map(([key, title, description]) => (
          <div
            key={key}
            className="flex min-h-[62px] items-center justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <h3 className="text-base font-medium text-[#0E1224]">{title}</h3>
              <p className="mt-1 text-xs text-[#8B93B8]">{description}</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-[56px] shrink-0 rounded-full bg-[#F5F7FF]" />
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={enabled[key]}
                aria-label={`Toggle ${title}`}
                onClick={() => handleToggle(key)}
                disabled={updatePreferences.isPending}
                className={`relative h-8 w-[56px] shrink-0 rounded-full p-1 transition-colors ${
                  enabled[key] ? "bg-[#5B7FF0]" : "bg-[#C6CCE2]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${
                    enabled[key] ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
