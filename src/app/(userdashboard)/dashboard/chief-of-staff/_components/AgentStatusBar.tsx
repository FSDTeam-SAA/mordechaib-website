"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";

type WorkforceAgent = {
  id: string;
  type: string;
  status: string;
  runtimeStatus?: string | null;
};

type WorkforceResponse = {
  success?: boolean;
  message?: string | string[];
  data?: { items?: WorkforceAgent[] };
};

function messageOf(result: Pick<WorkforceResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load agent status.";
}

function labelOf(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusStyle(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE" || normalized === "SUCCEEDED") {
    return "text-[#10B981] before:bg-[#10B981]";
  }
  if (normalized === "WORKING" || normalized === "PENDING") {
    return "text-[#F59E0B] before:bg-[#F59E0B]";
  }
  return "text-[#8B93B8] before:bg-[#8B93B8]";
}

function AgentStatusSkeleton() {
  return (
    <div className="mt-4 rounded-lg border border-[#E4EAF8] bg-[#FAFBFF] p-3" aria-busy="true" aria-label="Loading agent status">
      <div className="flex items-center gap-2 text-xs text-[#667085]">
        <Loader2 className="size-4 animate-spin text-[#5B7FF0]" />
        Checking your AI workforce...
      </div>
      <div className="mt-3 flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-8 w-36 shrink-0 animate-pulse rounded-lg bg-[#EAF0FF]" />
        ))}
      </div>
    </div>
  );
}

export function AgentStatusBar() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const workforceQuery = useQuery({
    queryKey: ["organizer-dashboard", "workforce", "chief-of-staff", 1, 20, 24],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");

      const params = new URLSearchParams({ page: "1", limit: "20", activityHours: "24" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/workforce?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
      );
      const result = (await response.json().catch(() => ({}))) as WorkforceResponse;
      if (!response.ok || !result.success) throw new Error(messageOf(result));
      return result.data?.items || [];
    },
  });

  const agents = workforceQuery.data || [];
  const errorMessage = workforceQuery.error instanceof Error
    ? workforceQuery.error.message
    : "Please check your connection and try again.";

  return (
    <section className="rounded-lg bg-white p-3" aria-label="Agent status">
      <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">Agent Status</h2>

      {sessionStatus === "loading" || workforceQuery.isLoading ? <AgentStatusSkeleton /> : null}

      {workforceQuery.isError ? (
        <div className="mt-4 flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3" role="alert">
          <div className="flex min-w-0 items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#EF4444]" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#B42318]">Agent status could not be loaded</p>
              <p className="mt-0.5 truncate text-xs text-[#B54708]">{errorMessage}</p>
            </div>
          </div>
          <button type="button" onClick={() => void workforceQuery.refetch()} className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-[#5B7FF0] shadow-sm transition-colors hover:bg-[#F5F7FF]">
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : null}

      {!workforceQuery.isLoading && !workforceQuery.isError && sessionStatus !== "loading" ? (
        agents.length ? (
          <div className="mt-4 flex gap-3 overflow-x-auto overscroll-x-contain pb-1" aria-live="polite">
            {agents.map((agent) => {
              const status = agent.runtimeStatus || agent.status || "UNKNOWN";
              return (
                <div key={agent.id} className="flex shrink-0 items-center rounded-lg bg-[#F5F7FF] px-3 py-2 text-xs">
                  <span>{labelOf(agent.type)} Agent</span>
                  <span className={`ml-[18px] inline-flex items-center gap-1.5 before:size-1.5 before:rounded-full ${statusStyle(status)}`}>
                    {labelOf(status)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : <div className="mt-4 flex min-h-[76px] items-center gap-3 rounded-lg border border-dashed border-[#CBD5EE] bg-[#FAFBFF] p-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0FF] text-[#5B7FF0]"><UsersRound className="size-5" /></span><div><p className="text-sm font-medium text-[#252B48]">No agents found</p><p className="mt-0.5 text-xs text-[#8B93B8]">AI agents will appear here once they are available for your workspace.</p></div></div>
      ) : null}
    </section>
  );
}
