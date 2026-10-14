import Image from "next/image";
import type { AgentDashboardData } from "./agentDashboardTypes";

export function AgentStatCards({ data }: { data: AgentDashboardData }) {
  const completedTasks = data.items.reduce((total, agent) => total + agent.performance.tasks.completed, 0);
  const succeededJobs = data.items.reduce((total, agent) => total + agent.performance.succeededJobs, 0);
  const efficiency = data.summary.totalJobsRun ? Math.round((succeededJobs / data.summary.totalJobsRun) * 100) : null;
  const stats = [
  [
    data.summary.enabledAgents.toLocaleString(),
    "Active agent",
    "/agents/active-icon.svg",
    "/agents/active-chart.svg",
    "bg-[#5B9CD5]/10",
  ],
  [
    data.summary.totalJobsRun.toLocaleString(),
    "Jobs in period",
    "/agents/actions-icon.svg",
    "/agents/actions-chart.svg",
    "bg-[#D946EF]/10",
  ],
  [
    completedTasks.toLocaleString(),
    "Tasks completed",
    "/agents/tasks-icon.svg",
    "/agents/tasks-chart.svg",
    "bg-[#10B981]/10",
  ],
  [
    efficiency === null ? "—" : `${efficiency}%`,
    "Efficiency Score",
    "/agents/efficiency-icon.svg",
    "/agents/efficiency-chart.svg",
    "bg-[#F59E0B]/10",
  ],
] as const;
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Agent summary"
    >
      {stats.map(([value, label, icon, chart, bg]) => (
        <article
          key={label}
          className="relative h-[132px] overflow-hidden rounded-lg bg-white p-4"
        >
          <span
            className={`flex size-10 items-center justify-center rounded-xl ${bg}`}
          >
            <Image src={icon} alt="" width={24} height={24} />
          </span>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          <p className="text-sm text-[#8B93B8]">{label}</p>
          <Image
            src={chart}
            alt=""
            width={108}
            height={65}
            className="absolute bottom-0 right-4 h-[65px] w-[108px]"
          />
        </article>
      ))}
    </section>
  );
}
