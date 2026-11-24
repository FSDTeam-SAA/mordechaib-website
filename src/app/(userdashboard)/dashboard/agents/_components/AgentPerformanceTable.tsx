import { agentColor, formatDuration, roleLabel, type AgentDashboardItem } from "./agentDashboardTypes";
import { ActiveBadge } from "./AgentMetricsPanels";
export function AgentPerformanceTable({ agents, range }: { agents: AgentDashboardItem[]; range: { from: string; to: string } }) {
  return (
    <section className="rounded-2xl bg-white p-3.5 sm:p-5">
      <h2 className="text-[1.1875rem]/[1.75rem] font-medium">Agent Performance</h2>
      <p className="mt-2 text-xs text-[#8B93B8]">
        {new Date(range.from).toLocaleString()} – {new Date(range.to).toLocaleString()}
      </p>
      <div data-lenis-prevent className="mt-2.5 overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[680px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-[#E4EAF8] text-left">
              <th className="py-2.5 font-normal">Agent</th>
              {[
                "Jobs Run",
                "Success Rate",
                "Avg Time",
                "Tasks Created",
                "Status",
              ].map((h) => (
                <th key={h} className="py-2.5 text-center font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => (
              <tr key={agent.id} className="h-[55px]">
                <td>
                  <strong className="block text-[0.9375rem]/[1.5rem] font-medium">
                    {agent.name}
                  </strong>
                  <span className="text-xs" style={{ color: agentColor(index) }}>
                    {roleLabel(agent.type)}
                  </span>
                </td>
                <td className="text-center">{agent.performance.jobsRun}</td>
                <td className="text-center">{agent.performance.successRatePercent === null ? "—" : `${agent.performance.successRatePercent}%`}</td>
                <td className="text-center">{formatDuration(agent.performance.averageProcessingTimeMs)}</td>
                <td className="text-center">{agent.performance.tasks.created}</td>
                <td className="text-center">
                  <ActiveBadge active={agent.status === "ACTIVE" && agent.organizationSettings.enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
