const statuses = ["Sales Agent", "Operations Agent", "Support Agent", "Marketing Agent", "Strategy Agent", "Design Agent"] as const;

export function AgentStatusBar() {
  return (
    <section className="rounded-lg bg-white p-3">
      <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">Agent Status</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:justify-between">
        {statuses.map((status) => (
          <div key={status} className="flex shrink-0 items-center rounded-lg bg-[#F5F7FF] px-3 py-2 text-xs">
            <span>{status}</span>
            <span className="ml-[18px] list-item list-disc text-[#10B981]">Active</span>
          </div>
        ))}
      </div>
    </section>
  );
}
