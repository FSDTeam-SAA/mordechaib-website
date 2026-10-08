import { agents } from "./agentData";
import { AgentMetricsPanels } from "./AgentMetricsPanels";
import { AgentPerformanceTable } from "./AgentPerformanceTable";
import { AgentQuickActions } from "./AgentQuickActions";
import { AgentStatCards } from "./AgentStatCards";
import { AgentWorkflow } from "./AgentWorkflow";
export function AgentDashboard({ activeAgentId }: { activeAgentId: string }) {
  const active = agents.some((a) => a.id === activeAgentId)
    ? activeAgentId
    : "steve";
  return (
    <main className="min-h-[calc(100vh-83px)] space-y-4 bg-[#F5F7FF] p-3 text-[#0E1224] sm:p-4">
      <AgentStatCards />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(300px,396px)_minmax(0,1fr)]">
        <AgentQuickActions activeAgentId={active} />
        <div className="min-w-0 space-y-4">
          <AgentWorkflow />
          <AgentMetricsPanels />
          <AgentPerformanceTable />
        </div>
      </div>
    </main>
  );
}
