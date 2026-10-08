import { TaskItem, type Task } from "./TaskItem";

type TaskListCardProps = {
  title: string;
  accent: string;
  tasks: Task[];
  onViewDetails: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onToggle: (id: string | number) => void;
  onDelete: (id: string | number) => void;
};

export function TaskListCard({
  title,
  accent,
  tasks,
  onViewDetails,
  onEdit,
  onToggle,
  onDelete,
}: TaskListCardProps) {
  return (
    <section className="rounded-xl bg-white p-6">
      <header className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
        <div className="flex items-center gap-2">
          <i className={`h-7 w-1 rounded-full ${accent}`} />
          <h2 className="text-xl font-medium text-[#0E1224]">{title}</h2>
          <span className="rounded-lg bg-[#F5F7FF] px-2 py-1 text-sm text-[#8B93B8]">
            {tasks.length}
          </span>
        </div>
        <div className="hidden gap-8 text-sm text-[#8B93B8] sm:flex">
          <span>Priority</span>
          <span>Action</span>
        </div>
      </header>
      <div className="mt-4 space-y-2">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p className="py-4 text-center text-sm text-[#8B93B8]">
            No tasks found.
          </p>
        )}
      </div>
    </section>
  );
}
