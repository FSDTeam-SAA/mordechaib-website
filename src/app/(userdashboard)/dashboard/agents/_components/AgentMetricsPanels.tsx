import { Check, Play } from "lucide-react";
import { formatDuration, formatMetric, type AgentDashboardData } from "./agentDashboardTypes";
const rows = (items: readonly (readonly [string, string])[]) => (
  <div className="mt-4 space-y-2">
    {items.map(([label, value]) => (
      <div
        key={label}
        className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 before:self-stretch before:w-1 before:rounded-sm before:bg-[#10B981]"
      >
        <span className="flex-1 text-sm text-[#8B93B8]">{label}</span>
        <strong className="text-sm">{value}</strong>
      </div>
    ))}
  </div>
);
export function AgentMetricsPanels({ data }: { data: AgentDashboardData }) {
  const { capacity } = data.summary;
  const jobs = data.items.reduce((totals, agent) => ({ succeeded: totals.succeeded + agent.performance.succeededJobs, failed: totals.failed + agent.performance.failedJobs, retries: totals.retries + agent.performance.retryAttempts, processingMs: totals.processingMs + (agent.performance.averageProcessingTimeMs ?? 0), timed: totals.timed + (agent.performance.averageProcessingTimeMs === null ? 0 : 1) }), { succeeded: 0, failed: 0, retries: 0, processingMs: 0, timed: 0 });
  const compliance = data.items.find((agent) => agent.compliance.availability === "AVAILABLE")?.compliance;
  const revenue = data.items.find((agent) => agent.revenueAttribution.availability === "AVAILABLE")?.revenueAttribution;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl bg-white p-6">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium">
          Agent Capacity &amp; Load
        </h2>
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
          <div
            className="flex size-[160px] shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#10B981 0 ${capacity.utilizationPercent ?? 0}%,#E4EAF8 ${capacity.utilizationPercent ?? 0}% 100%)`,
            }}
          >
            <div className="flex size-[134px] flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-2xl">{capacity.utilizationPercent === null ? "—" : `${capacity.utilizationPercent}%`}</strong>
              <span className="text-xs">Utilization</span>
            </div>
          </div>
          <div className="w-full space-y-3 text-sm">
            {[
              ["Configured Agents", String(capacity.configuredAgents), "#10B981"],
              ["Running Jobs", String(capacity.runningJobs), "#5B7FF0"],
              ["Queued Jobs", formatMetric(capacity.queuedJobs), "#F59E0B"],
              ["Retrying Jobs", formatMetric(capacity.retryingJobs), "#EF4444"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center gap-2">
                <i
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1">{label}</span>
                <span className="text-[#8B93B8]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-6">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium">
          Agent Compliance &amp; Audit
        </h2>
        <div className="mt-4 space-y-2">
          {[
            ["Compliance Score", compliance ? formatMetric(compliance) : "Unavailable"],
            ["Approval Required", String(data.items.filter((agent) => agent.organizationSettings.approvalRequired).length)],
            ["Enabled Agents", String(data.summary.enabledAgents)],
            ["Working Agents", String(data.summary.workingAgents)],
          ].map(([label, value], i) => (
            <div
              key={label}
              className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 before:self-stretch before:w-1 before:rounded-sm before:bg-[#10B981]"
            >
              <span className="flex-1 text-sm text-[#8B93B8]">{label}</span>
              <strong className="text-sm">{value}</strong>
              {i > 0 && (
                <Check className="size-5 rounded border border-[#10B981] text-[#10B981]" />
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl bg-white p-6">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium">
          Revenue Attribution
        </h2>
        {rows([
          ["Revenue Attribution", revenue ? formatMetric(revenue) : "Unavailable"],
          ["Proposals", String(data.items.reduce((sum, agent) => sum + agent.performance.proposals.total, 0))],
          ["Approved", String(data.items.reduce((sum, agent) => sum + agent.performance.proposals.approved, 0))],
          ["Executed", String(data.items.reduce((sum, agent) => sum + agent.performance.proposals.executed, 0))],
        ])}
      </section>
      <section className="rounded-2xl bg-white p-6">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium">
          Agent Health &amp; Diagnostics
        </h2>
        {rows([
          ["Succeeded Jobs", String(jobs.succeeded)],
          ["Failed Jobs", String(jobs.failed)],
          ["Retry Attempts", String(jobs.retries)],
          ["AVG. Processing Time", jobs.timed ? formatDuration(jobs.processingMs / jobs.timed) : "—"],
        ])}
      </section>
    </div>
  );
}
export function ActiveBadge({ active = true }: { active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm ${active ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#ADAAAA]/15 text-[#8B93B8]"}`}>
      <Play className="size-4" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
