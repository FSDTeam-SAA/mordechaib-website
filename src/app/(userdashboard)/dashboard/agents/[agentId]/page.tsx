import { AgentDashboard } from "../_components/AgentDashboard";
import { agents } from "../_components/agentData";

export function generateStaticParams() {
  return agents.map((agent) => ({ agentId: agent.id }));
}
export default function AgentPage({ params }: { params: { agentId: string } }) {
  return <AgentDashboard activeAgentId={params.agentId} />;
}
