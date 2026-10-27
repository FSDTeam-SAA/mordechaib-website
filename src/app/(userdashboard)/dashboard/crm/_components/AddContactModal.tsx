"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Box,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  SquareCheckBig,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AddRecordFieldsSkeleton } from "./AddRecordFieldsSkeleton";

type CrmObjectOption = {
  objectType: string;
  label: string;
  pluralLabel: string;
  createable: boolean;
};
export interface AddCrmRecordModalProps {
  children: ReactNode;
  objects: CrmObjectOption[];
  provider: string;
  activeObjectType?: string;
}
type SchemaOption = string | { label?: string; value?: string | number };
type SchemaField = {
  name?: string;
  fieldName?: string;
  label?: string;
  type?: string;
  dataType?: string;
  required?: boolean;
  createable?: boolean;
  writable?: boolean;
  readOnly?: boolean;
  description?: string;
  options?: SchemaOption[];
};
type SchemaResponse = {
  success?: boolean;
  message?: string | string[];
  data?: SchemaField[] | { fields?: SchemaField[]; items?: SchemaField[] };
};

function objectIcon(objectType: string) {
  const type = objectType.toLowerCase();
  if (type.includes("contact")) return UserRound;
  if (type.includes("compan") || type.includes("account")) return Building2;
  if (type.includes("deal") || type.includes("opportunit")) return CircleDollarSign;
  if (type.includes("task") || type.includes("activit")) return SquareCheckBig;
  return Box;
}

const inputClassName =
  "h-10 w-full rounded-[8px] border border-[#E3EAF7] bg-[#F6F8FD] px-3 text-sm text-[#142D60] outline-none transition placeholder:text-[#91A0BF] focus:border-[#6B8EFF] focus:ring-2 focus:ring-[#4772F5]/10 sm:h-11";
const INITIAL_FIELD_COUNT = 3;

