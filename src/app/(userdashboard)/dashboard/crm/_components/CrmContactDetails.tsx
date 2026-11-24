"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OutboundCallModal } from "../../customer/_components/OutboundCallModal";
import { EditCustomerModal } from "../../customer/_components/EditCustomerModal";
import { CrmContactDetailsSkeleton } from "./CrmContactDetailsSkeleton";

export type ContactWorkspaceResponse = {
  success: boolean;
  message?: string | string[];
  data: {
    contactId: string;
    organizationId: string;
    asOf: string;
    profile: {
      id: string;
      createdByUserId?: string;
      name: string;
      email?: string | null;
      phone?: string | null;
      company?: string | null;
      jobTitle?: string | null;
      location?: string | null;
      website?: string | null;
      linkedinUrl?: string | null;
      leadStatus?: string | null;
      notes?: string | null;
      tags?: string[];
      status?: string;
      createdAt?: string;
      updatedAt?: string;
      avatarUrl?: string | null;
    };
    capabilities?: {
      call?: { available: boolean; reason: string | null };
      email?: { available: boolean; reason: string | null };
      scheduleMeeting?: { available: boolean; reason: string | null };
      createTask?: { available: boolean; reason: string | null };
    };
    actionContract?: {
      version?: string;
      actions?: Record<string, unknown>;
    };
    crm?: {
      availability?: string;
      total?: number;
      providers?: string[];
      objectTypes?: Array<{ objectType: string; count: number }>;
      items?: unknown[];
    };
    tasks?: {
      availability?: string;
      totalOpen?: number;
      limit?: number;
      items?: Array<{
        id: string;
        title: string;
        dueDate?: string;
        isOverdue?: boolean;
        status?: string;
        priority?: string;
        createdAt?: string;
      }>;
    };
    meetings?: {
      availability?: string;
      totalUpcoming?: number;
      limit?: number;
      items?: Array<{
        id: string;
        title?: string;
        scheduledAt?: string;
        startTime?: string;
        platform?: string;
        link?: string;
        status?: string;
        createdAt?: string;
      }>;
    };
    calls?: {
      availability?: string;
      total?: number;
      limit?: number;
      items?: Array<{
        id: string;
        caller?: string;
        summary?: string;
        direction?: string;
        status?: string;
        duration?: number;
        createdAt?: string;
        recordingUrl?: string;
      }>;
    };
    health?: {
      availability?: string;
      latest?: {
        riskLevel?: string;
        healthScore?: number;
        analysisConfidence?: number | null;
        capturedAt?: string;
      } | null;
    };
    notes?: {
      availability?: string;
      total?: number;
      limit?: number;
      items?: Array<{
        id: string;
        content?: string;
        body?: string;
        note?: string;
        createdAt?: string;
        isAiGenerated?: boolean;
      }>;
    };
    files?: {
      availability?: string;
      total?: number;
      limit?: number;
      items?: Array<{
        id: string;
        name?: string;
        fileName?: string;
        url?: string;
        mimeType?: string;
        size?: number;
        createdAt?: string;
      }>;
    };
    commercial?: {
      dealValue?: {
        availability?: string;
        value?: number | null;
        currency?: string | null;
        breakdown?: Array<{ currency: string; value: number; dealCount: number }>;
        dealCount?: number;
      };
      closeProbability?: {
        availability?: string;
        value?: number | null;
      };
      expectedClose?: {
        availability?: string;
        value?: string | null;
        dealId?: string;
      };
      expansionPotential?: {
        availability?: string;
        value?: string | number | null;
        score?: string | number | null;
      };
      lifetimeValue?: {
        availability?: string;
        value?: number | null;
      };
    };
    insights?: {
      qualification?: {
        availability?: string;
        value?: string | null;
        isAiGenerated?: boolean;
      };
      risk?: {
        availability?: string;
        level?: string | null;
        healthScore?: number | null;
        isAiGenerated?: boolean;
      };
      predictedClose?: {
        availability?: string;
        value?: string | null;
      };
      nextBestAction?: {
        availability?: string;
        value?: string | null;
        action?: string | null;
      };
    };
  };
};

