"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Boxes,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Handshake,
  Eye,
  ListFilter,
  Package,
  Pencil,
  RefreshCw,
  Search,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCrmRecordModal } from "./AddContactModal";
import {
  CrmRecordModal,
  type CrmRecordModalMode,
} from "./CrmRecordModal";
import { CrmRecordsTableSkeleton } from "./CrmRecordsTableSkeleton";

type CrmPlatform = "HubSpot" | "Salesforce";
type CrmProvider = "HUBSPOT" | "SALESFORCE";
type CrmObject = {
  objectType: string;
  label: string;
  pluralLabel: string;
  custom: boolean;
  readable: boolean;
  createable: boolean;
  updateable: boolean;
  deletable: boolean;
};
type CrmObjectsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: { provider: CrmProvider; objects: CrmObject[] };
};
type CrmRecord = Record<string, unknown> & {
  id?: string;
  externalId?: string;
  properties?: Record<string, unknown>;
  fields?: Record<string, unknown>;
};
type CrmRecordsResponse = {
  success?: boolean;
  message?: string | string[];
  data?:
    | CrmRecord[]
    | {
        items?: CrmRecord[];
        records?: CrmRecord[];
        total?: number;
        page?: number;
        limit?: number;
        pages?: number;
        totalPages?: number;
        pagination?: {
          total?: number;
          page?: number;
          limit?: number;
          pages?: number;
          totalPages?: number;
        };
        meta?: {
          total?: number;
          page?: number;
          limit?: number;
          pages?: number;
          totalPages?: number;
        };
      };
};
type CrmSyncResponse = {
  success?: boolean;
  message?: string | string[];
};

const VISIBLE_TAB_COUNT = 2;
const RECORDS_PER_PAGE = 20;

function objectIcon(objectType: string) {
  const type = objectType.toLowerCase();
  if (type.includes("contact")) return Users;
  if (type.includes("compan") || type.includes("account")) return Building2;
  if (type.includes("deal") || type.includes("opportunit")) return Handshake;
  if (type.includes("product")) return Package;
  if (type.includes("task") || type.includes("activit")) return CalendarDays;
  return Boxes;
}

function responseMessage(result: CrmObjectsResponse) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load CRM objects.";
}

function recordsMessage(result: CrmRecordsResponse) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load CRM records.";
}

function recordItems(data: CrmRecordsResponse["data"]): CrmRecord[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? data.records ?? [];
}

