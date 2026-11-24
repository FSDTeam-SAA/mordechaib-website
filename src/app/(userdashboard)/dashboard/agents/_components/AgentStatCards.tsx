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
      className="grid gap-3 sm:grid-cols-2 min-[1200px]:grid-cols-4"
      aria-label="Agent summary"
    >
      {stats.map(([value, label, icon, chart, bg]) => (
        <article
          key={label}
          className="relative min-h-28 overflow-hidden rounded-lg bg-white p-3"
        >
          <span
            className={`flex size-10 items-center justify-center rounded-xl ${bg}`}
          >
            <Image src={icon} alt="" width={24} height={24} />
          </span>
          <p className="mt-2 text-lg font-bold">{value}</p>
          <p className="relative z-10 pr-[66px] text-xs text-[#8B93B8] 2xl:pr-[86px]">{label}</p>
          <Image
            src={chart}
            alt=""
            width={108}
            height={65}
            className="absolute bottom-0 right-4 h-10 w-[66px] 2xl:h-[52px] 2xl:w-[86px]"
          />
        </article>
      ))}
    </section>
  );
}
