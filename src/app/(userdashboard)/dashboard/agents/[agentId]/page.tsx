import { AgentDashboard } from "../_components/AgentDashboard";
export default function AgentPage({ params }: { params: { agentId: string } }) {
  return <AgentDashboard activeAgentId={params.agentId} />;
}
