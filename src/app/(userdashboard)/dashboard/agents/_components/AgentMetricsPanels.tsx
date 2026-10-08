import { Check, Play } from "lucide-react";
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
export function AgentMetricsPanels() {
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
              background:
                "conic-gradient(#10B981 0 78%,#F59E0B 78% 93%,#EF4444 93% 98%,#8B93B8 98%)",
            }}
          >
            <div className="flex size-[134px] flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-2xl">80%</strong>
              <span className="text-xs">Overall Capacity</span>
            </div>
          </div>
          <div className="w-full space-y-3 text-sm">
            {[
              ["Normal Load", "78%", "#10B981"],
              ["High Load", "15%", "#F59E0B"],
              ["Overloaded", "5%", "#EF4444"],
              ["Idle", "2%", "#8B93B8"],
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
            ["Actions Logged", "100%"],
            ["Approval Workflows", "92%"],
            ["Compliance Score", "95%"],
            ["Risk Alerts", "1"],
          ].map(([label, value], i) => (
            <div
              key={label}
              className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 before:self-stretch before:w-1 before:rounded-sm before:bg-[#10B981]"
            >
              <span className="flex-1 text-sm text-[#8B93B8]">{label}</span>
              <strong className="text-sm">{value}</strong>
              {i < 3 && (
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
          ["Revenue Influenced", "$48,760"],
          ["Deals Touched", "27"],
          ["Upsell Contribution", "$12,430"],
          ["Renewal Support Impact", "$6,230"],
        ])}
      </section>
      <section className="rounded-2xl bg-white p-6">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium">
          Agent Health &amp; Diagnostics
        </h2>
        {rows([
          ["System Health", "98%"],
          ["Error Rate", "2.1%"],
          ["AVG. Response Time", "1.2s"],
          ["Reliability Score", "96%"],
        ])}
      </section>
    </div>
  );
}
export function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#10B981]/10 px-2 py-1 text-sm text-[#10B981]">
      <Play className="size-4" />
      Active
    </span>
  );
}
