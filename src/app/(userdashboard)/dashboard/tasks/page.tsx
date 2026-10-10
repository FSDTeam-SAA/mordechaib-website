"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Pagination } from "@/components/share/Pagination";
import { DeleteTaskModal } from "./_components/DeleteTaskModal";
import {
  TaskDetailsModal,
  type TaskDetailsData,
} from "./_components/TaskDetailsModal";
import { TaskListCard } from "./_components/TaskListCard";
import { TaskListSkeleton } from "./_components/TaskListSkeleton";
import {
  TaskOverviewError,
  TaskStatsSkeleton,
  TaskSummarySkeleton,
} from "./_components/TaskOverviewSkeleton";
import { SummaryDonutCard } from "./_components/SummaryDonutCard";
import type { Task } from "./_components/TaskItem";
import { TaskStatCard } from "./_components/TaskStatCard";
import {
  UpcomingCalendarCard,
  type UpcomingMeeting,
} from "./_components/UpcomingCalendarCard";
import { UpcomingCalendarSkeleton } from "./_components/UpcomingCalendarSkeleton";

type TaskCounts = {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  pending: number;
};

type ComparisonValue = {
  current: number;
  previous: number;
  changePercent: number;
};

type ScoreValue = {
  availability: string;
  value: number | null;
  reason?: string;
};

type TaskOverview = TaskCounts & {
  asOf: string;
  timezone: string;
  period: {
    type: string;
    comparison: Record<keyof TaskCounts, ComparisonValue>;
    series: Array<TaskCounts & { date: string }>;
  };
  productivity: {
    period: string;
    counts: TaskCounts;
    completionRate: number;
    overallScore: ScoreValue;
  };
  taskBreakdown: {
    period: string;
    items: Array<{
      department: string;
      count: number;
      percentage: number;
    }>;
    averageScore: ScoreValue;
  };
};

type TaskOverviewResponse = {
  success?: boolean;
  message?: string | string[];
  data?: TaskOverview;
};

type ApiTask = {
  id: string;
  title: string;
  description?: string;
  assignedToUserId?: string | { id?: string; name?: string; type?: string };
  department?: string;
  priority?: string;
  status: string;
  dueDate?: string;
  tags?: string[];
  proposedByAgent?: { name?: string; type?: string };
};

type TasksResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    items: ApiTask[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

type TaskActionResponse = {
  success?: boolean;
  message?: string | string[];
};

type TaskDetailsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: TaskDetailsData;
};

type UpcomingMeetingsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    asOf: string;
    items: UpcomingMeeting[];
  };
};

type TaskFilters = {
  statusGroup: string;
  priority: string;
  department: string;
  assignedToUserId: string;
  dueFrom: string;
  dueTo: string;
};

const pageSize = 20;
const tabs = ["All", "To Do", "Completed", "In Progress"] as const;
const tabStatuses: Record<(typeof tabs)[number], string> = {
  All: "",
  "To Do": "TODO",
  Completed: "COMPLETED",
  "In Progress": "IN_PROGRESS",
};
const emptyFilters: TaskFilters = {
  statusGroup: "",
  priority: "",
  department: "",
  assignedToUserId: "",
  dueFrom: "",
  dueTo: "",
};

const statCards = [
  { dataKey: "pending", icon: "/calendar/total.svg", chartColor: "#5B7FF0", label: "To Do", color: "text-[#5B7FF0]", background: "bg-[#5B7FF0]/10" },
  { dataKey: "completed", icon: "/calendar/confirmed.svg", chartColor: "#10B981", label: "Completed", color: "text-[#10B981]", background: "bg-[#10B981]/10" },
  { dataKey: "inProgress", icon: "/calendar/pending.svg", chartColor: "#F59E0B", label: "In Progress", color: "text-[#F59E0B]", background: "bg-[#F59E0B]/10" },
  { dataKey: "total", icon: "/dashboard-cards/tasks.svg", chartColor: "#D24FC7", label: "Total Tasks", color: "text-[#D24FC7]", background: "bg-[#D24FC7]/10" },
] as const;

const departmentColors = ["#10B981", "#264AFF", "#F59E0B", "#8B93B8", "#EF4444", "#D24FC7", "#06B6D4", "#84CC16", "#A855F7"] as const;

