"use client";

import {
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

type ChecklistItem = {
  title?: string;
  name?: string;
  isComplete?: boolean;
  dueDate?: string;
};

export type TaskDetailsData = {
  id: string;
  title: string;
  description?: string;
  assignedToUserId?: string;
  department?: string;
  priority?: string;
  status: string;
  dueDate?: string;
  estimatedDurationMinutes?: number;
  stakeholderIds?: string[];
  dependencies?: ChecklistItem[];
  attachments?: Array<{ name?: string; url?: string } | string>;
  requiredAttachments?: ChecklistItem[];
  aiAssistance?: {
    generateChecklist?: boolean;
    suggestNextSteps?: boolean;
    recommendDeadline?: boolean;
    autoCreateSubtasks?: boolean;
  };
  reminder?: { enabled?: boolean; minutesBeforeDue?: number };
  subtasks?: ChecklistItem[];
  tags?: string[];
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  isOverdue?: boolean;
  proposedByAgent?: { id?: string; name?: string; type?: string };
};

type TaskDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskDetailsData;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
};

const statusStyles: Record<string, string> = {
  TODO: "bg-[#5B7FF0]/10 text-[#5B7FF0]",
  DRAFT: "bg-[#8B93B8]/10 text-[#64748B]",
  IN_PROGRESS: "bg-[#F59E0B]/10 text-[#D97706]",
  WAITING: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  BLOCKED: "bg-[#EF4444]/10 text-[#EF4444]",
  COMPLETED: "bg-[#10B981]/10 text-[#059669]",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-[#10B981]/10 text-[#059669]",
  MEDIUM: "bg-[#F59E0B]/10 text-[#D97706]",
  HIGH: "bg-[#EF4444]/10 text-[#EF4444]",
  URGENT: "bg-[#DC2626] text-white",
};

function formatLabel(value?: string) {
  if (!value) return "Not specified";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value?: string, includeTime = false) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4 bg-[#F5F7FF]" />
        <Skeleton className="h-4 w-full bg-[#F5F7FF]" />
        <Skeleton className="h-4 w-2/3 bg-[#F5F7FF]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 bg-[#F5F7FF]" />
        ))}
      </div>
      <Skeleton className="h-40 w-full bg-[#F5F7FF]" />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E4EAF8] bg-[#FBFCFF] p-3">
      <div className="flex items-center gap-2 text-xs text-[#8B93B8]">
        {icon}
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-medium text-[#0E1224]">
        {value}
      </div>
    </div>
  );
}

