"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Pagination } from "@/components/share/Pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteReportModal } from "./DeleteReportModal";
import { ReportDetailsModal } from "./ReportDetailsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pageSize = 20;

type SupportRequest = {
  id: string;
  ticketId: string;
  organizationId: string;
  createdByUserId: string;
  category: string;
  subject: string;
  status: string;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
};

type SupportRequestsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items: SupportRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
};

type SupportRequestActionResponse = {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
};

const statusStyles: Record<
  string,
  { badge: string; dot: string; text: string }
> = {
  OPEN: {
    badge: "bg-[#5B9CD5]/10",
    dot: "bg-[#5B7FF0]",
    text: "text-[#5B7FF0]",
  },
  RESOLVED: {
    badge: "bg-[#10B981]/10",
    dot: "bg-[#10B981]",
    text: "text-[#10B981]",
  },
  CLOSED: {
    badge: "bg-[#ADAAAA]/15",
    dot: "bg-[#8B93B8]",
    text: "text-[#8B93B8]",
  },
  IN_PROGRESS: {
    badge: "bg-[#F59E0B]/10",
    dot: "bg-[#F59E0B]",
    text: "text-[#F59E0B]",
  },
};

const fallbackStatusStyle = {
  badge: "bg-[#ADAAAA]/15",
  dot: "bg-[#8B93B8]",
  text: "text-[#8B93B8]",
};

