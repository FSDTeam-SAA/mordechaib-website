"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type ResponseStyle = "PROFESSIONAL" | "CASUAL" | "CONCISE";

type AIAgentPreferences = {
  autoApproveLowRiskActions: boolean;
  learningMode: boolean;
  agentActivityNotifications: boolean;
};

type AISettings = AIAgentPreferences & {
  organizationId: string;
  responseStyle: ResponseStyle;
};

type AISettingsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: AISettings;
};

type PreferenceKey = keyof AIAgentPreferences;

type AISettingsValues = AIAgentPreferences & {
  responseStyle: ResponseStyle;
};

const agentPreferences: ReadonlyArray<
  readonly [PreferenceKey, string, string]
> = [
  [
    "autoApproveLowRiskActions",
    "Auto-approve low-risk actions",
    "Automatically approve simple CRM updates without review",
  ],
  [
    "learningMode",
    "AI learning mode",
    "Let agents learn from your approvals and rejections",
  ],
  [
    "agentActivityNotifications",
    "Agent activity notifications",
    "Notify me when agents complete tasks",
  ],
];

const responseStyles: ReadonlyArray<
  readonly [ResponseStyle, string]
> = [
  ["PROFESSIONAL", "Professional"],
  ["CASUAL", "Casual"],
  ["CONCISE", "Concise"],
];

const initialPreferences: AIAgentPreferences = {
  autoApproveLowRiskActions: false,
  learningMode: false,
  agentActivityNotifications: false,
};

function getMessage(result: AISettingsResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

export function AIAgentSettings() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [enabled, setEnabled] =
    useState<AIAgentPreferences>(initialPreferences);
  const [responseStyle, setResponseStyle] =
    useState<ResponseStyle>("PROFESSIONAL");

  const settingsQuery = useQuery({
    queryKey: ["ai-settings", session?.user.organizationId],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    retry: false,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings/ai`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as AISettingsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load AI agent settings"));
      }

      return result.data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({
      nextSettings,
    }: {
      nextSettings: AISettingsValues;
      previousSettings: AISettingsValues;
    }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings/ai`,
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
        .catch(() => ({}))) as AISettingsResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to update AI agent settings"));
      }

      return result;
    },
    onSuccess: (result, variables) => {
      const nextSettings: AISettingsValues = result.data
        ? {
            autoApproveLowRiskActions:
              result.data.autoApproveLowRiskActions,
            learningMode: result.data.learningMode,
            agentActivityNotifications:
              result.data.agentActivityNotifications,
            responseStyle: result.data.responseStyle,
          }
        : variables.nextSettings;

      setEnabled({
        autoApproveLowRiskActions: nextSettings.autoApproveLowRiskActions,
        learningMode: nextSettings.learningMode,
        agentActivityNotifications: nextSettings.agentActivityNotifications,
      });
      setResponseStyle(nextSettings.responseStyle);
      queryClient.setQueryData<AISettings>(
        ["ai-settings", session?.user.organizationId],
        (current) => ({
          organizationId:
            current?.organizationId ?? session?.user.organizationId ?? "",
          ...nextSettings,
        })
      );
      toast.success(getMessage(result, "AI agent settings updated successfully."));
    },
    onError: (error, variables) => {
      setEnabled({
        autoApproveLowRiskActions:
          variables.previousSettings.autoApproveLowRiskActions,
        learningMode: variables.previousSettings.learningMode,
        agentActivityNotifications:
          variables.previousSettings.agentActivityNotifications,
      });
      setResponseStyle(variables.previousSettings.responseStyle);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update AI agent settings"
      );
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setEnabled({
      autoApproveLowRiskActions:
        settingsQuery.data.autoApproveLowRiskActions,
      learningMode: settingsQuery.data.learningMode,
      agentActivityNotifications:
        settingsQuery.data.agentActivityNotifications,
    });
    setResponseStyle(settingsQuery.data.responseStyle);
  }, [settingsQuery.data]);

  useEffect(() => {
    if (settingsQuery.error) {
      toast.error(
        settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : "Unable to load AI agent settings"
      );
    }
  }, [settingsQuery.error]);

  const isLoading = sessionStatus === "loading" || settingsQuery.isLoading;

  const getCurrentSettings = (): AISettingsValues => ({
    ...enabled,
    responseStyle,
  });

  const handlePreferenceToggle = (key: PreferenceKey) => {
    if (updateSettings.isPending) return;

    const previousSettings = getCurrentSettings();
    const nextSettings = {
      ...previousSettings,
      [key]: !previousSettings[key],
    };

    setEnabled((current) => ({ ...current, [key]: !current[key] }));
    updateSettings.mutate({ nextSettings, previousSettings });
  };

  const handleResponseStyleChange = (value: ResponseStyle) => {
    if (updateSettings.isPending || value === responseStyle) return;

    const previousSettings = getCurrentSettings();
    const nextSettings = { ...previousSettings, responseStyle: value };

    setResponseStyle(value);
    updateSettings.mutate({ nextSettings, previousSettings });
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">
          AI Agent Settings
        </h2>
      </header>

      <div className="space-y-2 p-4">
        {agentPreferences.map(([key, title, description]) => (
          <div
            key={key}
            className="flex min-h-[62px] items-center justify-between gap-4 py-2"
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
                onClick={() => handlePreferenceToggle(key)}
                disabled={updateSettings.isPending}
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

        <div className="pt-2">
          <h3 className="mb-3 text-base font-medium text-[#0E1224]">
            AI Response Style
          </h3>
          <div
            className="grid gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="AI response style"
          >
            {responseStyles.map(([value, label]) =>
              isLoading ? (
                <Skeleton
                  key={value}
                  className="h-12 rounded-[8px] bg-[#F5F7FF]"
                />
              ) : (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={responseStyle === value}
                  onClick={() => handleResponseStyleChange(value)}
                  disabled={updateSettings.isPending}
                  className={`flex h-12 items-center gap-2 rounded-[8px] border px-3 text-left text-sm transition-colors ${
                    responseStyle === value
                      ? "border-[#5B7FF0] bg-[#5B7FF0]/10 text-[#5B7FF0]"
                      : "border-transparent bg-[#F5F7FF] text-[#0E1224]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <Image
                    src="/settings/ai-settings.svg"
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className="size-5"
                  />
                  <span className="truncate">{label}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