export function AddCrmRecordModal({
  children,
  objects,
  provider,
  activeObjectType,
}: AddCrmRecordModalProps) {
  const { data: session } = useSession();
  const accessToken = session?.user.accessToken;
  const [open, setOpen] = useState(false);
  const [recordType, setRecordType] = useState(activeObjectType ?? "");
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [selectedExtraFields, setSelectedExtraFields] = useState<string[]>([]);
  const selectedObject = objects.find((object) => object.objectType === recordType);
  const recordLabel = selectedObject?.label || recordType || "Record";

  const schemaQuery = useQuery({
    queryKey: ["crm-object-schema", provider, recordType],
    enabled: open && Boolean(accessToken) && Boolean(recordType),
    queryFn: async ({ signal }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const params = new URLSearchParams({
        view: "FULL",
        page: "1",
        limit: "100",
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/${encodeURIComponent(provider)}/objects/${encodeURIComponent(recordType)}/schema?${params}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal,
        },
      );
      const result = (await response.json().catch(() => ({}))) as SchemaResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Unable to load CRM fields.",
        );
      }
      if (Array.isArray(result.data)) return result.data;
      return result.data.fields ?? result.data.items ?? [];
    },
  });
  const schemaFields = (schemaQuery.data ?? []).filter(
    (field) =>
      Boolean(field.name ?? field.fieldName) &&
      field.createable !== false &&
      field.writable !== false &&
      field.readOnly !== true,
  );
  const initialFieldNames = new Set(
    schemaFields
      .filter((field) => field.required)
      .map((field) => field.name ?? field.fieldName ?? ""),
  );
  schemaFields.forEach((field) => {
    if (initialFieldNames.size >= INITIAL_FIELD_COUNT) return;
    initialFieldNames.add(field.name ?? field.fieldName ?? "");
  });
  const initialFields = schemaFields.filter((field) =>
    initialFieldNames.has(field.name ?? field.fieldName ?? ""),
  );
  const extraFields = schemaFields.filter(
    (field) => !initialFieldNames.has(field.name ?? field.fieldName ?? ""),
  );
  const addedExtraFields = extraFields.filter((field) =>
    selectedExtraFields.includes(field.name ?? field.fieldName ?? ""),
  );

  useEffect(() => {
    if (!open || !objects.length) return;
    setRecordType((current) =>
      objects.some((object) => object.objectType === activeObjectType)
        ? activeObjectType ?? objects[0].objectType
        : objects.some((object) => object.objectType === current)
          ? current
          : objects[0].objectType,
    );
  }, [activeObjectType, objects, open]);

  useEffect(() => {
    setSelectedExtraFields([]);
    setOptionalOpen(false);
  }, [recordType]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        data-lenis-prevent
        overlayClassName="bg-[#E9EEF6]/65 backdrop-blur-[5px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[820px] flex-col gap-0 overflow-hidden !rounded-[14px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(27,49,91,0.22)] [&>button]:right-4 [&>button]:top-3.5 [&>button]:flex [&>button]:size-7 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-[7px] [&>button]:bg-[#F1F4FA] [&>button]:text-[#7183AA] [&>button]:opacity-100 [&>button_svg]:size-4 sm:[&>button]:right-5 sm:[&>button]:top-4"
      >
        <header className="shrink-0 px-5 pb-3 pt-5 sm:px-7 sm:pb-4">
          <DialogTitle className="pr-10 text-left text-xl font-semibold leading-7 text-[#101C39]">
            Add New Record
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a CRM record type and enter its details.
          </DialogDescription>

          <div className="mx-auto mt-4 flex max-w-[405px] items-center" aria-label="Add record progress">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#3F68F5] text-xs font-medium text-white">1</span>
            <span className="ml-2 whitespace-nowrap text-xs font-medium text-[#3964F4]">Choose record type</span>
            <span className="mx-3 h-px min-w-5 flex-1 bg-[#D9E1F0]" />
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F0F3F9] text-xs font-medium text-[#63769D]">2</span>
            <span className="ml-2 whitespace-nowrap text-xs text-[#8A99B8]">Add details</span>
          </div>
        </header>

        <form
          id="add-record-form"
          data-lenis-prevent
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-5 [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin] sm:px-7 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C4EE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
        >
          <div className="grid gap-6 md:grid-cols-[270px_minmax(0,1fr)] md:gap-7">
            <section className="min-w-0 md:border-r md:border-[#DDE5F2] md:pr-5">
              <h3 className="text-sm font-medium text-[#172849]">Record type</h3>
              <p className="mt-0.5 text-xs text-[#8292B2]">Choose what you want to add.</p>

              <div className="mt-3 overflow-hidden rounded-[8px] border border-[#DDE5F2] bg-white shadow-[0_6px_18px_rgba(42,67,112,0.11)]">
                <div className="flex h-10 items-center gap-3 border-b border-[#E7ECF5] px-4 text-sm font-medium text-[#172849] ring-1 ring-inset ring-[#4B72FA]">
                  {selectedObject && (() => {
                    const SelectedIcon = objectIcon(selectedObject.objectType);
                    return <SelectedIcon className="size-5 text-[#3264F5]" />;
                  })()}
                  {recordLabel}
                  <ChevronUp className="ml-auto size-4 text-[#7183AA]" />
                </div>
                <div className="p-1.5">
                  {objects.map((object) => {
                    const Icon = objectIcon(object.objectType);
                    const selected = object.objectType === recordType;
                    return (
                      <button
                        key={object.objectType}
                        type="button"
                        onClick={() => {
                          setRecordType(object.objectType);
                          setOptionalOpen(false);
                        }}
                        className={cn(
                          "flex h-9 w-full items-center gap-3 rounded-[6px] px-3 text-left text-sm transition",
                          selected ? "bg-[#EFF3FF] text-[#3264F5]" : "text-[#293A5D] hover:bg-[#F7F9FD]",
                        )}
                      >
                        <Icon className={cn("size-5", selected ? "text-[#3264F5]" : "text-[#52627F]")} strokeWidth={1.7} />
                        <span>{object.label || object.pluralLabel || object.objectType}</span>
                        {selected && <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-[#4771F5] text-white"><Check className="size-3.5" strokeWidth={3} /></span>}
                      </button>
                    );
                  })}
                  {objects.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-[#8292B2]">
                      No CRM record types are available.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="min-w-0">
              <h3 className="text-lg font-semibold leading-6 text-[#172849]">{recordLabel} details</h3>
              <p className="mt-0.5 text-xs text-[#8292B2]">Fields are based on your connected CRM.</p>

              {schemaQuery.isPending ? (
                <AddRecordFieldsSkeleton />
              ) : schemaQuery.isError ? (
                <div className="mt-4 rounded-[8px] border border-red-100 bg-red-50 p-4 text-center">
                  <p className="text-xs text-red-600">{schemaQuery.error.message}</p>
                  <button
                    type="button"
                    onClick={() => schemaQuery.refetch()}
                    className="mt-2 text-xs font-semibold text-[#3264F5]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {initialFields.map((field) => (
                    <SchemaFormField key={field.name ?? field.fieldName} field={field} />
                  ))}

                  {addedExtraFields.map((field) => (
                    <SchemaFormField key={field.name ?? field.fieldName} field={field} />
                  ))}

                  {extraFields.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOptionalOpen((value) => !value)}
                        aria-expanded={optionalOpen}
                        className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#E3EAF7] bg-[#F6F8FD] px-3 text-sm text-[#53698F] transition hover:bg-[#F1F5FC] sm:h-11"
                      >
                        <span>
                          More fields
                          {selectedExtraFields.length > 0 &&
                            ` (${selectedExtraFields.length} selected)`}
                        </span>
                        {optionalOpen ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>

                      {optionalOpen && (
                        <div data-lenis-prevent className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-56 touch-pan-y overflow-y-auto overscroll-contain rounded-[8px] border border-[#DDE5F2] bg-white p-1.5 shadow-[0_12px_30px_rgba(42,67,112,0.18)] [scrollbar-width:thin]">
                          {extraFields.map((field) => {
                            const name = field.name ?? field.fieldName ?? "";
                            const selected = selectedExtraFields.includes(name);
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() =>
                                  setSelectedExtraFields((current) =>
                                    current.includes(name)
                                      ? current.filter((item) => item !== name)
                                      : [...current, name],
                                  )
                                }
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-xs transition",
                                  selected
                                    ? "bg-[#EFF3FF] text-[#3264F5]"
                                    : "text-[#445779] hover:bg-[#F7F9FD]",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded border",
                                    selected
                                      ? "border-[#4771F5] bg-[#4771F5] text-white"
                                      : "border-[#C9D4E8] bg-white",
                                  )}
                                >
                                  {selected && <Check className="size-3" strokeWidth={3} />}
                                </span>
                                <span>{field.label || name.replaceAll("_", " ")}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {schemaFields.length === 0 && (
                    <p className="rounded-[8px] border border-[#E3EAF7] p-4 text-center text-xs text-[#8292B2]">
                      No createable fields are available for this record type.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </form>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#DDE5F2] px-5 py-3 sm:flex-row sm:justify-end sm:px-7">
          <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-[7px] border border-[#5277F5] bg-white px-7 text-sm font-medium text-[#3E68F1] transition hover:bg-[#F5F7FF]">Cancel</button>
          <button type="submit" form="add-record-form" disabled={schemaQuery.isPending || schemaQuery.isError || schemaFields.length === 0} className="h-9 rounded-[7px] bg-[#4169F3] px-7 text-sm font-medium text-white shadow-[0_4px_10px_rgba(65,105,243,0.25)] transition hover:bg-[#345BE2] disabled:cursor-not-allowed disabled:opacity-50">Review &amp; Create</button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-[#445779]"><span>{label}{required && <span className="text-[#E44B55]"> *</span>}</span>{children}</label>;
}

function SchemaFormField({ field }: { field: SchemaField }) {
  const name = field.name ?? field.fieldName ?? "";
  const label = field.label || name.replaceAll("_", " ");
  const type = (field.type ?? field.dataType ?? "string").toLowerCase();
  const options = field.options ?? [];

  if (options.length > 0 || /select|enum|picklist|option/.test(type)) {
    return (
      <FormField label={label} required={field.required}>
        <select name={name} required={field.required} defaultValue="" className={inputClassName}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option, index) => {
            const value = typeof option === "string" ? option : String(option.value ?? "");
            const optionLabel = typeof option === "string" ? option : option.label ?? value;
            return <option key={`${value}-${index}`} value={value}>{optionLabel}</option>;
          })}
        </select>
      </FormField>
    );
  }

  if (/bool/.test(type)) {
    return (
      <FormField label={label} required={field.required}>
        <select name={name} required={field.required} defaultValue="" className={inputClassName}>
          <option value="">Select an option</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </FormField>
    );
  }

  if (/textarea|multiline|richtext/.test(type)) {
    return (
      <FormField label={label} required={field.required}>
        <textarea name={name} required={field.required} placeholder={field.description || `Enter ${label.toLowerCase()}`} className={`${inputClassName} min-h-24 resize-y py-3`} />
      </FormField>
    );
  }

  const inputType = /date|time/.test(type)
    ? "datetime-local"
    : /number|double|float|decimal|currency|integer/.test(type)
      ? "number"
      : /email/.test(name)
        ? "email"
        : /phone|mobile/.test(name)
          ? "tel"
          : /url|website/.test(name)
            ? "url"
            : "text";

  return (
    <FormField label={label} required={field.required}>
      <input name={name} type={inputType} required={field.required} placeholder={field.description || `Enter ${label.toLowerCase()}`} className={inputClassName} />
    </FormField>
  );
}
