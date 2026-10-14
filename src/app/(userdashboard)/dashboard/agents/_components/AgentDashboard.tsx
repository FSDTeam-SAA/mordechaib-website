"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AgentDashboardResponse } from "./agentDashboardTypes";
import { AgentDashboardContent } from "./AgentDashboardContent";
export function AgentDashboard({ activeAgentId }: { activeAgentId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;
  const dashboardQuery = useQuery<
    NonNullable<AgentDashboardResponse["data"]>,
    Error
  >({
    queryKey: ["agent-workforce-dashboard"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/agent-workforce/dashboard`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as AgentDashboardResponse;

      if (!response.ok || !result.success || !result.data) {
        const message = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message;
        throw new Error(message || "Unable to load the agent dashboard.");
      }

      return result.data;
    },
  });

  if (sessionStatus === "loading" || dashboardQuery.isLoading) {
    return <AgentDashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <AgentDashboardError
        message={dashboardQuery.error.message}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data;
  if (!data) {
    return <AgentDashboardError message="No dashboard data is available." />;
  }

  const active = data.items.some((agent) => agent.id === activeAgentId)
    ? activeAgentId
    : (data.items[0]?.id ?? "");
  return <AgentDashboardContent data={data} activeAgentId={active} />;
}

function AgentDashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-[calc(100vh-83px)] items-center justify-center bg-[#F5F7FF] p-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center">
        <AlertCircle className="mx-auto size-10 text-red-500" />
        <h1 className="mt-3 text-xl font-semibold">
          Could not load agent dashboard
        </h1>
        <p className="mt-2 text-sm text-[#8B93B8]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-[#5B7FF0] px-4 py-2 text-sm font-medium text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        )}
      </div>
    </main>
  );
}

function AgentDashboardSkeleton() {
  return <main className="min-h-[calc(100vh-83px)] space-y-4 bg-[#F5F7FF] p-3 sm:p-4" aria-busy="true"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] animate-pulse rounded-lg bg-white" />)}</div><div className="grid gap-4 lg:grid-cols-[396px_1fr]"><div className="h-[600px] animate-pulse rounded-2xl bg-white" /><div className="h-[780px] animate-pulse rounded-2xl bg-white" /></div></main>;
}
