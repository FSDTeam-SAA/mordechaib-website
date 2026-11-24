import type { ComponentType } from "react";
import type {
  AgentDashboardData,
  AgentDashboardItem,
} from "./agentDashboardTypes";
import { AgentMetricsPanels } from "./AgentMetricsPanels";
import { AgentPerformanceTable } from "./AgentPerformanceTable";
import { AgentQuickActions } from "./AgentQuickActions";
import { AgentStatCards } from "./AgentStatCards";
import { AgentWorkflow } from "./AgentWorkflow";

type DashboardDataProps = { data: AgentDashboardData };
type AgentsProps = { agents: AgentDashboardItem[] };
type QuickActionsProps = AgentsProps & { activeAgentId: string };
type PerformanceProps = AgentsProps & {
  range: AgentDashboardData["range"];
};

const StatCards: ComponentType<DashboardDataProps> = AgentStatCards;
const MetricsPanels: ComponentType<DashboardDataProps> = AgentMetricsPanels;
const QuickActions: ComponentType<QuickActionsProps> = AgentQuickActions;
const Workflow: ComponentType<AgentsProps> = AgentWorkflow;
const PerformanceTable: ComponentType<PerformanceProps> = AgentPerformanceTable;

export function AgentDashboardContent({
  data,
  activeAgentId,
}: {
  data: AgentDashboardData;
  activeAgentId: string;
}) {
  return (
    <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4 bg-[#F5F7FF] text-[#0E1224]">
      <StatCards data={data} />
      <div className="grid items-start gap-3 min-[1200px]:grid-cols-[minmax(248px,30%)_minmax(0,1fr)]">
        <QuickActions agents={data.items} activeAgentId={activeAgentId} />
        <div className="min-w-0 space-y-4">
          <Workflow agents={data.items} />
          <MetricsPanels data={data} />
          <PerformanceTable agents={data.items} range={data.range} />
        </div>
      </div>
    </main>
  );
}
