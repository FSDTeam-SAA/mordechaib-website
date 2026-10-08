import Image from "next/image";
import { agents } from "../../agents/_components/agentData";

const updates = [
  ["New enterprise lead", "Contract updated", "Proposal shared"],
  ["Major ticket resolved", "SLA met in time", "Customer satisfied"],
  ["Production delay resolved", "Inventory restocked", "Logistics on track"],
  ["Competitor analysis updated", "Market shift noted", "Strategic review done"],
  ["New concepts ready", "Assets delivered", "Brand alignment done"],
  ["New campaign launched", "Engagement up 18%", "Leads increasing"],
] as const;

export function ExecutiveAgentUpdates() {
  return (
    <section>
      <h2 className="text-base font-medium">2. Overnight Movements (Critical Updates Since Yesterday)</h2>
      <p className="mt-4 text-sm">Short, high-signal updates from:</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => (
          <article key={agent.id} className="rounded-2xl border border-t-4 bg-white p-3" style={{ borderColor: `${agent.color}80`, borderTopColor: agent.color }}>
            <div className="flex items-center gap-3">
              <Image src={agent.image} alt={agent.name} width={48} height={48} className="size-12 rounded-lg border object-cover" />
              <div><h3 className="text-xl font-medium">{agent.name}</h3><p className="text-sm">{agent.role === "Support Agent" ? "Customer Support Agent" : agent.role}</p></div>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-sm sm:text-base">
              {updates[index].map((update) => <li key={update}>{update}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