function paginationOf(data: CrmRecordsResponse["data"], fallbackLimit: number) {
  if (!data || Array.isArray(data)) {
    return { total: data?.length ?? 0, page: 1, limit: fallbackLimit, totalPages: 1 };
  }
  const pagination = data.pagination ?? data.meta ?? data;
  const total = pagination.total ?? 0;
  const limit = pagination.limit ?? fallbackLimit;
  return {
    total,
    page: pagination.page ?? 1,
    limit,
    totalPages:
      pagination.totalPages ??
      pagination.pages ??
      Math.max(1, Math.ceil(total / limit)),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function displayRecord(record: CrmRecord) {
  const nestedData = isRecord(record.data) ? record.data : {};
  return { ...record, ...nestedData, ...record.fields, ...record.properties };
}

const hiddenColumnKeys = new Set([
  "id",
  "organizationId",
  "provider",
  "objectType",
  "properties",
  "fields",
  "data",
  "rawPayload",
  "archived",
  "associations",
]);
const preferredColumnKeys = [
  "name",
  "dealname",
  "subject",
  "title",
  "firstName",
  "lastName",
  "company",
  "email",
  "phone",
  "amount",
  "status",
  "stage",
  "dealstage",
  "dealtype",
  "pipeline",
  "closedate",
  "createdate",
  "days_to_close",
  "externalId",
  "updatedAt",
  "providerUpdatedAt",
  "providerCreatedAt",
  "syncedAt",
];

function columnsFor(records: CrmRecord[]) {
  const keys = new Set<string>();
  records.forEach((record) => {
    Object.entries(displayRecord(record)).forEach(([key, value]) => {
      if (
        !hiddenColumnKeys.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        keys.add(key);
      }
    });
  });
  return Array.from(keys)
    .sort((a, b) => {
      const aIndex = preferredColumnKeys.indexOf(a);
      const bIndex = preferredColumnKeys.indexOf(b);
      return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
    });
}

function columnLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCellValue(value: unknown, key: string) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  if (/date|time|updated|created|closed/i.test(key)) {
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

function visiblePageNumbers(currentPage: number, totalPages: number) {
  const count = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - count + 1));
  return Array.from({ length: count }, (_, index) => start + index);
}

export function CrmContactsTable() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [query, setQuery] = useState("");
  const [activeEntity, setActiveEntity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activePlatform, setActivePlatform] = useState<CrmPlatform>("HubSpot");
  const [visibleTabCountInput, setVisibleTabCountInput] = useState(
    String(VISIBLE_TAB_COUNT),
  );
  const [recordModal, setRecordModal] = useState<{
    id: string | null;
    mode: CrmRecordModalMode;
  }>({ id: null, mode: "view" });
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreMenuPosition, setMoreMenuPosition] = useState({ top: 0, left: 0 });
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const provider: CrmProvider =
    activePlatform === "HubSpot" ? "HUBSPOT" : "SALESFORCE";

  const objectsQuery = useQuery({
    queryKey: ["crm-objects", provider],
    enabled: status === "authenticated" && Boolean(accessToken),
    queryFn: async ({ signal }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/${encodeURIComponent(provider)}/objects`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal,
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CrmObjectsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(responseMessage(result));
      }
      return result.data;
    },
  });
  const crmObjects = useMemo(
    () => objectsQuery.data?.objects ?? [],
    [objectsQuery.data?.objects],
  );
  const visibleTabCount = Math.max(
    1,
    Number.parseInt(visibleTabCountInput, 10) || VISIBLE_TAB_COUNT,
  );
  const visibleObjects = crmObjects.slice(0, visibleTabCount);
  const moreObjects = crmObjects.slice(visibleTabCount);
  const hasActiveObject =
    objectsQuery.data?.provider === provider &&
    crmObjects.some((object) => object.objectType === activeEntity);

  useEffect(() => {
    if (!crmObjects.length) {
      setActiveEntity("");
      return;
    }
    setActiveEntity((current) =>
      crmObjects.some((object) => object.objectType === current)
        ? current
        : crmObjects[0].objectType,
    );
  }, [crmObjects]);

  useEffect(() => {
    setCurrentPage(1);
    setQuery("");
  }, [activeEntity, provider]);

  const recordsQuery = useQuery({
    queryKey: ["crm-records", provider, activeEntity, currentPage, RECORDS_PER_PAGE],
    enabled:
      status === "authenticated" && Boolean(accessToken) && hasActiveObject,
    queryFn: async ({ signal }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(RECORDS_PER_PAGE),
        provider,
        objectType: activeEntity,
        archived: "false",
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/records?${params}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal,
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CrmRecordsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(recordsMessage(result));
      }
      return result.data;
    },
  });
  const records = useMemo(
    () => recordItems(recordsQuery.data),
    [recordsQuery.data],
  );
  const pagination = paginationOf(recordsQuery.data, RECORDS_PER_PAGE);
  const columns = useMemo(() => columnsFor(records), [records]);

  const syncMutation = useMutation({
    mutationFn: async (selectedProvider: CrmProvider) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/connections/${encodeURIComponent(selectedProvider)}/sync`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CrmSyncResponse;
      if (!response.ok || !result.success) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Unable to sync CRM records.",
        );
      }
      return result;
    },
    onSuccess: async (result, syncedProvider) => {
      toast.success(
        Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || `${syncedProvider} sync completed successfully.`,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm-objects", syncedProvider] }),
        queryClient.invalidateQueries({ queryKey: ["crm-records", syncedProvider] }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to sync CRM records.",
      );
    },
  });

  useEffect(() => {
    function closeMoreMenu(event: MouseEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", closeMoreMenu);
    return () => document.removeEventListener("mousedown", closeMoreMenu);
  }, []);
  const filteredRecords = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? records.filter((record) =>
          Object.values(displayRecord(record)).some((value) =>
            formatCellValue(value, "").toLowerCase().includes(term),
          ),
        )
      : records;
  }, [query, records]);

  return (
    <section
      className="mt-4 space-y-3 text-[#102A62]"
      aria-label={`${activePlatform} CRM contacts`}
    >
      <div className="flex flex-col gap-4 rounded-[10px] border border-[#DCE7F8] bg-white px-4 py-3 shadow-[0_4px_18px_rgba(45,85,150,0.04)] sm:px-5 lg:min-h-[51px] lg:flex-row lg:items-center lg:justify-between lg:py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3 text-xs">
          <div
            className="flex items-center gap-1 rounded-[8px] bg-[#F5F8FE] p-1"
            role="radiogroup"
            aria-label="Select CRM platform"
          >
            <PlatformButton
              platform="HubSpot"
              activePlatform={activePlatform}
              onSelect={setActivePlatform}
            />
            <PlatformButton
              platform="Salesforce"
              activePlatform={activePlatform}
              onSelect={setActivePlatform}
            />
          </div>
          <span className="hidden h-5 w-px bg-[#DCE7F8] sm:block" />
          <span className="flex items-center gap-2 font-medium text-[#13B981]">
            <span className="size-2 rounded-full bg-[#21C997]" />{" "}
            {activePlatform} Connected
          </span>
          <span className="hidden h-5 w-px bg-[#DCE7F8] sm:block" />
          <span className="text-[#6E82AD]">
            Last sync:{" "}
            <strong className="font-semibold text-[#19366F]">5 min ago</strong>
          </span>
          <span className="hidden h-5 w-px bg-[#DCE7F8] sm:block" />
          <strong className="font-semibold text-[#19366F]">
            {recordsQuery.isSuccess ? pagination.total.toLocaleString() : "—"} records
          </strong>
        </div>
        <div className="flex gap-2 sm:self-end lg:self-auto">
          <button
            type="button"
            onClick={() => syncMutation.mutate(provider)}
            disabled={syncMutation.isPending || !accessToken}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-[7px] border border-[#D5E2F6] px-4 text-xs font-semibold text-[#2872F5] transition hover:bg-[#F7FAFF] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <RefreshCw
              className={cn("size-4", syncMutation.isPending && "animate-spin")}
            />
            {syncMutation.isPending ? "Syncing..." : "Sync Now"}
          </button>

        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#DCE7F8] bg-white shadow-[0_6px_22px_rgba(45,85,150,0.04)]">
        <nav
          className="overflow-x-auto border-b border-[#DCE7F8] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="CRM record types"
        >
          <div className="flex min-w-max items-stretch px-2 sm:px-4">
            {visibleObjects.map((object) => {
              const Icon = objectIcon(object.objectType);
              return (
              <button
                type="button"
                key={object.objectType}
                onClick={() => setActiveEntity(object.objectType)}
                className={cn(
                  "relative flex h-11 items-center gap-2 px-3 text-xs font-medium text-[#6379A8] transition-colors hover:text-[#246BEE] sm:px-4",
                  activeEntity === object.objectType && "text-[#246BEE]",
                )}
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {object.pluralLabel || object.label}
                {activeEntity === object.objectType && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2F73F6]" />
                )}
              </button>
              );
            })}
            {moreObjects.length > 0 && (
              <div ref={moreMenuRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  onClick={() => {
                    if (!moreOpen && moreMenuRef.current) {
                      const rect = moreMenuRef.current.getBoundingClientRect();
                      setMoreMenuPosition({
                        top: rect.bottom + 6,
                        left: Math.max(8, rect.right - 192),
                      });
                    }
                    setMoreOpen((open) => !open);
                  }}
                  className={cn(
                    "relative flex h-11 items-center gap-1 px-4 text-xs font-medium text-[#6379A8] hover:text-[#246BEE]",
                    moreObjects.some((object) => object.objectType === activeEntity) &&
                      "text-[#246BEE]",
                  )}
                >
                  More
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      moreOpen && "rotate-180",
                    )}
                  />
                  {moreObjects.some((object) => object.objectType === activeEntity) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2F73F6]" />
                  )}
                </button>
                {moreOpen && (
                  <div
                    role="menu"
                    className="fixed z-30 min-w-48 rounded-lg border border-[#DCE7F8] bg-white p-1.5 shadow-[0_10px_30px_rgba(31,64,122,0.16)]"
                    style={moreMenuPosition}
                  >
                    {moreObjects.map((object) => {
                      const Icon = objectIcon(object.objectType);
                      return (
                        <button
                          key={object.objectType}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveEntity(object.objectType);
                            setMoreOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#6379A8] hover:bg-[#F4F7FE] hover:text-[#246BEE]",
                            activeEntity === object.objectType && "bg-[#EDF3FF] text-[#246BEE]",
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.8} />
                          {object.pluralLabel || object.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {crmObjects.length > 1 && (
              <label className="ml-2 flex h-11 items-center gap-2 border-l border-[#DCE7F8] pl-3 text-xs font-medium text-[#6379A8]">
                Show
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  aria-label="Number of visible CRM tabs"
                  value={visibleTabCountInput}
                  onChange={(event) => {
                    setVisibleTabCountInput(event.target.value);
                    setMoreOpen(false);
                  }}
                  onBlur={() => setVisibleTabCountInput(String(visibleTabCount))}
                  className="h-7 w-16 !rounded-[8px] border border-[#D6E2F5] bg-white px-2 text-xs font-semibold text-[#274375] outline-none transition focus:border-[#70A0FA] focus:ring-2 focus:ring-[#2F73F6]/10"
                />
              </label>
            )}
            {objectsQuery.isPending && (
              <span className="my-3 ml-3 h-5 w-40 animate-pulse rounded bg-[#EDF3FF]" />
            )}
            {objectsQuery.isError && (
              <button
                type="button"
                onClick={() => objectsQuery.refetch()}
                title={objectsQuery.error.message}
                className="h-11 px-4 text-xs font-medium text-red-500 hover:text-red-600"
              >
                Could not load tabs — Retry
              </button>
            )}
          </div>
        </nav>

        <div className="flex flex-col gap-3 border-b border-[#E5ECF8] p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <label className="flex h-9 w-full max-w-[330px] items-center gap-3 rounded-[7px] border border-[#D6E2F5] px-3 text-[#6A82B2] focus-within:border-[#70A0FA] focus-within:ring-2 focus-within:ring-[#2F73F6]/10">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search records on this page..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#7187B2]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton label="Last updated" />
              <FilterButton label="Active records" />
              <FilterButton
                label="Columns"
                icon={<ListFilter className="size-3.5" />}
              />
            </div>
          </div>
          <AddCrmRecordModal
            objects={crmObjects}
            provider={provider}
            activeObjectType={activeEntity}
          >
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#2F6FF2] px-4 text-xs font-semibold text-white shadow-[0_5px_12px_rgba(47,111,242,0.24)] transition hover:bg-[#2362DE]"
            >
              <UserPlus className="size-4" /> Add Record
            </button>
          </AddCrmRecordModal>
        </div>

        {objectsQuery.isError && !activeEntity ? (
          <div className="mx-3 flex h-40 items-center justify-center border-x border-b border-[#E0E9F7] text-center text-sm text-[#7187B2] sm:mx-4">
            CRM objects could not be loaded. Retry from the tabs above.
          </div>
        ) : recordsQuery.isPending ? (
          <CrmRecordsTableSkeleton />
        ) : recordsQuery.isError ? (
          <div className="mx-3 flex h-40 flex-col items-center justify-center border-x border-b border-[#E0E9F7] text-center sm:mx-4">
            <p className="text-sm text-red-500">{recordsQuery.error.message}</p>
            <button
              type="button"
              onClick={() => recordsQuery.refetch()}
              className="mt-3 rounded-md border border-[#2F73F6] px-3 py-1.5 text-xs font-semibold text-[#2F73F6] hover:bg-[#F4F7FE]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mx-3 overflow-x-auto border-x border-[#E0E9F7] sm:mx-4">
            <table
              className="w-full table-fixed text-left text-sm"
              style={{ minWidth: Math.max(1050, columns.length * 180 + 90) }}
            >
              <thead className="bg-[#F7FAFF] text-[#18346C]">
                <tr className="h-9 border-y border-[#E0E9F7]">
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="w-[180px] px-4 font-semibold"
                    >
                      {columnLabel(column)}
                    </th>
                  ))}
                  <th className="w-[8%] px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const values = displayRecord(record);
                  const recordId = String(record.id ?? "");
                  return (
                    <tr
                      key={recordId || index}
                      className="h-[48px] border-b border-[#E0E9F7] text-[#17346F] transition-colors hover:bg-[#FAFCFF]"
                    >
                      {columns.map((column) => {
                        const imageUrl = imageUrlOf(column, values[column]);
                        return (
                          <td
                            key={column}
                            title={formatCellValue(values[column], column)}
                            className="truncate px-4"
                          >
                            {imageUrl ? (
                              <span className="flex items-center gap-2">
                                <span
                                  role="img"
                                  aria-label={columnLabel(column)}
                                  className="size-8 shrink-0 rounded-full border border-[#DCE7F8] bg-[#F7FAFF] bg-cover bg-center bg-no-repeat"
                                  style={{
                                    backgroundImage: `url(${JSON.stringify(imageUrl)})`,
                                  }}
                                />
                                <span className="truncate">{imageUrl}</span>
                              </span>
                            ) : (
                              formatCellValue(values[column], column)
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={!recordId}
                            onClick={() =>
                              setRecordModal({ id: recordId, mode: "view" })
                            }
                            aria-label={`View record ${record.externalId ?? recordId}`}
                            title="View record"
                            className="inline-flex size-8 items-center justify-center rounded-md border border-[#DCE7F8] text-[#5073B8] transition hover:border-[#AFC8F2] hover:bg-[#EDF3FF] hover:text-[#246BEE] disabled:opacity-40"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!recordId}
                            onClick={() =>
                              setRecordModal({ id: recordId, mode: "edit" })
                            }
                            aria-label={`Edit record ${record.externalId ?? recordId}`}
                            title="Edit record"
                            className="inline-flex size-8 items-center justify-center rounded-md border border-[#DCE7F8] text-[#5073B8] transition hover:border-[#AFC8F2] hover:bg-[#EDF3FF] hover:text-[#246BEE] disabled:opacity-40"
                          >
                            <Pencil className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="flex h-28 min-w-[1050px] items-center justify-center border-b border-[#E0E9F7] text-sm text-[#7187B2]">
                No {activeEntity || "CRM"} records found.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#17346F]">
            Showing{" "}
            <strong>
              {pagination.total === 0
                ? 0
                : (currentPage - 1) * pagination.limit + 1}{" "}
              – {Math.min(currentPage * pagination.limit, pagination.total)}
            </strong>{" "}
            of <strong>{pagination.total.toLocaleString()}</strong>
          </p>
          <div
            className="flex items-center gap-1.5 self-end"
            aria-label="Pagination"
          >
            <PaginationButton
              label="Previous page"
              disabled={currentPage <= 1 || recordsQuery.isFetching}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4" />
            </PaginationButton>
            {visiblePageNumbers(currentPage, pagination.totalPages).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-[6px] border border-[#D6E2F5] text-xs text-[#24447F] transition hover:border-[#2F73F6]",
                  currentPage === page &&
                    "border-[#2F73F6] bg-[#2F73F6] text-white shadow-[0_3px_8px_rgba(47,115,246,0.22)]",
                )}
              >
                {page}
              </button>
            ))}
            <PaginationButton
              label="Next page"
              disabled={
                currentPage >= pagination.totalPages || recordsQuery.isFetching
              }
              onClick={() =>
                setCurrentPage((page) => Math.min(pagination.totalPages, page + 1))
              }
            >
              <ChevronRight className="size-4" />
            </PaginationButton>
          </div>
        </div>
      </div>
      <CrmRecordModal
        recordId={recordModal.id}
        provider={provider}
        objectType={activeEntity}
        mode={recordModal.mode}
        open={Boolean(recordModal.id)}
        onOpenChange={(open) => {
          if (!open) setRecordModal((current) => ({ ...current, id: null }));
        }}
      />
    </section>
  );
}

function FilterButton({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#D6E2F5] px-3 text-xs font-medium text-[#274375] transition hover:border-[#A9C2EE] hover:bg-[#F8FAFF]"
    >
      {icon}
      {label}
      <ChevronDown className="size-3.5 text-[#5879B5]" />
    </button>
  );
}

function PlatformButton({
  platform,
  activePlatform,
  onSelect,
}: {
  platform: CrmPlatform;
  activePlatform: CrmPlatform;
  onSelect: (platform: CrmPlatform) => void;
}) {
  const isActive = platform === activePlatform;
  const Icon = platform === "HubSpot" ? Share2 : Cloud;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onSelect(platform)}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-[6px] px-3 text-sm font-semibold transition",
        isActive
          ? "bg-white text-[#142D60] shadow-[0_2px_7px_rgba(39,73,132,0.12)] ring-1 ring-[#DCE7F8]"
          : "text-[#7187B2] hover:text-[#315C9E]",
      )}
    >
      <Icon
        className={cn(
          "size-4",
          platform === "HubSpot"
            ? "rotate-90 text-[#FF6D2D]"
            : "text-[#1689D5]",
        )}
        strokeWidth={2.5}
      />
      {platform}
      {isActive && <Check className="size-3.5 text-[#13B981]" />}
    </button>
  );
}

function PaginationButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-[6px] border border-[#D6E2F5] text-[#5073B8] transition hover:border-[#2F73F6] hover:text-[#2F73F6] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
