type Metric = readonly [string, string, string?];

function MetricList({ items }: { items: readonly Metric[] }) {
  return <div className="rounded-2xl bg-white p-3"><div className="space-y-2">{items.map(([label, value, color]) => <div key={label} className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 text-sm before:self-stretch before:w-1 before:rounded-sm before:bg-[#10B981]"><span className="min-w-0 flex-1 text-[#8B93B8]">{label}</span><span className="shrink-0 font-medium" style={{ color: color || "#0E1224" }}>{value}</span></div>)}</div></div>;
}

export function ExecutiveMetrics() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <section><h2 className="text-base font-medium">5. Pipeline &amp; Revenue Signals (Sales + Forecast)</h2><p className="mt-3 text-sm">Three priorities aligned with your strategic direction</p><div className="mt-4"><MetricList items={[["Revenue at Risk", "$60,000"], ["Major crop renewal", "High risk"], ["Change Agreement", "In progress"]]} /></div></section>
        <section><h2 className="text-base font-medium">6. Client Health &amp; Support Status</h2><p className="mt-3 text-sm">From Cassie:</p><div className="mt-4"><MetricList items={[["Major Accounts", "On Track  92%", "#5B7FF0"], ["Sentiment Trend", "Positive  4.36/5", "#10B981"], ["Escalations/SLA risk", "High Risk  3", "#EF4444"]]} /></div></section>
      </div>
      <section><h2 className="text-base font-medium">7. Operational Status &amp; Blockers</h2><p className="mt-3 text-sm">From Vizzy:</p><div className="mt-4"><MetricList items={[["Milestones", "On Track  12", "#5B7FF0"], ["Deadlines", "Due this week  5", "#10B981"], ["Blockers", "Requires Attention  3", "#EF4444"], ["Dependencies", "At risk  4", "#EF4444"]]} /></div></section>
      <section><h2 className="text-base font-medium">8. Financial Pulse (Cash, AR, AP, Burn)</h2><p className="mt-3 text-sm">From Dexter:</p><div className="mx-auto mt-5 flex max-w-[718px] flex-col items-center gap-4">{[["Awareness", "1250", "100%", "#264AFF"], ["Engagement", "820", "89%", "#5B7FF0"], ["Conversion", "320", "80%", "#10B981"], ["Low Flow", "120", "73%", "#F59E0B"]].map(([label, value, width, color]) => <div key={label} className="flex h-9 items-center justify-center text-sm" style={{ width, color: "white", backgroundColor: color, clipPath: "polygon(3% 0, 97% 0, 92% 100%, 8% 100%)" }}><span className="flex w-2/3 justify-between"><b>{label}</b><b>{value}</b></span></div>)}</div></section>
      <div className="grid gap-4 md:grid-cols-3">
        <section><h2 className="text-base font-medium">9. Vendor Accountability Snapshot</h2><p className="mt-3 text-sm">From Vizzy + Dexter:</p><div className="mt-4"><MetricList items={[["Deliver on track", "12"], ["SLAs Met", "8"], ["Overdue Invoices", "2"], ["Supplier Risk Issue", "1"]]} /></div></section>
        <section><h2 className="text-base font-medium">10. Marketing &amp; Growth Signals</h2><p className="mt-3 text-sm">From Vizzy + Dexter:</p><div className="mt-4"><MetricList items={[["Deliver on track", "20"], ["SLAs Met", "10"], ["Overdue Invoices", "5"], ["Supplier Risk Issue", "2"]]} /></div></section>
        <section><h2 className="text-base font-medium">11. Design &amp; Creative Status</h2><p className="mt-3 text-sm">From Havi:</p><div className="mt-4"><MetricList items={[["Active briefs", "20"], ["Asset readiness", "10"], ["Brand consistency alerts", "5"]]} /></div></section>
      </div>
    </>
  );
}
