"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const companyFields = [
  ["companyName", "Company Name", "Enter company name", "text", false],
  ["website", "Website (optional)", "https://yourcompany.com", "url", false],
  ["industry", "Industry", "Enter industry", "text", false],
  ["businessSize", "Team Size", "11-50 employees", "text", false],
  ["emailAddress", "Email Address", "company@example.com", "email", false],
  ["phoneNumber", "Phone", "+1 (555) 123-4567", "tel", false],
  ["businessHoursStart", "Business Hours Start", "09:00", "time", false],
  ["businessHoursEnd", "Business Hours End", "17:00", "time", false],
  ["language", "Language", "en", "text", false],
] as const;

const workspaceFields = [
  ["timezone", "Time Zone", "UTC", "text", false],
  ["defaultCurrency", "Default Currency", "USD", "text", false],
  ["dateFormat", "Date Format", "MM/DD/YYYY", "text", false],
  ["timeFormat", "Time Format", "12H", "text", false],
  ["plan", "Plan", "STARTER", "text", true],
  ["status", "Status", "ACTIVE", "text", true],
] as const;

const addressFields = [
  ["city", "City", "Washington DC", "text", false],
  ["street", "Street", "82/1 Road", "text", false],
  ["state", "State", "Washington DC", "text", false],
  ["postalCode", "Postal Code", "1234", "text", false],
] as const;

type WorkspaceFormValues = {
  companyName: string;
  website: string;
  industry: string;
  businessSize: string;
  emailAddress: string;
  phoneNumber: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  language: string;
  timezone: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  plan: string;
  status: string;
  city: string;
  street: string;
  state: string;
  postalCode: string;
};