function getMessage(result: { message?: string | string[] }, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function formatLabel(value: string) {
  return value.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function formatDueDate(value?: string) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function mapPriority(priority?: string): Task["priority"] {
  const normalized = priority?.toUpperCase();
  if (normalized === "HIGH" || normalized === "URGENT") return "High";
  if (normalized === "LOW") return "Low";
  return "Medium";
}

function mapTask(task: ApiTask): Task {
  const owner = task.proposedByAgent?.name
    ? `${task.proposedByAgent.name}${task.proposedByAgent.type ? ` (${formatLabel(task.proposedByAgent.type)})` : ""}`
    : task.department
      ? formatLabel(task.department)
      : typeof task.assignedToUserId === "object" && task.assignedToUserId?.name
        ? `${task.assignedToUserId.name}${task.assignedToUserId.type ? ` (${formatLabel(task.assignedToUserId.type)})` : ""}`
        : typeof task.assignedToUserId === "string"
          ? `User ${task.assignedToUserId.slice(-6)}`
        : "Unassigned";

  return {
    id: task.id,
    title: task.title,
    description: task.description || "No description",
    owner,
    due: formatDueDate(task.dueDate),
    tags: (task.tags ?? []).map((tag) => tag.replace(/^#/, "")),
    priority: mapPriority(task.priority),
    done: task.status.toUpperCase() === "COMPLETED",
  };
}

const inputClassName = "h-10 w-full rounded-[12px] border border-[#E4EAF8] bg-white px-3 text-sm text-[#0E1224] outline-none focus:border-[#5B7FF0]";

export default function TaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(query.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const overviewQuery = useQuery({
    queryKey: ["organizer-dashboard", "task-overview"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/task-overview`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => ({}))) as TaskOverviewResponse;
      if (!response.ok || !result.success || !result.data) throw new Error(getMessage(result, "Unable to load task overview."));
      return result.data;
    },
  });

  const upcomingMeetingsQuery = useQuery({
    queryKey: ["organizer-dashboard", "upcoming-meetings"],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/upcoming-meetings`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as UpcomingMeetingsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load upcoming meetings."));
      }
      return result.data;
    },
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", page, pageSize, debouncedSearch, activeTab, filters],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (tabStatuses[activeTab]) params.set("status", tabStatuses[activeTab]);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => ({}))) as TasksResponse;
      if (!response.ok || !result.success || !result.data) throw new Error(getMessage(result, "Unable to load tasks."));
      return result.data;
    },
  });

  const taskDetailsQuery = useQuery({
    queryKey: ["task-details", detailsTaskId],
    enabled:
      Boolean(detailsTaskId) &&
      sessionStatus === "authenticated" &&
      Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken || !detailsTaskId) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks/${encodeURIComponent(detailsTaskId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TaskDetailsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load task details."));
      }
      return result.data;
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks/${encodeURIComponent(taskId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TaskActionResponse;

      if (!response.ok || result.success === false) {
        throw new Error(getMessage(result, "Unable to delete task."));
      }
      return result;
    },
    onSuccess: (result) => {
      setTaskToDelete(null);
      toast.success(getMessage(result, "Task deleted successfully."));
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard", "task-overview"],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete task.",
      );
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: "COMPLETED" | "TODO";
    }) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks/${encodeURIComponent(taskId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TaskActionResponse;

      if (!response.ok || result.success === false) {
        throw new Error(getMessage(result, "Unable to update task status."));
      }
      return { result, status };
    },
    onSuccess: ({ result, status }) => {
      toast.success(
        getMessage(
          result,
          status === "COMPLETED"
            ? "Task marked as complete."
            : "Task marked as incomplete.",
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["task-details"] });
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard", "task-overview"],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update task status.",
      );
    },
  });

  useEffect(() => {
    const error = tasksQuery.error ?? overviewQuery.error;
    if (error) toast.error(error instanceof Error ? error.message : "Unable to load task data.");
  }, [overviewQuery.error, tasksQuery.error]);

  useEffect(() => {
    const totalPages = tasksQuery.data?.pages;
    if (totalPages && page > totalPages) setPage(totalPages);
  }, [page, tasksQuery.data?.pages]);

  const tasks = useMemo(() => (tasksQuery.data?.items ?? []).map(mapTask), [tasksQuery.data?.items]);
  const apiItems = tasksQuery.data?.items ?? [];
  const todoTasks = tasks.filter((task) => {
    const status = apiItems.find((item) => item.id === task.id)?.status.toUpperCase();
    return !task.done && status !== "IN_PROGRESS";
  });
  const inProgressTasks = tasks.filter((task) => !task.done && apiItems.find((item) => item.id === task.id)?.status.toUpperCase() === "IN_PROGRESS");
  const completedTasks = tasks.filter((task) => task.done);

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };
  const changeTab = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
    setPage(1);
  };

  const overview = overviewQuery.data;
  const isOverviewLoading = sessionStatus === "loading" || overviewQuery.isLoading;
  const isTasksLoading = sessionStatus === "loading" || (tasksQuery.isLoading && !tasksQuery.data);
  const productivityLegend = overview ? [
    { label: "Completed", value: String(overview.productivity.counts.completed), amount: overview.productivity.counts.completed, color: "#10B981" },
    { label: "To Do", value: String(overview.productivity.counts.pending), amount: overview.productivity.counts.pending, color: "#264AFF" },
    { label: "In Progress", value: String(overview.productivity.counts.inProgress), amount: overview.productivity.counts.inProgress, color: "#F59E0B" },
    { label: "Overdue", value: String(overview.productivity.counts.overdue), amount: overview.productivity.counts.overdue, color: "#EF4444" },
  ] : [];
  const breakdownLegend = overview?.taskBreakdown.items.map((item, index) => ({
    label: formatLabel(item.department), value: `${item.percentage}%`, amount: item.percentage, color: departmentColors[index % departmentColors.length],
  })) ?? [];
  const updateTaskStatus = (id: string | number) => {
    const selectedTask = tasks.find((task) => String(task.id) === String(id));
    if (!selectedTask || updateTaskStatusMutation.isPending) return;

    updateTaskStatusMutation.mutate({
      taskId: String(id),
      status: selectedTask.done ? "TODO" : "COMPLETED",
    });
  };
  const openDeleteModal = (id: string | number) => {
    const selectedTask = tasks.find((task) => String(task.id) === String(id));
    if (selectedTask) setTaskToDelete(selectedTask);
  };
  const openDetailsModal = (id: string | number) => {
    setDetailsTaskId(String(id));
  };
  const openEditPage = (id: string | number) => {
    router.push(`/dashboard/tasks/edit-task/${encodeURIComponent(String(id))}`);
  };
  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(String(taskToDelete.id));
  };

  return (
    <div className="space-y-4 p-4 pb-10">
      {isOverviewLoading ? <TaskStatsSkeleton /> : !overview ? (
        <TaskOverviewError onRetry={() => void overviewQuery.refetch()} className="w-full" />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ dataKey, ...stat }) => (
            <TaskStatCard key={stat.label} {...stat} value={String(overview[dataKey])} chartValues={overview.period.series.map((item) => item[dataKey])} changePercent={overview.period.comparison[dataKey].changePercent} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex h-11 w-full max-w-[320px] items-center gap-2 rounded-[12px] border border-[#8B93B8]/10 bg-white px-3">
          <Search className="size-5 text-[#8B93B8]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8B93B8]" />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center overflow-x-auto rounded-[12px] bg-white p-1">
            {tabs.map((tab) => (
              <button type="button" onClick={() => changeTab(tab)} className={`whitespace-nowrap rounded-[12px] px-3 py-2 text-sm transition-colors ${activeTab === tab ? "bg-[#5B7FF0]/10 text-[#5B7FF0]" : "text-[#8B93B8] hover:text-[#5B7FF0]"}`} key={tab}>{tab}</button>
            ))}
          </div>
          <button type="button" onClick={() => setShowFilters((current) => !current)} className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#E4EAF8] bg-white px-4 text-sm text-[#0E1224]">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <button type="button" onClick={() => router.push("/dashboard/tasks/add-task")} className="flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-6 text-sm font-medium text-white hover:bg-[#4E6FDE]">
            <Plus className="size-5" /> Add New Task
          </button>
        </div>
      </section>

      {showFilters && (
        <section className="rounded-xl bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-[#0E1224]">Filter tasks</h2>
            <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters" className="rounded p-1 text-[#8B93B8] hover:bg-[#F5F7FF]"><X className="size-5" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <FilterSelect label="Status group" value={filters.statusGroup} onChange={(value) => updateFilter("statusGroup", value)} options={[["", "All"], ["PENDING", "Pending"], ["OVERDUE", "Overdue"], ["COMPLETED", "Completed"]]} />
            <FilterSelect label="Priority" value={filters.priority} onChange={(value) => updateFilter("priority", value)} options={[["", "All"], ["LOW", "Low"], ["MEDIUM", "Medium"], ["HIGH", "High"], ["URGENT", "Urgent"]]} />
            <FilterSelect label="Department" value={filters.department} onChange={(value) => updateFilter("department", value)} options={[["", "All"], ["SALES", "Sales"], ["SUPPORT", "Support"], ["OPERATIONS", "Operations"], ["STRATEGY", "Strategy"], ["DESIGN", "Design"], ["MARKETING", "Marketing"], ["FINANCE", "Finance"]]} />
            <FilterInput label="Assigned user ID" value={filters.assignedToUserId} onChange={(value) => updateFilter("assignedToUserId", value)} placeholder="User ID" />
            <FilterInput label="Due from" value={filters.dueFrom} onChange={(value) => updateFilter("dueFrom", value)} type="date" />
            <FilterInput label="Due to" value={filters.dueTo} onChange={(value) => updateFilter("dueTo", value)} type="date" />
          </div>
          <button type="button" onClick={resetFilters} className="mt-4 text-sm font-medium text-[#5B7FF0]">Reset filters</button>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div>
          {isTasksLoading ? <TaskListSkeleton /> : tasksQuery.isError ? (
            <TaskOverviewError onRetry={() => void tasksQuery.refetch()} className="min-h-[300px]" />
          ) : (
            <div className="space-y-4">
              <TaskListCard title="To Do" accent="bg-[#5B7FF0]" tasks={todoTasks} onViewDetails={openDetailsModal} onEdit={openEditPage} onToggle={updateTaskStatus} onDelete={openDeleteModal} />
              <TaskListCard title="In Progress" accent="bg-[#F59E0B]" tasks={inProgressTasks} onViewDetails={openDetailsModal} onEdit={openEditPage} onToggle={updateTaskStatus} onDelete={openDeleteModal} />
              <TaskListCard title="Completed" accent="bg-[#10B981]" tasks={completedTasks} onViewDetails={openDetailsModal} onEdit={openEditPage} onToggle={updateTaskStatus} onDelete={openDeleteModal} />
              <Pagination page={tasksQuery.data?.page ?? page} totalPages={tasksQuery.data?.pages ?? 1} totalItems={tasksQuery.data?.total ?? 0} pageSize={tasksQuery.data?.limit ?? pageSize} itemCount={tasksQuery.data?.items.length ?? 0} onPageChange={setPage} itemLabel="tasks" isLoading={tasksQuery.isFetching} />
            </div>
          )}
        </div>
        <aside className="space-y-4">
          {sessionStatus === "loading" || upcomingMeetingsQuery.isLoading ? (
            <UpcomingCalendarSkeleton />
          ) : (
            <UpcomingCalendarCard
              meetings={upcomingMeetingsQuery.data?.items ?? []}
              isError={upcomingMeetingsQuery.isError}
              onRetry={() => void upcomingMeetingsQuery.refetch()}
            />
          )}
          {isOverviewLoading ? <><TaskSummarySkeleton /><TaskSummarySkeleton /></> : !overview ? (
            <TaskOverviewError onRetry={() => void overviewQuery.refetch()} />
          ) : (
            <>
              <SummaryDonutCard title="Productivity" score={overview.productivity.overallScore.value === null ? "N/A" : `${Math.round(overview.productivity.overallScore.value)}%`} scoreLabel="Overall Score" periodLabel={formatLabel(overview.productivity.period)} legend={productivityLegend} />
              <SummaryDonutCard title="Task Breakdown" score={overview.taskBreakdown.averageScore.value === null ? "N/A" : String(Math.round(overview.taskBreakdown.averageScore.value))} scoreLabel="Avg Score" periodLabel={formatLabel(overview.taskBreakdown.period)} legend={breakdownLegend} />
            </>
          )}
        </aside>
      </section>

      <DeleteTaskModal
        open={Boolean(taskToDelete)}
        taskTitle={taskToDelete?.title}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
        onConfirm={confirmDelete}
        isPending={deleteTaskMutation.isPending}
      />
      <TaskDetailsModal
        open={Boolean(detailsTaskId)}
        onOpenChange={(open) => {
          if (!open) setDetailsTaskId(null);
        }}
        task={taskDetailsQuery.data}
        isLoading={taskDetailsQuery.isLoading || taskDetailsQuery.isFetching}
        isError={taskDetailsQuery.isError}
        onRetry={() => void taskDetailsQuery.refetch()}
      />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="space-y-1 text-xs text-[#8B93B8]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue || "all"} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function FilterInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="space-y-1 text-xs text-[#8B93B8]">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClassName} />
    </label>
  );
}