function formatMoney(amount?: number | null, currency = "USD"): string {
  if (amount == null || !Number.isFinite(amount)) return "$0";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "Due Tomorrow";
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "recently";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLabel(value?: string | null): string {
  if (!value) return "—";
  const text = value.replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function initials(name?: string): string {
  if (!name) return "CU";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CU"
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[1.1875rem]/[1.75rem] font-medium text-[#0E1224]">{children}</h2>;
}

function AccentRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-[10px] bg-[#F5F7FF] py-2 pr-2.5 before:self-stretch before:w-1 before:shrink-0 before:rounded-sm before:bg-[#10B981]">
      {children}
    </div>
  );
}

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  icon: string;
  iconBg: string;
};

export function CrmContactDetails({ contactId: propContactId }: { contactId?: string }) {
  const router = useRouter();
  const routeParams = useParams<{ contactId?: string }>();
  const contactId = propContactId || routeParams?.contactId;

  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ContactWorkspaceResponse["data"]>({
    queryKey: ["contact-workspace", contactId],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken) && Boolean(contactId),
    queryFn: async ({ signal }) => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
      const url = `${apiUrl.replace(/\/+$/, "")}/contacts/${contactId}/workspace?taskLimit=5&meetingLimit=5&callLimit=5&noteLimit=3&fileLimit=5`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal,
      });
      const result = (await response.json().catch(() => ({}))) as ContactWorkspaceResponse;
      if (!response.ok || !result.success) {
        const msg = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Failed to load contact workspace.";
        throw new Error(msg);
      }
      return result.data;
    },
  });

  const profile = workspace?.profile;
  const commercial = workspace?.commercial;
  const insights = workspace?.insights;

  // Timeline events derived dynamically from API data
  const timelineActivities = useMemo<TimelineItem[]>(() => {
    if (!workspace) return [];
    const items: TimelineItem[] = [];

    // Calls
    workspace.calls?.items?.forEach((call) => {
      const ts = call.createdAt ? new Date(call.createdAt).getTime() : 0;
      items.push({
        id: `call-${call.id}`,
        title: call.summary || (call.direction === "OUTBOUND" ? "Follow-Up Call completed" : "Call completed"),
        description: call.status ? `Call status: ${formatLabel(call.status)}` : "Customer call recorded",
        time: formatRelativeTime(call.createdAt),
        timestamp: ts,
        icon: "/crm/details/activity-call.svg",
        iconBg: "bg-[#10B981]/10",
      });
    });

    // Meetings
    workspace.meetings?.items?.forEach((meeting) => {
      const scheduledStr = meeting.scheduledAt || meeting.startTime || meeting.createdAt;
      const ts = scheduledStr ? new Date(scheduledStr).getTime() : 0;
      items.push({
        id: `meeting-${meeting.id}`,
        title: meeting.title || "Meeting Scheduled",
        description: meeting.platform ? `${meeting.platform} meeting scheduled` : "Customer meeting scheduled",
        time: formatRelativeTime(meeting.createdAt || scheduledStr),
        timestamp: ts,
        icon: "/crm/details/activity-meeting.svg",
        iconBg: "bg-[#5B7FF0]/10",
      });
    });

    // Tasks
    workspace.tasks?.items?.forEach((task) => {
      const ts = task.createdAt ? new Date(task.createdAt).getTime() : 0;
      items.push({
        id: `task-${task.id}`,
        title: `Task: ${task.title}`,
        description: task.isOverdue ? "Overdue task" : task.status ? `Status: ${formatLabel(task.status)}` : "Action assigned",
        time: formatRelativeTime(task.createdAt || task.dueDate),
        timestamp: ts,
        icon: "/crm/details/file-xlsx.svg",
        iconBg: "bg-[#EF4444]/10",
      });
    });

    // Notes
    workspace.notes?.items?.forEach((note) => {
      const ts = note.createdAt ? new Date(note.createdAt).getTime() : 0;
      items.push({
        id: `note-${note.id}`,
        title: note.isAiGenerated ? "AI Insight Generated" : "Note added",
        description: note.content || note.note || note.body || "Contact note logged",
        time: formatRelativeTime(note.createdAt),
        timestamp: ts,
        icon: note.isAiGenerated ? "/crm/details/activity-insight.svg" : "/crm/details/activity-note.svg",
        iconBg: note.isAiGenerated ? "bg-[#9333EA]/10" : "bg-[#5B7FF0]/10",
      });
    });

    // Sort by timestamp descending
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [workspace]);

  // Loading state
  if (isLoading || sessionStatus === "loading") {
    return <CrmContactDetailsSkeleton />;
  }

  // Error state
  if (isError || !profile) {
    return (
      <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 text-[#0E1224]">
        <div className="mb-3.5">
          <Link
            href="/dashboard/crm"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7B89AA] transition hover:text-[#0E1224]"
          >
            <ArrowLeft className="size-4" />
            Back to Customers
          </Link>
        </div>
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white p-5 text-center">
          <p className="text-[0.9375rem]/[1.5rem] font-medium text-[#C24152]">
            {error instanceof Error ? error.message : "Failed to load customer details."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3.5 inline-flex h-10 items-center gap-2 rounded-lg border border-[#5B7FF0] px-3.5 text-sm font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </section>
      </main>
    );
  }

  // Commercial values
  const expansionPotential = commercial?.expansionPotential;
  const expansionScore = expansionPotential?.score ?? (expansionPotential?.availability === "AVAILABLE" ? "92" : null);
  const expansionValue = expansionPotential?.value ?? (expansionPotential?.availability === "AVAILABLE" ? "High" : "Unavailable");

  const dealValueStr =
    commercial?.dealValue?.availability === "AVAILABLE" && commercial.dealValue.value != null
      ? formatMoney(commercial.dealValue.value, commercial.dealValue.currency || "USD")
      : "$0";

  const closeProbabilityStr =
    commercial?.closeProbability?.availability === "AVAILABLE" ||
    commercial?.closeProbability?.availability === "PARTIAL"
      ? `${Math.round(commercial.closeProbability.value ?? 0)}%`
      : "0%";

  const expectedCloseStr =
    commercial?.expectedClose?.availability === "AVAILABLE" && commercial.expectedClose.value
      ? formatDate(commercial.expectedClose.value)
      : "—";

  // Actions
  const handleCallClick = () => {
    if (!profile.phone) {
      toast.error("This contact does not have a phone number configured.");
      return;
    }
    setIsCallModalOpen(true);
  };

  const handleEmailClick = () => {
    if (profile.email) {
      window.location.href = `mailto:${profile.email}`;
    } else {
      toast.error("This contact does not have an email address configured.");
    }
  };

  const handleScheduleClick = () => {
    const params = new URLSearchParams();
    params.set("newMeeting", "true");
    if (profile.email) {
      params.set("email", profile.email.trim());
    }
    if (profile.name) {
      params.set("name", profile.name.trim());
      params.set("title", `Meeting with ${profile.name.trim()}`);
    }
    router.push(`/dashboard/calendar?${params.toString()}`);
  };

  return (
    <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4 text-[#0E1224]">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/crm"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7B89AA] transition hover:text-[#0E1224]"
        >
          <ArrowLeft className="size-4" />
          Back to Customers
        </Link>
      </div>

      {/* Header Profile Section */}
      <section className="flex flex-col gap-6 rounded-xl bg-white p-3.5 sm:p-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative size-[96px] shrink-0 overflow-hidden rounded-full bg-[#5B7FF0]/10 text-[1.1875rem]/[1.75rem] font-bold text-[#5B7FF0] sm:size-[120px]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center">
                {initials(profile.name)}
              </span>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[1.375rem]/[2rem] font-bold">{profile.name}</h1>
              {profile.leadStatus && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    profile.leadStatus.toUpperCase().includes("HOT")
                      ? "bg-[#EF4444]/10 text-[#EF4444]"
                      : "bg-[#10B981]/10 text-[#10B981]"
                  }`}
                >
                  {formatLabel(profile.leadStatus)}
                </span>
              )}
            </div>
            <p className="text-sm text-[#8B93B8]">
              {profile.jobTitle || "Customer"}
              {profile.company && (
                <>
                  <span className="px-2">•</span>
                  {profile.company}
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2.5 text-sm text-[#8B93B8]">
              {profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 hover:text-[#5B7FF0]"
                >
                  <Image src="/crm/details/email.svg" alt="" width={16} height={16} />
                  <span>{profile.email}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 opacity-60">
                  <Image src="/crm/details/email.svg" alt="" width={16} height={16} />
                  <span>No email</span>
                </span>
              )}

              {profile.phone ? (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-2 hover:text-[#10B981]"
                >
                  <Image src="/crm/details/phone.svg" alt="" width={16} height={16} />
                  <span>{profile.phone}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 opacity-60">
                  <Image src="/crm/details/phone.svg" alt="" width={16} height={16} />
                  <span>No phone</span>
                </span>
              )}

              <span className="flex items-center gap-2">
                <Image src="/crm/details/location.svg" alt="" width={16} height={16} />
                <span>{profile.location || "Location not set"}</span>
              </span>

              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#5B7FF0] hover:underline"
                >
                  <Image src="/crm/details/website.svg" alt="" width={16} height={16} />
                  <span className="truncate max-w-44">{profile.website.replace(/^https?:\/\//, "")}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 opacity-60">
                  <Image src="/crm/details/website.svg" alt="" width={16} height={16} />
                  <span>No website</span>
                </span>
              )}

              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#3974C6] hover:underline"
                >
                  <Image src="/crm/details/linkedin.svg" alt="" width={16} height={16} />
                  <span className="truncate max-w-44">LinkedIn</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 opacity-60">
                  <Image src="/crm/details/linkedin.svg" alt="" width={16} height={16} />
                  <span>No LinkedIn</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <button
            type="button"
            onClick={handleCallClick}
            className="flex h-[52px] items-center gap-2 rounded-[10px] border border-[#5B7FF0] px-[1.125rem] text-[0.9375rem]/[1.5rem] font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5"
          >
            <Image src="/crm/details/call.svg" alt="" width={18} height={18} />
            Call
          </button>
          <button
            type="button"
            onClick={handleEmailClick}
            className="flex h-[52px] items-center gap-2 rounded-[10px] border border-[#5B7FF0] px-[1.125rem] text-[0.9375rem]/[1.5rem] font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5"
          >
            <Image src="/crm/details/send-email.svg" alt="" width={18} height={18} />
            Email
          </button>
          <button
            type="button"
            onClick={handleScheduleClick}
            className="flex h-[52px] items-center gap-2 rounded-[10px] border border-[#5B7FF0] px-[1.125rem] text-[0.9375rem]/[1.5rem] font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5"
          >
            <Image src="/crm/details/schedule.svg" alt="" width={18} height={18} />
            Schedule
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex h-[52px] items-center gap-2 rounded-[10px] bg-[#5B7FF0] px-[1.125rem] text-[0.9375rem]/[1.5rem] font-medium text-white transition hover:bg-[#4a6ee0]"
          >
            <Pencil className="size-4" />
            Edit
          </button>
        </div>
      </section>

      {/* Main Grid: Commercial Metrics & Details */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.46fr)_minmax(280px,1fr)]">
        {/* Left Column: Metrics & Activity Timeline */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Commercial Metric Cards */}
          <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {/* Expansion Potential */}
            <article className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-center">
              <p className="text-sm text-[#8B93B8]">Expansion Potential</p>
              <div className="flex items-center justify-center gap-2 text-[1.0625rem]/[1.75rem] font-bold text-[#10B981]">
                {expansionScore && (
                  <span className="flex size-8 items-center justify-center rounded-full border border-[#10B981] bg-[#10B981]/10 text-sm">
                    {expansionScore}
                  </span>
                )}
                <span>{expansionValue}</span>
              </div>
            </article>

            {/* Deal Value */}
            <article className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-center">
              <p className="text-sm text-[#8B93B8]">Deal Value</p>
              <div className="flex items-center justify-center gap-2 text-[1.0625rem]/[1.75rem] font-bold text-[#D946EF]">
                {dealValueStr}
              </div>
            </article>

            {/* Close Probability */}
            <article className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-center">
              <p className="text-sm text-[#8B93B8]">Close Probability</p>
              <div className="flex items-center justify-center gap-2 text-[1.0625rem]/[1.75rem] font-bold text-[#F59E0B]">
                {closeProbabilityStr}
              </div>
            </article>

            {/* Expected Close */}
            <article className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-center">
              <p className="text-sm text-[#8B93B8]">Expected Close</p>
              <div className="flex items-center justify-center gap-2 text-[1.0625rem]/[1.75rem] font-bold text-[#EF4444]">
                {expectedCloseStr}
              </div>
            </article>
          </section>

          {/* Activity Timeline */}
          <section className="min-h-60 rounded-2xl bg-white p-3">
            <SectionTitle>Activity Timeline</SectionTitle>
            <div className="mt-3.5 space-y-2">
              {timelineActivities.length > 0 ? (
                timelineActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex min-h-[57px] items-center gap-3 rounded-lg bg-[#F5F7FF] p-2.5 transition hover:bg-[#EEF3FF]"
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded ${act.iconBg}`}
                    >
                      <Image src={act.icon} alt="" width={16} height={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{act.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#8B93B8]">{act.description}</p>
                    </div>
                    <time className="shrink-0 text-xs text-[#8B93B8]">{act.time}</time>
                  </div>
                ))
              ) : (
                <div className="flex h-56 flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-[#44506F]">No activity logged yet</p>
                  <p className="mt-1 text-xs text-[#8B93B8]">
                    Calls, meetings, tasks, and notes will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Ai Insight, Open Task, Files */}
        <aside className="flex min-w-0 flex-col gap-4">
          {/* Ai Insight */}
          <section className="rounded-2xl bg-white p-3.5">
            <SectionTitle>Ai Insight</SectionTitle>
            <div className="mt-3.5 space-y-2">
              {/* Qualification */}
              <AccentRow>
                <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">Qualification</span>
                <strong className="text-right text-[0.9375rem]/[1.5rem] text-[#10B981] sm:text-[1.0625rem]/[1.75rem]">
                  {insights?.qualification?.value ? formatLabel(insights.qualification.value) : "—"}
                </strong>
              </AccentRow>

              {/* Next Best Action */}
              <AccentRow>
                <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">Next Best Action</span>
                <strong className="text-right text-[0.9375rem]/[1.5rem] text-[#F59E0B] sm:text-[1.0625rem]/[1.75rem]">
                  {insights?.nextBestAction?.value || insights?.nextBestAction?.action || "—"}
                </strong>
              </AccentRow>

              {/* Risk Level */}
              <AccentRow>
                <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">Risk Level</span>
                <strong className="text-right text-[0.9375rem]/[1.5rem] text-[#EF4444] sm:text-[1.0625rem]/[1.75rem]">
                  {insights?.risk?.level ? `${formatLabel(insights.risk.level)} Risk` : "—"}
                </strong>
              </AccentRow>

              {/* Predicted Close */}
              <AccentRow>
                <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">Predicted Close</span>
                <strong className="text-right text-[0.9375rem]/[1.5rem] text-[#D946EF] sm:text-[1.0625rem]/[1.75rem]">
                  {insights?.predictedClose?.value ? formatDate(insights.predictedClose.value) : "—"}
                </strong>
              </AccentRow>

              {/* LTV Estimate */}
              <AccentRow>
                <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">LTV Estimate</span>
                <strong className="text-right text-[0.9375rem]/[1.5rem] text-[#0E1224] sm:text-[1.0625rem]/[1.75rem]">
                  {commercial?.lifetimeValue?.value != null
                    ? formatMoney(commercial.lifetimeValue.value)
                    : "—"}
                </strong>
              </AccentRow>
            </div>
          </section>

          {/* Open Task */}
          <section className="rounded-2xl bg-white p-3.5">
            <SectionTitle>Open Task</SectionTitle>
            <div className="mt-3.5 space-y-2">
              {workspace.tasks?.items && workspace.tasks.items.length > 0 ? (
                workspace.tasks.items.map((task) => (
                  <AccentRow key={task.id}>
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={task.status === "COMPLETED"}
                        readOnly
                        className="size-4 rounded border-[#0E1224]"
                      />
                      <span className="truncate">{task.title}</span>
                    </label>
                    <span
                      className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs ${
                        task.isOverdue
                          ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                          : "border-[#F59E0B] bg-[#F59E0B]/10 text-[#D48605]"
                      }`}
                    >
                      {task.isOverdue ? "Overdue" : formatShortDate(task.dueDate)}
                    </span>
                  </AccentRow>
                ))
              ) : (
                <div className="py-3.5 text-center text-sm text-[#8B93B8]">
                  No open tasks for this contact
                </div>
              )}
            </div>
          </section>

          {/* Files */}
          <section className="rounded-2xl bg-white p-3.5">
            <SectionTitle>Files</SectionTitle>
            <div className="mt-3.5 space-y-2">
              {workspace.files?.items && workspace.files.items.length > 0 ? (
                workspace.files.items.map((file) => {
                  const fileName = file.fileName || file.name || "File";
                  const isXls = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
                  const isPdf = fileName.endsWith(".pdf");
                  const icon = isXls
                    ? "/crm/details/file-xlsx.svg"
                    : isPdf
                      ? "/crm/details/file-pdf.svg"
                      : "/crm/details/file-extra.svg";

                  return (
                    <AccentRow key={file.id}>
                      <Image src={icon} alt="" width={18} height={18} />
                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-sm text-[#5B7FF0] hover:underline"
                        >
                          {fileName}
                        </a>
                      ) : (
                        <span className="truncate text-sm text-[#8B93B8]">{fileName}</span>
                      )}
                    </AccentRow>
                  );
                })
              ) : (
                <div className="py-3.5 text-center text-sm text-[#8B93B8]">
                  No files uploaded for this contact
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Notes Section */}
      <section className="rounded-2xl bg-white p-3.5">
        <SectionTitle>Notes</SectionTitle>
        <div className="mt-3.5 rounded-lg bg-[#F4F5FE] p-3.5 text-sm text-[#44506F]">
          {profile.notes ? (
            <p className="whitespace-pre-line pl-3.5 before:mr-2 before:content-['•']">
              {profile.notes}
            </p>
          ) : null}

          {workspace.notes?.items && workspace.notes.items.length > 0 ? (
            <div className="mt-2.5 space-y-2">
              {workspace.notes.items.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span
                    className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      note.isAiGenerated
                        ? "bg-[#5B7FF0]/10 text-[#5B7FF0]"
                        : "bg-[#10B981]/10 text-[#10B981]"
                    }`}
                  >
                    {note.isAiGenerated ? "AI Note" : "Note"}
                  </span>
                  <p className="text-sm">{note.content || note.note || note.body}</p>
                </div>
              ))}
            </div>
          ) : null}

          {!profile.notes && (!workspace.notes?.items || workspace.notes.items.length === 0) && (
            <p className="text-[#8B93B8]">No notes recorded for this customer yet.</p>
          )}
        </div>
      </section>

      {/* Outbound Call Modal */}
      <OutboundCallModal
        open={isCallModalOpen}
        onOpenChange={setIsCallModalOpen}
        customerName={profile.name}
        initialClientPhone={profile.phone || ""}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        customerId={profile.id || contactId || null}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdated={() => {
          void refetch();
        }}
      />
    </main>
  );
}
