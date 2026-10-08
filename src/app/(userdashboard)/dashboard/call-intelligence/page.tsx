"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/share/Pagination";
import { CallHistoryTable } from "./_components/CallHistoryTable";
import { CallIntelligenceSkeleton } from "./_components/CallIntelligenceSkeleton";
import { CallIntelligenceToolbar } from "./_components/CallIntelligenceToolbar";
import { CallMetricCards } from "./_components/CallMetricCards";
import type { CallMetric, CallRecord } from "./_components/types";

type CallIntelligenceResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items: CallRecord[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
const pageSize = 20;
const messageOf = (result: CallIntelligenceResponse) =>
  Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load call intelligence.";

export default function CallIntelligencePage() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const callsQuery = useQuery({
    queryKey: ["call-intelligence", page, pageSize, kind, sourceType],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!accessToken)
        throw new Error("Your session is missing. Please sign in again.");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (kind) params.set("kind", kind);
      if (sourceType) params.set("sourceType", sourceType);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CallIntelligenceResponse;
      if (!response.ok || !result.success || !result.data)
        throw new Error(messageOf(result));
      return result.data;
    },
  });

  const metrics = useMemo<CallMetric[]>(() => {
    const items = callsQuery.data?.items ?? [];
    const aiAnswered = items.filter((item) => Boolean(item.botName)).length;
    const averageSeconds = items.length
      ? items.reduce((sum, item) => sum + item.durationSeconds, 0) /
        items.length
      : 0;
    return [
      {
        value: String(callsQuery.data?.total ?? 0),
        label: "Total Call",
        icon: "/call-intelligence/total-call.svg",
        chart: "/call-intelligence/total-call-chart.svg",
        iconBackground: "bg-[#F2F6FF]",
      },
      {
        value: String(aiAnswered),
        label: "AI Auto-Answered",
        icon: "/call-intelligence/ai-answered.svg",
        chart: "/call-intelligence/ai-answered-chart.svg",
        iconBackground: "bg-[#E8FAF5]",
      },
      {
        value: `${(averageSeconds / 60).toFixed(averageSeconds ? 1 : 0)} min`,
        label: "Avg Call Duration",
        icon: "/call-intelligence/duration.svg",
        chart: "/call-intelligence/duration-chart.svg",
        iconBackground: "bg-[#FFF6E7]",
      },
    ];
  }, [callsQuery.data]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return callsQuery.data?.items ?? [];
    return (callsQuery.data?.items ?? []).filter((item) =>
      [
        item.title,
        item.platform,
        item.kind,
        item.status,
        item.botName || "",
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [callsQuery.data, search]);

  if (sessionStatus === "loading" || callsQuery.isPending)
    return (
      <div className="min-h-[calc(100vh-83px)] p-4">
        <CallIntelligenceSkeleton />
      </div>
    );
  if (callsQuery.isError || !callsQuery.data)
    return (
      <div className="min-h-[calc(100vh-83px)] p-4">
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white p-6 text-center">
          <AlertCircle className="size-10 text-[#EF4444]" />
          <h2 className="mt-3 text-lg font-semibold">
            Call intelligence could not be loaded
          </h2>
          <p className="mt-1 text-sm text-[#8B93B8]">
            {callsQuery.error instanceof Error
              ? callsQuery.error.message
              : "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => void callsQuery.refetch()}
            className="mt-5 flex h-10 items-center gap-2 rounded-[12px] bg-[#5B7FF0] px-5 text-sm text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      </div>
    );

  const data = callsQuery.data;
  return (
    <div className="min-h-[calc(100vh-83px)] p-4 text-[#141936]">
      <CallMetricCards metrics={metrics} />
      <CallIntelligenceToolbar
        search={search}
        onSearchChange={setSearch}
        kind={kind}
        sourceType={sourceType}
        onKindChange={(value) => {
          setKind(value);
          setPage(1);
        }}
        onSourceTypeChange={(value) => {
          setSourceType(value);
          setPage(1);
        }}
        onReset={() => {
          setKind("");
          setSourceType("");
          setPage(1);
        }}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen((current) => !current)}
      />
      <CallHistoryTable calls={visibleItems} timezone={timezone} />
      <Pagination
        page={data.page}
        totalPages={data.pages}
        totalItems={data.total}
        pageSize={data.limit}
        itemCount={visibleItems.length}
        onPageChange={setPage}
        itemLabel="records"
        isLoading={callsQuery.isFetching}
      />
    </div>
  );
}
