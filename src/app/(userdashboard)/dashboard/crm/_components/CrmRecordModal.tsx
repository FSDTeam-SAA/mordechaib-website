"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrmRecordEditForm } from "./CrmRecordEditForm";
import { CrmRecordModalSkeleton } from "./CrmRecordModalSkeleton";

export type CrmRecordModalMode = "view" | "edit";

type CrmRecord = Record<string, unknown> & {
  id?: string;
  externalId?: string;
  provider?: string;
  objectType?: string;
  properties?: Record<string, unknown>;
};
type RecordResponse = {
  success?: boolean;
  message?: string | string[];
  data?: CrmRecord | { record?: CrmRecord };
};
type Props = {
  recordId: string | null;
  provider: string;
  objectType: string;
  mode: CrmRecordModalMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function messageOf(result: RecordResponse, fallback: string) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || fallback;
}

function recordOf(data: RecordResponse["data"]): CrmRecord | undefined {
  if (!data) return undefined;
  if ("record" in data) return data.record as CrmRecord | undefined;
  return data;
}

function labelOf(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function valueOf(value: unknown, key: string) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (/date|time|updated|created|synced/i.test(key)) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }
  return String(value);
}

function imageUrlOf(key: string, value: unknown) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value)) return null;
  return /(image|photo|avatar|logo|picture|thumbnail|icon)/i.test(key) ||
    /\.(avif|gif|jpe?g|png|svg|webp)(?:\?.*)?$/i.test(value)
    ? value
    : null;
}

export function CrmRecordModal({
  recordId,
  provider,
  objectType,
  mode,
  open,
  onOpenChange,
}: Props) {
  const { data: session } = useSession();
  const accessToken = session?.user.accessToken;
  const queryClient = useQueryClient();

  const recordQuery = useQuery({
    queryKey: ["crm-record", recordId],
    enabled: open && Boolean(recordId) && Boolean(accessToken),
    queryFn: async ({ signal }) => {
      if (!recordId || !accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/records/${encodeURIComponent(recordId)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal,
        },
      );
      const result = (await response.json().catch(() => ({}))) as RecordResponse;
      const record = recordOf(result.data);
      if (!response.ok || !result.success || !record) {
        throw new Error(messageOf(result, "Unable to load CRM record."));
      }
      return record;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (properties: Record<string, string>) => {
      const externalId = recordQuery.data?.externalId;
      const selectedObjectType = recordQuery.data?.objectType ?? objectType;
      if (!externalId) {
        throw new Error("This CRM record does not have an external ID.");
      }
      if (!selectedObjectType) {
        throw new Error("This CRM record does not have an object type.");
      }
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/${encodeURIComponent(provider)}/${encodeURIComponent(selectedObjectType)}/${encodeURIComponent(externalId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as RecordResponse;
      if (!response.ok || result.success === false) {
        throw new Error(messageOf(result, "Unable to update CRM record."));
      }
      return result;
    },
    onSuccess: async (result) => {
      toast.success(messageOf(result, "CRM record updated successfully."));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm-record", recordId] }),
        queryClient.invalidateQueries({ queryKey: ["crm-records", provider] }),
      ]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update CRM record.",
      );
    },
  });

  useEffect(() => {
    if (open) updateMutation.reset();
    // Reset only when a fresh modal session starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recordId]);

  const record = recordQuery.data;
  const properties = record?.properties ?? {};
  const metadata = record
    ? Object.entries(record).filter(([key]) => key !== "properties")
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) =>
        !updateMutation.isPending && onOpenChange(nextOpen)
      }
    >
      <DialogContent
        data-lenis-prevent
        overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[850px] flex-col gap-0 overflow-hidden !rounded-[16px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
      >
        <header className="border-b border-[#E4EAF8] px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="text-xl font-semibold text-[#0E1224]">
            {mode === "edit" ? "Edit CRM Record" : "CRM Record Details"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#8B93B8]">
            {record?.objectType
              ? `${labelOf(record.objectType)} · ${record.externalId ?? record.id ?? ""}`
              : "Loading the selected CRM record."}
          </DialogDescription>
        </header>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C4EE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
        >
        {recordQuery.isPending ? (
          <CrmRecordModalSkeleton />
        ) : recordQuery.isError ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-[#C24152]">{recordQuery.error.message}</p>
            <button
              type="button"
              onClick={() => recordQuery.refetch()}
              className="mt-4 rounded-[12px] border border-[#5B7FF0] px-4 py-2 text-sm font-medium text-[#5B7FF0]"
            >
              Try again
            </button>
          </div>
        ) : mode === "edit" && record ? (
          <CrmRecordEditForm
            key={record.id ?? recordId}
            properties={properties}
            isSaving={updateMutation.isPending}
            error={
              updateMutation.error instanceof Error
                ? updateMutation.error.message
                : undefined
            }
            onCancel={() => onOpenChange(false)}
            onSubmit={(values) => updateMutation.mutate(values)}
          />
        ) : record ? (
          <div className="space-y-6 p-5 sm:p-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#19366F]">Record information</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {metadata.map(([key, value]) => (
                  <div key={key} className="min-w-0 rounded-[12px] border border-[#E4EAF8] bg-[#FAFCFF] p-3">
                    <p className="text-xs font-medium text-[#7187B2]">{labelOf(key)}</p>
                    <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-sm text-[#17346F]">
                      {valueOf(value, key)}
                    </pre>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#19366F]">Properties</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(properties).map(([key, value]) => (
                  <div key={key} className="min-w-0 rounded-[12px] border border-[#E4EAF8] p-3">
                    <p className="text-xs font-medium text-[#7187B2]">{labelOf(key)}</p>
                    {imageUrlOf(key, value) && (
                      <div
                        role="img"
                        aria-label={labelOf(key)}
                        className="mt-2 h-40 w-full rounded-xl border border-[#E4EAF8] bg-[#F7FAFF] bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${JSON.stringify(imageUrlOf(key, value))})`,
                        }}
                      />
                    )}
                    <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-sm text-[#17346F]">
                      {valueOf(value, key)}
                    </pre>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
