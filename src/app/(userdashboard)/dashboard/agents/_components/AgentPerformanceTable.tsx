import { agents } from "./agentData";
import { ActiveBadge } from "./AgentMetricsPanels";
export function AgentPerformanceTable() {
  return (
    <section className="rounded-2xl bg-white p-4 sm:p-6">
      <h2 className="text-xl font-medium">Agent Performance</h2>
      <p className="mt-2 text-xs text-[#8B93B8]">
        Breakdown by AI agent for the selected period
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-[#E4EAF8] text-left">
              <th className="py-3 font-normal">Agent</th>
              {[
                "Jobs Run",
                "Success Rate",
                "Avg Time",
                "Tasks Created",
                "Status",
              ].map((h) => (
                <th key={h} className="py-3 text-center font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="h-[55px]">
                <td>
                  <strong className="block text-base font-medium">
                    {agent.name}
                  </strong>
                  <span className="text-xs" style={{ color: agent.color }}>
                    {agent.role}
                  </span>
                </td>
                <td className="text-center">89</td>
                <td className="text-center">94%</td>
                <td className="text-center">1.2s</td>
                <td className="text-center">32</td>
                <td className="text-center">
                  <ActiveBadge />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