function getMessage(
  result: Pick<SupportRequestsResponse, "message">,
  fallback: string,
) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absoluteSeconds < 60) return formatter.format(seconds, "second");
  if (absoluteSeconds < 3600) {
    return formatter.format(Math.round(seconds / 60), "minute");
  }
  if (absoluteSeconds < 86400) {
    return formatter.format(Math.round(seconds / 3600), "hour");
  }
  if (absoluteSeconds < 2592000) {
    return formatter.format(Math.round(seconds / 86400), "day");
  }

  return formatDate(value);
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();
  const styles = statusStyles[normalizedStatus] ?? fallbackStatusStyle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-sm font-normal leading-none",
        styles.badge,
        styles.text,
      )}
    >
      <span className={cn("size-2 rounded-full", styles.dot)} />
      {formatStatus(normalizedStatus)}
    </span>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <TableRow key={index} className="border-0 hover:bg-transparent">
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <TableCell key={cellIndex} className="px-2 py-3">
          <span className="block h-8 animate-pulse rounded bg-[#F5F7FF]" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function SupportRequestsTable() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [detailsRequest, setDetailsRequest] = useState<SupportRequest | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<SupportRequest | null>(null);
  const accessToken = session?.user.accessToken;

  const requestsQuery = useQuery({
    queryKey: ["support-requests", page, pageSize],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const query = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/support/requests?${query.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as SupportRequestsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load support requests."));
      }

      return result.data;
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/support/requests/${encodeURIComponent(requestId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as SupportRequestActionResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to delete support request."));
      }

      return result;
    },
    onSuccess: (result) => {
      setDeleteRequest(null);
      toast.success(getMessage(result, "Support request deleted successfully."));
      void queryClient.invalidateQueries({ queryKey: ["support-requests"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete support request.",
      );
    },
  });

  useEffect(() => {
    if (requestsQuery.error) {
      toast.error(
        requestsQuery.error instanceof Error
          ? requestsQuery.error.message
          : "Unable to load support requests.",
      );
    }
  }, [requestsQuery.error]);

  useEffect(() => {
    const totalPages = requestsQuery.data?.pagination.pages;
    if (totalPages && page > totalPages) setPage(totalPages);
  }, [page, requestsQuery.data?.pagination.pages]);

  const pagination = requestsQuery.data?.pagination;
  const requests = requestsQuery.data?.items ?? [];
  const isInitialLoading =
    sessionStatus === "loading" ||
    (requestsQuery.isLoading && !requestsQuery.data);

  const confirmDelete = () => {
    if (!deleteRequest) return;
    deleteRequestMutation.mutate(deleteRequest.id);
  };

  return (
    <>
      <section className="overflow-hidden rounded-lg bg-white">
        <header className="border-b border-[#E4EAF8] p-4">
          <h2 className="text-xl font-medium text-[#0E1224]">
            Recent Support Requests
          </h2>
        </header>

        <div className="p-4">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-b border-[#F5F7FF] hover:bg-transparent">
                <TableHead className="h-10 px-0 pb-4 pt-0 text-sm font-normal text-[#0E1224]">
                  Ticket ID
                </TableHead>
                <TableHead className="h-10 px-0 pb-4 pt-0 text-sm font-normal text-[#0E1224]">
                  Subject
                </TableHead>
                <TableHead className="h-10 px-0 pb-4 pt-0 text-center text-sm font-normal text-[#0E1224]">
                  Status
                </TableHead>
                <TableHead className="h-10 px-0 pb-4 pt-0 text-center text-sm font-normal text-[#0E1224]">
                  Updated
                </TableHead>
                <TableHead className="h-10 px-0 pb-4 pt-0 text-center text-sm font-normal text-[#0E1224]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <LoadingRows />
              ) : (
                requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="border-0 hover:bg-transparent"
                  >
                    <TableCell className="w-1/5 px-0 py-2 align-middle">
                      <p className="whitespace-nowrap text-sm font-medium leading-normal text-[#141936]">
                        {request.ticketId}
                      </p>
                      <p className="whitespace-nowrap text-sm font-normal leading-normal text-[#6B7280]">
                        {formatDate(request.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="w-1/5 px-0 py-2 align-middle">
                      <p className="max-w-[260px] truncate text-sm font-medium text-[#141936]">
                        {request.subject}
                      </p>
                    </TableCell>
                    <TableCell className="w-1/5 px-0 py-2 text-center align-middle">
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="w-1/5 px-0 py-2 text-center align-middle">
                      <span className="whitespace-nowrap text-sm font-normal text-[#8B93B8]">
                        {formatRelativeTime(request.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="w-1/5 px-0 py-2 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsRequest(request)}
                          className="inline-flex h-[29px] items-center gap-[5px] rounded-[11px] border border-[#5B7FF0] bg-[#5B9CD5]/10 px-3 text-[10px] font-normal text-[#5B7FF0] underline underline-offset-2"
                        >
                          <Image
                            src="/support-eye.svg"
                            alt=""
                            width={16}
                            height={16}
                            unoptimized
                            className="size-4"
                          />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteRequest(request)}
                          aria-label={`Delete ${request.subject} request`}
                          className="flex size-5 items-center justify-center"
                        >
                          <Image
                            src="/task-actions/delete-task.svg"
                            alt=""
                            width={20}
                            height={20}
                            unoptimized
                            className="size-5"
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {!isInitialLoading && !requestsQuery.isError && requests.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-sm text-[#8B93B8]"
                  >
                    No support requests found.
                  </TableCell>
                </TableRow>
              )}

              {!isInitialLoading && requestsQuery.isError && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="text-sm text-[#8B93B8]">
                      Unable to load support requests.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => requestsQuery.refetch()}
                      className="mt-3 h-9 border-[#5B7FF0] text-[#5B7FF0]"
                    >
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination
            page={pagination?.page ?? page}
            totalPages={pagination?.pages ?? 1}
            totalItems={pagination?.total ?? 0}
            pageSize={pagination?.limit ?? pageSize}
            itemCount={requests.length}
            onPageChange={setPage}
            itemLabel="results"
            isLoading={requestsQuery.isFetching}
          />
        </div>
      </section>

      <ReportDetailsModal
        open={detailsRequest !== null}
        onOpenChange={(open) => !open && setDetailsRequest(null)}
        requestId={detailsRequest?.id ?? null}
      />
      <DeleteReportModal
        open={deleteRequest !== null}
        onOpenChange={(open) => {
          if (!open && !deleteRequestMutation.isPending) setDeleteRequest(null);
        }}
        onConfirm={confirmDelete}
        isPending={deleteRequestMutation.isPending}
      />
    </>
  );
}
