import Image from "next/image";
import Link from "next/link";
import { agents } from "./agentData";

const inactiveAgentIds = new Set(["steve", "cassie"]);

export function AgentQuickActions({
  activeAgentId,
}: {
  activeAgentId: string;
}) {
  return (
    <aside className="rounded-2xl bg-white p-3">
      <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">
        Quick Actions
      </h2>
      <div className="mt-4 space-y-4">
        {agents.map((agent) => {
          const active = agent.id === activeAgentId;
          const inactive = inactiveAgentIds.has(agent.id);
          return (
            <Link
              href={`/dashboard/agents/${agent.id}`}
              key={agent.id}
              className={`relative flex min-h-[60px] items-center overflow-hidden rounded-sm ${active ? "gap-3 bg-[#F5F7FF] py-1 pl-4 pr-3 before:absolute before:left-0 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "gap-4 pr-2"}`}
            >
              <Image
                src={agent.image}
                alt={agent.name}
                width={60}
                height={60}
                className="size-[60px] shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1">
                <strong className="block text-base font-medium">
                  {agent.name}
                </strong>
                <span
                  className="mt-2 block text-xs"
                  style={{ color: agent.color }}
                >
                  {agent.role}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                {inactive ? (
                  <span className="rounded-xl bg-[#ADAAAA]/15 px-2 py-1 text-xs text-[#8B93B8]">
                    Deactivate
                  </span>
                ) : (
                  <span className="rounded-xl bg-[#10B981]/10 px-2 py-1 text-xs text-[#10B981]">
                    Active
                  </span>
                )}
                <span className="text-xs text-[#8B93B8]">99% Success</span>
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