type Organization = {
  _id: string;
  name: string;
  companyName?: string | null;
  website?: string | null;
  industry?: string | null;
  businessSize?: string | null;
  emailAddress?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  businessHours?: {
    start?: string | null;
    end?: string | null;
  } | null;
  businessHoursStart?: string | null;
  businessHoursEnd?: string | null;
  language?: string | null;
  timezone?: string | null;
  defaultCurrency?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  plan?: string | null;
  status?: string | null;
  city?: string | null;
  street?: string | null;
  state?: string | null;
  postalCode?: string | null;
  logoUrl?: string | null;
  isInternal: boolean;
  maintenanceMode: boolean;
  onboardingStep: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type OrganizationResponse = {
  success?: boolean;
  message?: string | string[];
  data?: Organization;
};

const emptyForm: WorkspaceFormValues = {
  companyName: "",
  website: "",
  industry: "",
  businessSize: "",
  emailAddress: "",
  phoneNumber: "",
  businessHoursStart: "",
  businessHoursEnd: "",
  language: "",
  timezone: "",
  defaultCurrency: "",
  dateFormat: "",
  timeFormat: "",
  plan: "",
  status: "",
  city: "",
  street: "",
  state: "",
  postalCode: "",
};

const fieldClassName =
  "h-[51px] rounded-xl border-0 bg-[#F5F7FF] p-4 text-base text-[#0E1224] shadow-none focus-visible:ring-1 focus-visible:ring-[#5B7FF0] read-only:cursor-not-allowed read-only:opacity-70 md:text-base";

const editableFields = [
  "companyName",
  "website",
  "phoneNumber",
  "emailAddress",
  "timezone",
  "language",
  "defaultCurrency",
  "dateFormat",
  "timeFormat",
  "businessHoursStart",
  "businessHoursEnd",
  "city",
  "street",
  "state",
  "postalCode",
  "industry",
  "businessSize",
] as const;

function getMessage(result: OrganizationResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function toFormValues(organization: Organization): WorkspaceFormValues {
  return {
    companyName: organization.companyName ?? organization.name ?? "",
    website: organization.website ?? "",
    industry: organization.industry ?? "",
    businessSize: organization.businessSize ?? "",
    emailAddress: organization.emailAddress ?? organization.email ?? "",
    phoneNumber: organization.phoneNumber ?? "",
    businessHoursStart:
      organization.businessHours?.start ?? organization.businessHoursStart ?? "",
    businessHoursEnd:
      organization.businessHours?.end ?? organization.businessHoursEnd ?? "",
    language: organization.language ?? "",
    timezone: organization.timezone ?? "",
    defaultCurrency: organization.defaultCurrency ?? "",
    dateFormat: organization.dateFormat ?? "",
    timeFormat: organization.timeFormat ?? "",
    plan: organization.plan ?? "",
    status: organization.status ?? "",
    city: organization.city ?? "",
    street: organization.street ?? "",
    state: organization.state ?? "",
    postalCode: organization.postalCode ?? "",
  };
}

export function WorkspaceSettingsForm() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const fileInput = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [persistedMaintenanceMode, setPersistedMaintenanceMode] =
    useState(false);
  const [formValues, setFormValues] =
    useState<WorkspaceFormValues>(emptyForm);

  const organizationQuery = useQuery({
    queryKey: ["organization-me", session?.user.organizationId],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    retry: false,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizations/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OrganizationResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load workspace settings"));
      }

      return result.data;
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async (body: FormData) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizations/me`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OrganizationResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to update workspace settings"));
      }

      return result;
    },
    onSuccess: async (result) => {
      setLogoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["organization-me", session?.user.organizationId],
      });
      toast.success(getMessage(result, "Workspace settings updated successfully."));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update workspace settings"
      );
    },
  });

  const updateMaintenanceMode = useMutation({
    mutationFn: async (nextMode: boolean) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const body = new FormData();
      body.append("maintenanceMode", nextMode ? "true" : "false");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizations/me`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OrganizationResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to update maintenance mode"));
      }

      return result;
    },
    onSuccess: (result, nextMode) => {
      setPersistedMaintenanceMode(nextMode);
      toast.success(getMessage(result, "Maintenance mode updated successfully."));
    },
    onError: (error, nextMode) => {
      setMaintenanceMode(!nextMode);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update maintenance mode"
      );
    },
  });

  useEffect(() => {
    if (organizationQuery.data) {
      setFormValues(toFormValues(organizationQuery.data));
      setMaintenanceMode(organizationQuery.data.maintenanceMode ?? false);
      setPersistedMaintenanceMode(
        organizationQuery.data.maintenanceMode ?? false
      );
    }
  }, [organizationQuery.data]);

  useEffect(() => {
    if (organizationQuery.error) {
      toast.error(
        organizationQuery.error instanceof Error
          ? organizationQuery.error.message
          : "Unable to load workspace settings"
      );
    }
  }, [organizationQuery.error]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const selectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Company logo must be 5 MB or smaller.");
      return;
    }

    setLogoFile(file);
  };

  const handleMaintenanceModeChange = () => {
    if (updateMaintenanceMode.isPending) return;

    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    updateMaintenanceMode.mutate(nextMode);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organizationQuery.data) {
      toast.error("Workspace data is not ready yet. Please try again.");
      return;
    }

    const originalValues = toFormValues(organizationQuery.data);
    const body = new FormData();

    editableFields.forEach((field) => {
      if (formValues[field] !== originalValues[field]) {
        body.append(field, formValues[field]);
      }
    });

    if (maintenanceMode !== persistedMaintenanceMode) {
      body.append("maintenanceMode", String(maintenanceMode));
    }

    if (logoFile) body.append("logo", logoFile);

    if (Array.from(body.keys()).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    updateOrganization.mutate(body);
  };

  const isLoading =
    sessionStatus === "loading" || organizationQuery.isLoading;
  const originalValues = organizationQuery.data
    ? toFormValues(organizationQuery.data)
    : emptyForm;
  const hasTextChanges = editableFields.some(
    (field) => formValues[field] !== originalValues[field]
  );
  const hasChanges =
    hasTextChanges ||
    maintenanceMode !== persistedMaintenanceMode ||
    Boolean(logoFile);

  const renderFields = (
    fields: ReadonlyArray<
      readonly [
        keyof WorkspaceFormValues,
        string,
        string,
        string,
        boolean,
      ]
    >
  ) =>
    fields.map(([name, label, placeholder, type, readOnly]) => (
      <label key={name} className="min-w-0">
        <span className="mb-2 block text-base leading-[1.2] text-[#8B93B8]">
          {label}
        </span>
        {isLoading ? (
          <Skeleton className="h-[51px] w-full rounded-xl bg-[#F5F7FF]" />
        ) : (
          <Input
            name={name}
            type={type}
            value={formValues[name]}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly}
            aria-readonly={readOnly}
            disabled={updateOrganization.isPending}
            className={fieldClassName}
          />
        )}
      </label>
    ));

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">
          Company Details
        </h2>
      </header>

      <form onSubmit={submit}>
        <div className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {renderFields(companyFields)}
          </div>

          <h3 className="mb-3 mt-6 text-xl font-medium text-[#0E1224]">
            Workspace Preferences
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderFields(workspaceFields)}
          </div>
          <div className="mt-4 flex min-h-[62px] items-center justify-between gap-4 rounded-xl bg-[#F5F7FF] px-4 py-3">
            <div className="min-w-0">
              <h4 className="text-base font-medium text-[#0E1224]">
                Maintenance Mode
              </h4>
              <p className="mt-1 text-xs text-[#8B93B8]">
                Temporarily restrict access while workspace maintenance is in progress
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-[56px] shrink-0 rounded-full bg-white" />
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={maintenanceMode}
                aria-label="Toggle maintenance mode"
                onClick={handleMaintenanceModeChange}
                disabled={
                  updateOrganization.isPending || updateMaintenanceMode.isPending
                }
                className={`relative h-8 w-[56px] shrink-0 rounded-full p-1 transition-colors ${
                  maintenanceMode ? "bg-[#5B7FF0]" : "bg-[#C6CCE2]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`block size-6 rounded-full bg-white shadow-sm transition-transform ${
                    maintenanceMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          </div>

          <h3 className="mb-3 mt-6 text-xl font-medium text-[#0E1224]">
            Service Address
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderFields(addressFields)}
          </div>

          <h3 className="mb-4 mt-6 text-xl font-medium text-[#0E1224]">
            Company Logo
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {isLoading ? (
              <Skeleton className="size-[107px] shrink-0 rounded-xl bg-[#F5F7FF]" />
            ) : organizationQuery.data?.logoUrl ? (
              <div className="relative size-[107px] shrink-0 overflow-hidden rounded-xl border border-[#E4EAF8] bg-white">
                <Image
                  src={organizationQuery.data.logoUrl}
                  alt={`${formValues.companyName || "Company"} logo`}
                  fill
                  sizes="107px"
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex size-[107px] shrink-0 items-center justify-center rounded-xl bg-[#F5F7FF] text-[#8B93B8]">
                <CloudUpload className="size-10" strokeWidth={1.15} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectLogo}
                disabled={updateOrganization.isPending}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={updateOrganization.isPending}
                className="flex min-h-[107px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-[#F5F7FF] p-4 text-[#264AFF] outline-none transition-colors hover:bg-[#EEF2FF] focus-visible:ring-2 focus-visible:ring-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CloudUpload
                  className="size-10"
                  strokeWidth={1.15}
                  aria-hidden="true"
                />
                <span className="max-w-full truncate text-base leading-[1.2]">
                  {logoFile?.name || "Choose logo"}
                </span>
                <span className="text-xs text-[#8B93B8]">
                  JPEG, PNG, or WebP. Maximum 5 MB.
                </span>
              </button>
            </div>
          </div>
          {logoFile && (
            <button
              type="button"
              onClick={() => setLogoFile(null)}
              disabled={updateOrganization.isPending}
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-[#8B93B8] transition hover:bg-[#F5F7FF] hover:text-[#0E1224] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-4" />
              Remove selected logo
            </button>
          )}
        </div>

        <footer className="border-t border-[#E4EAF8] p-4">
          <Button
            type="submit"
            disabled={
              isLoading ||
              updateOrganization.isPending ||
              updateMaintenanceMode.isPending ||
              !hasChanges
            }
            className="h-[51px] w-full rounded-[12px] bg-[#5B7FF0] px-8 text-sm font-normal text-white shadow-none hover:bg-[#4E6FDE] sm:w-auto"
          >
            {updateOrganization.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </footer>
      </form>
    </section>
  );
}
