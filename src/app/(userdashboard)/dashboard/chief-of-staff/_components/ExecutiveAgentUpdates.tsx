import Image from "next/image";

const agents = [
  { id: "steve", name: "Steve", role: "Sales Agent", image: "/profile.png", color: "#5B9CD5" },
  { id: "cassie", name: "Cassie", role: "Support Agent", image: "/cassie.png", color: "#06B6D4" },
  { id: "vizzy", name: "Vizzy", role: "Operations Agent", image: "/vizzy.png", color: "#D24FC7" },
  { id: "dexter", name: "Dexter", role: "Strategy Agent", image: "/dexter.png", color: "#5B7FF0" },
  { id: "havi", name: "Havi", role: "Design Agent", image: "/havi.png", color: "#F59E0B" },
  { id: "soshie", name: "Soshie", role: "Marketing Agent", image: "/shshie.png", color: "#10B981" },
] as const;

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
