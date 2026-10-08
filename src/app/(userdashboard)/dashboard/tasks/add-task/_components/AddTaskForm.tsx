"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
// Retained for the commented stakeholder UI, which will be restored later.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleX,
  CloudUpload,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-[#F5F7FF]" />,
});

const fieldClass =
  "h-14 min-w-0 rounded-xl border-0 bg-[#F5F7FF] px-4 text-base text-[#8B93B8] md:text-base shadow-none placeholder:text-[#8B93B8] focus-visible:ring-[#5B7FF0]";
const initialDependencies = [
  "Finance to provide latest numbers",
  "Supplier pricing update",
  "Customer contract finalization",
  "Ops to confirm margin rules",
  "Review compliance with pricing objectives",
];
const initialRequiredAttachments = [
  "Excel (.xlsx) file",
  "PDF copy",
  "Approval document",
  "Customer contract",
];
const initialStakeholders = [
  { id: "marketing-director", name: "Marketing director", image: 1 },
  { id: "finance-lead", name: "Finance lead", image: 2 },
  { id: "sales-manager", name: "Sales manager", image: 3 },
  { id: "operations-lead", name: "Operations lead", image: 4 },
];
const assistance = [
  "Generate AI checklist",
  "Suggest Next Steps",
  "Recommend Deadline",
  "Auto Create Subtasks",
];

type TaskStatus =
  | "DRAFT"
  | "TODO"
  | "IN_PROGRESS"
  | "WAITING"
  | "BLOCKED"
  | "COMPLETED";

type CreateTaskPayload = {
  title: string;
  description: string;
  assignedToUserId: string;
  department: string;
  priority: string;
  status: TaskStatus;
  dueDate: string;
  estimatedDurationMinutes: number;
  stakeholderIds: string[];
  dependencies: Array<{ title: string; isComplete: boolean }>;
  attachments: Array<{
    name: string;
    url: string;
    kind: "FILE" | "LINK";
    mimeType?: string;
    sizeBytes?: number;
  }>;
  requiredAttachments: Array<{ name: string; isComplete: boolean }>;
  aiAssistance: {
    generateChecklist: boolean;
    suggestNextSteps: boolean;
    recommendDeadline: boolean;
    autoCreateSubtasks: boolean;
  };
  reminder: { enabled: boolean; minutesBeforeDue: number };
  subtasks: Array<{
    title: string;
    isComplete: boolean;
    dueDate?: string;
  }>;
  tags: string[];
};

type CreateTaskResponse = {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
};

export type EditableTask = {
  title: string;
  description?: string;
  assignedToUserId?: string;
  department?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  estimatedDurationMinutes?: number;
  stakeholderIds?: string[];
  dependencies?: Array<{ title?: string; name?: string; isComplete?: boolean }>;
  attachments?: Array<
    | string
    | {
        name?: string;
        url?: string;
        kind?: "FILE" | "LINK";
        mimeType?: string;
        sizeBytes?: number;
      }
  >;
  requiredAttachments?: Array<{
    title?: string;
    name?: string;
    isComplete?: boolean;
  }>;
  aiAssistance?: CreateTaskPayload["aiAssistance"];
  reminder?: CreateTaskPayload["reminder"];
  subtasks?: CreateTaskPayload["subtasks"];
  tags?: string[];
};

type Agent = {
  _id: string;
  name: string;
  nameKey: string;
  imageUrl?: string;
  type: string;
  status: string;
};

type AgentsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items: Agent[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

type SelectOption = string | { label: string; value: string };

const statusValues: Record<string, TaskStatus> = {
  Draft: "DRAFT",
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  Waiting: "WAITING",
  Blocked: "BLOCKED",
  Completed: "COMPLETED",
};

const durationValues: Record<string, number> = {
  "30 Minutes": 30,
  "1 Hour": 60,
  "2 Hours": 120,
};

const reminderValues: Record<string, number> = {
  "30 Minutes": 30,
  "1 Hour": 60,
  "1 Day": 1440,
};

function getMessage(result: CreateTaskResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function hasEditorContent(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;
}

function formatStatus(value?: string) {
  return Object.entries(statusValues).find(([, status]) => status === value)?.[0] ?? "";
}

function formatDuration(minutes?: number) {
  return Object.entries(durationValues).find(([, value]) => value === minutes)?.[0] ?? "";
}

function formatReminder(minutes?: number) {
  return Object.entries(reminderValues).find(([, value]) => value === minutes)?.[0] ?? "";
}

function formatSelectValue(value?: string) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-base font-normal text-[#0E1224]">
      {children}
    </label>
  );
}
function FormSelect({
  placeholder,
  options,
  value,
  onValueChange,
  disabled = false,
}: {
  placeholder: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!selectRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const selectedOption = options.find((option) =>
    typeof option === "string" ? option === value : option.value === value,
  );
  const selectedLabel =
    typeof selectedOption === "string" ? selectedOption : selectedOption?.label;

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        aria-label={placeholder}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={`${fieldClass} flex w-full items-center justify-between gap-3 rounded-xl text-left outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-[#8B93B8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={placeholder}
          className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-[#E4EAF8] bg-[#F5F7FF] p-1 shadow-lg"
        >
          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;
            const optionLabel =
              typeof option === "string" ? option : option.label;

            return (
              <button
                type="button"
                role="option"
                aria-selected={value === optionValue}
                key={optionValue}
                onClick={() => {
                  onValueChange(optionValue);
                  setOpen(false);
                }}
                className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-base text-[#60708E] outline-none hover:bg-white focus:bg-white focus:text-[#0E1224]"
              >
                <span className="truncate">{optionLabel}</span>
                {value === optionValue && (
                  <Check className="size-4 shrink-0 text-[#5B7FF0]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AddTaskForm({
  onCancel,
  taskId,
  initialTask,
  onSuccess,
}: {
  onCancel: () => void;
  taskId?: string;
  initialTask?: EditableTask;
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(taskId && initialTask);
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState(() => formatStatus(initialTask?.status));
  const [reminder, setReminder] = useState(initialTask?.reminder?.enabled ?? true);
  const [aiOptions, setAiOptions] = useState<string[]>(() => {
    const options = initialTask?.aiAssistance;
    if (!options) return [];
    return assistance.filter((item) => {
      if (item === "Generate AI checklist") return options.generateChecklist;
      if (item === "Suggest Next Steps") return options.suggestNextSteps;
      if (item === "Recommend Deadline") return options.recommendDeadline;
      return options.autoCreateSubtasks;
    });
  });
  const [tags, setTags] = useState<string[]>(() =>
    (initialTask?.tags ?? []).map((tag) => tag.replace(/^#/, "")),
  );
  const [tagInput, setTagInput] = useState("");
  const [required, setRequired] = useState<string[]>(() =>
    (initialTask?.requiredAttachments ?? [])
      .filter((item) => item.isComplete)
      .map((item) => item.name ?? item.title ?? "")
      .filter(Boolean),
  );
  const [assignTo, setAssignTo] = useState(initialTask?.assignedToUserId ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [department, setDepartment] = useState(() =>
    formatSelectValue(initialTask?.department),
  );
  const [priority, setPriority] = useState(() =>
    formatSelectValue(initialTask?.priority),
  );
  const [duration, setDuration] = useState(() =>
    formatDuration(initialTask?.estimatedDurationMinutes),
  );
  const [reminderTime, setReminderTime] = useState(() =>
    formatReminder(initialTask?.reminder?.minutesBeforeDue),
  );
  const [aiAssistance, setAiAssistance] = useState("");
  const [stakeholder, setStakeholder] = useState("");
  const [subtasks, setSubtasks] = useState(
    initialTask?.subtasks?.length ? "03:00 PM" : "",
  );
  const [dependencies, setDependencies] = useState(() =>
    initialTask
      ? (initialTask.dependencies ?? [])
          .map((item) => item.title ?? item.name ?? "")
          .filter(Boolean)
      : initialDependencies,
  );
  const [completedDependencies, setCompletedDependencies] = useState<string[]>(
    () =>
      (initialTask?.dependencies ?? [])
        .filter((item) => item.isComplete)
        .map((item) => item.title ?? item.name ?? "")
        .filter(Boolean),
  );
  // Kept for the commented stakeholder UI, which will be restored later.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stakeholders, setStakeholders] = useState(initialStakeholders);
  const [requiredAttachments, setRequiredAttachments] = useState(() =>
    initialTask
      ? (initialTask.requiredAttachments ?? [])
          .map((item) => item.name ?? item.title ?? "")
          .filter(Boolean)
      : initialRequiredAttachments,
  );
  const [addTarget, setAddTarget] = useState<
    "dependency" | "stakeholder" | "attachment" | null
  >(null);
  const [newItem, setNewItem] = useState("");
  const accessToken = session?.user.accessToken;
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const agentsQuery = useQuery({
    queryKey: ["agents"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/agents`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as AgentsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load agents."));
      }

      return result.data.items;
    },
  });

  const agentOptions = (agentsQuery.data ?? []).map((agent) => ({
    label: agent.name,
    value: agent._id,
  }));

  const createTask = useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const accessToken = session?.user.accessToken;

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        isEditing
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks/${encodeURIComponent(taskId!)}`
          : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CreateTaskResponse;

      if (!response.ok || result.success === false) {
        throw new Error(
          getMessage(result, isEditing ? "Unable to update task" : "Unable to create task"),
        );
      }

      return result;
    },
    onSuccess: (result) => {
      toast.success(
        getMessage(
          result,
          isEditing ? "Task updated successfully." : "Task created successfully.",
        ),
      );
      (onSuccess ?? onCancel)();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Unable to update task"
            : "Unable to create task",
      );
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignedToUserId = assignTo;

    if (!assignedToUserId) {
      toast.error("Please select an agent.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const dueDateValue = String(formData.get("dueDate") ?? "");
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const submittedStatus =
      submitter?.value === "DRAFT" ? "DRAFT" : statusValues[status];

    if (!title || !hasEditorContent(description) || !dueDateValue) {
      toast.error("Task name, description, and due date are required.");
      return;
    }

    if (!department || !priority || !duration || !status) {
      toast.error("Department, priority, duration, and status are required.");
      return;
    }

    if (reminder && !reminderTime) {
      toast.error("Please select a reminder time.");
      return;
    }

    const dueDate = new Date(`${dueDateValue}T00:00:00.000Z`).toISOString();
    const pendingTag = tagInput.replace(/^#+/, "").trim();
    const submittedTags = pendingTag
      ? tags.some((tag) => tag.toLowerCase() === pendingTag.toLowerCase())
        ? tags
        : [...tags, pendingTag]
      : tags;
    const payload: CreateTaskPayload = {
      title,
      description,
      assignedToUserId,
      department: department.toUpperCase(),
      priority: priority.toUpperCase(),
      status: submittedStatus,
      dueDate,
      estimatedDurationMinutes: durationValues[duration] ?? 60,
      stakeholderIds: initialTask?.stakeholderIds ?? [],
      dependencies: dependencies.map((title) => ({
        title,
        isComplete: completedDependencies.includes(title),
      })),
      attachments: (initialTask?.attachments ?? []).map((attachment) =>
        typeof attachment === "string"
          ? {
              name: attachment.split("/").pop() || "Attachment",
              url: attachment,
              kind: "LINK" as const,
            }
          : {
              name: attachment.name ?? "Attachment",
              url: attachment.url ?? "",
              kind: attachment.kind ?? "LINK",
              ...(attachment.mimeType ? { mimeType: attachment.mimeType } : {}),
              ...(typeof attachment.sizeBytes === "number"
                ? { sizeBytes: attachment.sizeBytes }
                : {}),
            },
      ),
      requiredAttachments: requiredAttachments.map((name) => ({
        name,
        isComplete: required.includes(name),
      })),
      aiAssistance: {
        generateChecklist: aiOptions.includes("Generate AI checklist"),
        suggestNextSteps: aiOptions.includes("Suggest Next Steps"),
        recommendDeadline: aiOptions.includes("Recommend Deadline"),
        autoCreateSubtasks: aiOptions.includes("Auto Create Subtasks"),
      },
      reminder: {
        enabled: reminder,
        minutesBeforeDue: reminderValues[reminderTime] ?? 60,
      },
      subtasks: isEditing
        ? (initialTask?.subtasks ?? [])
        : subtasks === "03:00 PM"
          ? [
              {
                title: "Complete task follow-up",
                isComplete: false,
                dueDate,
              },
            ]
          : [],
      tags: submittedTags.map((tag) => `#${tag}`),
    };

    createTask.mutate(payload);
  };
  const toggleValue = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) =>
    setter((values) =>
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  const addItem = () => {
    const item = newItem.trim();
    if (!item || !addTarget) return;

    if (addTarget === "dependency") {
      setDependencies((items) => [...items, item]);
    }
    if (addTarget === "stakeholder") {
      setStakeholders((items) => [
        ...items,
        { id: `${item}-${Date.now()}`, name: item, image: ((items.length % 4) + 1) as 1 | 2 | 3 | 4 },
      ]);
    }
    if (addTarget === "attachment") {
      setRequiredAttachments((items) => [...items, item]);
    }

    setNewItem("");
    setAddTarget(null);
  };
  const openAddDialog = (target: NonNullable<typeof addTarget>) => {
    setNewItem("");
    setAddTarget(target);
  };
  const addTag = () => {
    const nextTag = tagInput.replace(/^#+/, "").trim();
    if (!nextTag) return;

    setTags((current) =>
      current.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())
        ? current
        : [...current, nextTag],
    );
    setTagInput("");
  };
  const dialogCopy = {
    dependency: { title: "Add dependency", label: "Dependency name" },
    stakeholder: { title: "Add stakeholder", label: "Stakeholder name" },
    attachment: { title: "Add required attachment", label: "Attachment name" },
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full  space-y-4 bg-white px-4 pb-4 pt-8 text-[#0E1224] [&_input[type=checkbox]]:shrink-0">
      <header className="flex items-start justify-between border-b border-[#E4EAF8] pb-4">
        <div>
          <h2 className="text-xl font-medium text-[#0E1224]">
            {isEditing ? "Edit Task" : "Add New Task"}
          </h2>
          <p className="mt-2 text-base text-[#8B93B8]">
            {isEditing
              ? "Update task information and save your changes"
              : "Create a task manually or assign it to an AI agent"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label={isEditing ? "Close edit task" : "Close add task"}
          className="text-[#8B93B8]"
        >
          <CircleX className="size-6" strokeWidth={1.25} />
        </button>
      </header>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Task Name</FieldLabel>
            <Input
              name="title"
              required
              defaultValue={initialTask?.title ?? ""}
              placeholder="Enter task name"
              disabled={createTask.isPending}
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel>Assign To</FieldLabel>
            <FormSelect
              placeholder={
                agentsQuery.isLoading
                  ? "Loading agents..."
                  : agentsQuery.isError
                    ? "Unable to load agents"
                    : "Assign to agent"
              }
              options={agentOptions}
              value={assignTo}
              onValueChange={setAssignTo}
              disabled={agentsQuery.isLoading || agentsQuery.isError}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <div className="support-quill overflow-hidden rounded-2xl border border-[#F5F7FF] bg-[#F5F7FF]">
            <ReactQuill
              id="task-description"
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={quillModules}
              readOnly={createTask.isPending}
              placeholder="Enter task description"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 bg-[#F5F7FF] px-3 py-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 sm:p-6">
          <h3 className="text-xl font-medium text-[#0E1224]">Dependencies</h3>
          <div className="my-4 flex-1 space-y-3">
            {dependencies.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1.5 text-sm text-[#0E1224]"
              >
                <label className="flex min-w-0 flex-1 items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={completedDependencies.includes(item)}
                    onChange={() => toggleValue(item, setCompletedDependencies)}
                    className="size-4 accent-[#5B7FF0]"
                  />
                  <span className="truncate">{item}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDependencies((items) => items.filter((entry) => entry !== item))}
                  aria-label={`Remove ${item}`}
                  className="rounded p-1 text-[#8B93B8] hover:bg-[#E4EAF8] hover:text-[#0E1224]"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => openAddDialog("dependency")}
            className="mt-auto min-h-[52px] w-full whitespace-normal border-[#5B7FF0] px-2 text-base font-normal text-[#5B7FF0] shadow-none"
          >
            <Plus className="size-3" />
            Add Dependency
          </Button>
        </div>
        {/* <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 sm:p-6">
          <h3 className="text-xl font-medium text-[#0E1224]">Stakeholder</h3>
          <div className="my-4 flex-1 space-y-3">
            {stakeholders.map((person) => (
                <div
                  className="flex h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] pr-2 text-sm"
                  key={person.id}
                >
                  <i className="h-[18px] w-1 rounded bg-[#10B981]" />
                  <Image src={`/add-task/stakeholder-${person.image}.png`} alt={person.name} width={18} height={18} className="size-[18px] rounded-full" />
                  <span className="flex-1 text-[#8B93B8]">
                    {person.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStakeholders((items) => items.filter((item) => item.id !== person.id))}
                    aria-label={`Remove ${person.name}`}
                    className="rounded p-1 text-[#8B93B8] hover:bg-white hover:text-[#0E1224]"
                  >
                    <X className="size-3" />
                  </button>
                </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => openAddDialog("stakeholder")}
            className="mt-auto min-h-[52px] w-full whitespace-normal border-[#5B7FF0] px-2 text-base font-normal text-[#5B7FF0] shadow-none"
          >
            <Plus className="size-3" />
            Add Stakeholder
          </Button>
        </div> */}
        <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 sm:p-6">
          <h3 className="text-xl font-medium text-[#0E1224]">
            Required Attachments
          </h3>
          <div className="my-4 flex-1 space-y-3">
            {requiredAttachments.map((item) => (
              <div
                className="flex items-center gap-1.5 text-sm text-[#0E1224]"
                key={item}
              >
                <label className="flex min-w-0 flex-1 items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={required.includes(item)}
                    onChange={() => toggleValue(item, setRequired)}
                    className="size-4 accent-[#5B7FF0]"
                  />
                  <span className="truncate">{item}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRequiredAttachments((items) => items.filter((entry) => entry !== item));
                    setRequired((items) => items.filter((entry) => entry !== item));
                  }}
                  aria-label={`Remove ${item}`}
                  className="rounded p-1 text-[#8B93B8] hover:bg-[#E4EAF8] hover:text-[#0E1224]"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => openAddDialog("attachment")}
            className="mt-auto min-h-[52px] w-full whitespace-normal border-[#5B7FF0] px-2 text-base font-normal text-[#5B7FF0] shadow-none"
          >
            <Plus className="size-3" />
            Add Required Attachment
          </Button>
        </div>
      </section>

      <section className="bg-[#F5F7FF] px-3 py-4">
        <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 sm:p-6">
          <h3 className="text-xl font-medium text-[#0E1224]">
            Attachments &amp; Links
          </h3>
          <label className="mt-4 flex min-h-[188px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#F5F7FF] p-4 text-center">
            <CloudUpload className="size-10 text-[#0E1224]" />
            <span className="mt-4 text-base text-[#8B93B8]">
              Drag &amp; drop files here or
            </span>
            <span className="text-base font-medium text-[#5B7FF0]">
              Browse File
            </span>
            <span className="mt-1 text-base text-[#8B93B8]">
              Support: PDF, JPG, PNG
            </span>
            <input type="file" disabled={createTask.isPending} className="sr-only" />
          </label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FieldLabel>Department</FieldLabel>
          <FormSelect
            placeholder="Department"
            options={[
              "Sales",
              "Finance",
              "Operations",
              "Support",
              "Strategy",
              "Design",
              "Marketing",
            ]}
            value={department}
            onValueChange={setDepartment}
          />
        </div>
        <div>
          <FieldLabel>Priority</FieldLabel>
          <FormSelect
            placeholder="Priority"
            options={["Low", "Medium", "High"]}
            value={priority}
            onValueChange={setPriority}
          />
        </div>
        <div>
          <FieldLabel>Estimated Duration</FieldLabel>
          <FormSelect
            placeholder="Duration"
            options={["1 Hour", "30 Minutes", "2 Hours"]}
            value={duration}
            onValueChange={setDuration}
          />
        </div>
      </section>
      <section>
        <FieldLabel>Status</FieldLabel>
        <div className="grid max-w-[754px] grid-cols-2 gap-4 sm:grid-cols-5">
          {["Draft", "To Do", "In Progress", "Waiting", "Blocked", "Completed"].map(
            (item) => (
              <button
                type="button"
                onClick={() => setStatus(item)}
                key={item}
                className={`min-h-9 rounded-[8px] px-2 py-2 text-base transition-colors ${status === item ? "bg-[#5B7FF0] text-white" : "bg-[#F5F7FF] text-[#64748B]"}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FieldLabel>Due Date</FieldLabel>
          <div className="relative">
            <Input
              name="dueDate"
              type="date"
              defaultValue={initialTask?.dueDate?.slice(0, 10) ?? ""}
              required
              disabled={createTask.isPending}
              className={`${fieldClass} pr-10`}
            />
            <CalendarDays className="pointer-events-none absolute right-4 top-3.5 size-5 text-[#8B93B8]" />
          </div>
        </div>
        <div>
          <FieldLabel>Estimated Duration</FieldLabel>
          <FormSelect
            placeholder="Duration"
            options={["1 Hour", "30 Minutes", "2 Hours"]}
            value={duration}
            onValueChange={setDuration}
          />
        </div>
        <div>
          <FieldLabel>AI Assistance</FieldLabel>
          <FormSelect
            placeholder="AI Assistance"
            options={["May 16, 2026", "No assistance"]}
            value={aiAssistance}
            onValueChange={setAiAssistance}
          />
        </div>
        <div>
          <FieldLabel>Stakeholder</FieldLabel>
          <FormSelect
            placeholder="Stakeholder"
            options={["Marketing director", "Finance lead"]}
            value={stakeholder}
            onValueChange={setStakeholder}
          />
        </div>
        <div>
          <FieldLabel>Subtasks</FieldLabel>
          <FormSelect
            placeholder="Subtasks"
            options={["03:00 PM", "No subtasks"]}
            value={subtasks}
            onValueChange={setSubtasks}
          />
        </div>
        <div>
          <FieldLabel>Tags</FieldLabel>
          <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-xl bg-[#F5F7FF] px-3 py-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-sm text-[#8B93B8]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() =>
                    setTags((current) =>
                      current.filter((currentTag) => currentTag !== tag),
                    )
                  }
                  aria-label={`Remove ${tag} tag`}
                  className="rounded text-[#8B93B8] hover:text-[#0E1224]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder={tags.length ? "Add another tag" : "Type a tag"}
              disabled={createTask.isPending}
              className="h-8 min-w-[120px] flex-1 bg-transparent text-sm text-[#0E1224] outline-none placeholder:text-[#8B93B8]"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || createTask.isPending}
              aria-label="Add tag"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#5B7FF0]" />
            <p className="text-xl font-medium text-[#0E1224]">
              Ai Context{" "}
              <span className="text-xs font-normal">
                (Let ai help you execute better)
              </span>
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {assistance.map((item) => (
              <label
                className="flex items-center gap-1.5 text-sm text-[#0E1224]"
                key={item}
              >
                <input
                  type="checkbox"
                  checked={aiOptions.includes(item)}
                  onChange={() => toggleValue(item, setAiOptions)}
                  className="size-4 accent-[#5B7FF0]"
                />
                {item}
              </label>
            ))}
          </div>
        </div>
        <div className="min-w-0 bg-white px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-base font-medium text-[#0E1224]"><Bell className="size-6 text-[#5B7FF0]" strokeWidth={1.25} />Reminder</p>
            <button
              type="button"
              onClick={() => setReminder((value) => !value)}
              aria-label="Reminder"
              role="switch"
              aria-checked={reminder}
              className={`relative h-6 w-12 rounded-full transition ${reminder ? "bg-[#5B7FF0]" : "bg-[#CBD5E1]"}`}
            >
              <span
                className={`absolute top-1 size-4 rounded-full bg-white transition ${reminder ? "right-1" : "left-1"}`}
              />
            </button>
          </div>
          <div className="mt-6">
            <FormSelect
              placeholder="Reminder time"
              options={["1 Hour", "30 Minutes", "1 Day"]}
              value={reminderTime}
              onValueChange={setReminderTime}
            />
          </div>
        </div>
      </section>
      <footer
        className={`grid gap-4 ${isEditing ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createTask.isPending}
          className="h-[52px] border-[#5B7FF0] text-base text-[#5B7FF0] shadow-none"
        >
          Cancel
        </Button>
        {!isEditing && (
          <Button
            type="submit"
            value="DRAFT"
            variant="outline"
            disabled={createTask.isPending}
            className="h-[52px] border-[#5B7FF0] text-base text-[#5B7FF0] shadow-none"
          >
            {createTask.isPending ? "Saving..." : "Save Draft"}
          </Button>
        )}
        <Button
          type="submit"
          value="CREATE"
          disabled={createTask.isPending}
          className="h-[52px] bg-[#5B7FF0] text-base shadow-none hover:bg-[#4E6FDE] text-white"
        >
          {createTask.isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Task"
              : "Create Task"}
        </Button>
      </footer>
      <Dialog
        modal={false}
        open={addTarget !== null}
        onOpenChange={(open) => !open && setAddTarget(null)}
      >
        <DialogContent
          nonModalOverlay
          overlayClassName="bg-black/10 backdrop-blur-[5px]"
          className="max-h-[calc(100dvh-32px)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border-[#E4EAF8] bg-white p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-[#0E1224]">
              {addTarget ? dialogCopy[addTarget].title : "Add item"}
            </DialogTitle>
            <DialogDescription className="text-base text-[#8B93B8]">
              Enter the item you want to add to this task.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItem();
              }
            }}
            placeholder={addTarget ? dialogCopy[addTarget].label : "Item name"}
            className={fieldClass}
          />
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setAddTarget(null)}
              className="h-11 bg-[#5B7FF0] text-white hover:bg-[#4E6FDE] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addItem}
              disabled={!newItem.trim()}
              className="h-11 bg-[#5B7FF0] text-white hover:bg-[#4E6FDE] hover:text-white"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
