import { CalendarDays, Check } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { TaskActionMenu } from "./TaskActionMenu";

export type Task = {
  id: string | number;
  title: string;
  description: string;
  owner: string;
  due: string;
  tags: string[];
  priority: "High" | "Medium" | "Low";
  done?: boolean;
};

const priorityClasses = {
  High: "bg-[#EF4444]/10 text-[#EF4444]",
  Medium: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Low: "bg-[#10B981]/10 text-[#10B981]",
};

type TaskItemProps = {
  task: Task;
  onViewDetails: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
};

export function TaskItem({ task, onViewDetails, onEdit, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex gap-2 py-2 first:pt-0 sm:gap-4">
      <button
        type="button"
        aria-label={`Mark ${task.title} as ${task.done ? "incomplete" : "complete"}`}
        onClick={() => onToggle(task.id)}
        className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${task.done ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" : "border-[#8B93B8]"}`}
      >
        {task.done && <Check className="size-3" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${task.done ? "text-[#8B93B8] line-through" : "text-[#0E1224]"}`}
        >
          {task.title}
        </p>
        <div
          className="mt-1 line-clamp-1 text-xs text-[#8B93B8] [&_p]:inline"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.description) }}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8B93B8]">
          <span className="flex items-center gap-1">
            <i className="size-1.5 rounded bg-[#5B7FF0]" />
            {task.owner}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {task.due}
          </span>
          {task.tags.map((tag) => (
            <span className="rounded-lg bg-[#F5F7FF] px-2 py-1" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-2 sm:gap-6">
        <span
          className={`hidden rounded-lg px-3 py-1 text-xs sm:inline-flex ${priorityClasses[task.priority]}`}
        >
          {task.priority.toUpperCase()}
        </span>
        <TaskActionMenu
          taskTitle={task.title}
          isComplete={Boolean(task.done)}
          onViewDetails={() => onViewDetails(task.id)}
          onEdit={() => onEdit(task.id)}
          onMarkComplete={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      </div>
    </div>
  );
}