function Checklist({
  title,
  items,
  emptyText,
}: {
  title: string;
  items?: ChecklistItem[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-[#0E1224]">{title}</h3>
        <span className="rounded-full bg-[#F5F7FF] px-2 py-0.5 text-xs text-[#8B93B8]">
          {items?.length ?? 0}
        </span>
      </div>
      {items?.length ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.title ?? item.name}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-[#E4EAF8] p-3"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                  item.isComplete
                    ? "border-[#10B981] bg-[#10B981] text-white"
                    : "border-[#C9D1E8] text-transparent",
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "break-words text-sm text-[#0E1224]",
                    item.isComplete && "text-[#8B93B8] line-through",
                  )}
                >
                  {item.title ?? item.name ?? "Untitled item"}
                </p>
                {item.dueDate && (
                  <p className="mt-1 text-xs text-[#8B93B8]">
                    Due {formatDate(item.dueDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-[#F5F7FF] p-3 text-sm text-[#8B93B8]">
          {emptyText}
        </p>
      )}
    </section>
  );
}

export function TaskDetailsModal({
  open,
  onOpenChange,
  task,
  isLoading = false,
  isError = false,
  onRetry,
}: TaskDetailsModalProps) {
  const status = task?.status?.toUpperCase() ?? "";
  const priority = task?.priority?.toUpperCase() ?? "";
  const enabledAiOptions = task?.aiAssistance
    ? Object.entries(task.aiAssistance).filter(([, enabled]) => enabled)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        showClose={false}
        overlayClassName="bg-black/30 backdrop-blur-[3px]"
        className="flex h-[calc(100dvh-24px)] max-h-[760px] w-[calc(100%-32px)] max-w-[820px] flex-col gap-0 overflow-hidden rounded-[12px] border-0 bg-white p-0 shadow-xl sm:h-[calc(100dvh-48px)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#E4EAF8] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <DialogTitle className="text-xl font-medium text-[#0E1224]">
              Task Details
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#8B93B8]">
              View complete task information
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close task details"
              className="ml-3 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F5F7FF] text-[#64748B] transition-colors hover:bg-[#E4EAF8] hover:text-[#0E1224]"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </header>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C4EE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
        >
          {isLoading ? (
            <DetailSkeleton />
          ) : isError || !task ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-[#8B93B8]">
                Unable to load task details.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="mt-4 border-[#5B7FF0] text-[#5B7FF0]"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6 p-4 sm:p-6">
              <section>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      statusStyles[status] ?? "bg-[#F5F7FF] text-[#64748B]",
                    )}
                  >
                    {formatLabel(status)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      priorityStyles[priority] ?? "bg-[#F5F7FF] text-[#64748B]",
                    )}
                  >
                    {formatLabel(priority)} priority
                  </span>
                  {task.isOverdue && (
                    <span className="rounded-full bg-[#EF4444]/10 px-3 py-1 text-xs font-medium text-[#EF4444]">
                      Overdue
                    </span>
                  )}
                </div>
                <h2 className="mt-4 break-words text-2xl font-semibold leading-tight text-[#0E1224] sm:text-3xl">
                  {task.title}
                </h2>
                {task.description ? (
                  <div
                    className="mt-3 break-words text-sm leading-6 text-[#64748B] sm:text-base [&_a]:text-[#5B7FF0] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#E4EAF8] [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(task.description),
                    }}
                  />
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[#64748B] sm:text-base">
                    No description provided.
                  </p>
                )}
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard icon={<CalendarDays className="size-4" />} label="Due date" value={formatDate(task.dueDate, true)} />
                <InfoCard icon={<Clock3 className="size-4" />} label="Estimated duration" value={task.estimatedDurationMinutes ? `${task.estimatedDurationMinutes} minutes` : "Not specified"} />
                <InfoCard icon={<UserRound className="size-4" />} label="Assigned to" value={task.assignedToUserId ?? "Unassigned"} />
                <InfoCard icon={<FileText className="size-4" />} label="Department" value={formatLabel(task.department)} />
                <InfoCard icon={<Bot className="size-4" />} label="Proposed by" value={task.proposedByAgent?.name ? `${task.proposedByAgent.name}${task.proposedByAgent.type ? ` · ${formatLabel(task.proposedByAgent.type)}` : ""}` : "Not specified"} />
                <InfoCard icon={<CheckCircle2 className="size-4" />} label="Reminder" value={task.reminder?.enabled ? `${task.reminder.minutesBeforeDue ?? 0} minutes before` : "Disabled"} />
              </section>

              {task.tags?.length ? (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 font-medium text-[#0E1224]">
                    <Tag className="size-4 text-[#5B7FF0]" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-[#5B7FF0]/10 px-3 py-1.5 text-sm text-[#5B7FF0]">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <Checklist title="Dependencies" items={task.dependencies} emptyText="No dependencies added." />
                <Checklist title="Subtasks" items={task.subtasks} emptyText="No subtasks added." />
                <Checklist title="Required attachments" items={task.requiredAttachments} emptyText="No required attachments." />
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-medium text-[#0E1224]">
                      <Link2 className="size-4 text-[#5B7FF0]" /> Attachments
                    </h3>
                    <span className="rounded-full bg-[#F5F7FF] px-2 py-0.5 text-xs text-[#8B93B8]">
                      {task.attachments?.length ?? 0}
                    </span>
                  </div>
                  {task.attachments?.length ? (
                    <div className="space-y-2">
                      {task.attachments.map((attachment, index) => {
                        const name = typeof attachment === "string" ? attachment : attachment.name ?? `Attachment ${index + 1}`;
                        const url = typeof attachment === "string" ? attachment : attachment.url;
                        return url ? (
                          <a key={`${name}-${index}`} href={url} target="_blank" rel="noreferrer" className="block truncate rounded-lg border border-[#E4EAF8] p-3 text-sm text-[#5B7FF0] hover:bg-[#F5F7FF]">{name}</a>
                        ) : (
                          <p key={`${name}-${index}`} className="truncate rounded-lg border border-[#E4EAF8] p-3 text-sm text-[#0E1224]">{name}</p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-[#F5F7FF] p-3 text-sm text-[#8B93B8]">No attachments uploaded.</p>
                  )}
                </section>
              </div>

              <section className="rounded-xl border border-[#E4EAF8] p-4">
                <h3 className="flex items-center gap-2 font-medium text-[#0E1224]">
                  <Bot className="size-4 text-[#5B7FF0]" /> AI assistance
                </h3>
                {enabledAiOptions.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {enabledAiOptions.map(([option]) => (
                      <span key={option} className="rounded-lg bg-[#F5F7FF] px-3 py-1.5 text-sm text-[#64748B]">{formatLabel(option)}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#8B93B8]">No AI assistance enabled.</p>
                )}
              </section>

              <footer className="grid gap-2 border-t border-[#E4EAF8] pt-4 text-xs text-[#8B93B8] sm:grid-cols-2">
                <p>Created: {formatDate(task.createdAt, true)}</p>
                <p className="sm:text-right">Last updated: {formatDate(task.updatedAt, true)}</p>
              </footer>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
