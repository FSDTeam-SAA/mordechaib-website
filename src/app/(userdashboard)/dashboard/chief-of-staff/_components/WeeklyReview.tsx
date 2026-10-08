import Image from "next/image";
import {
  BadgeDollarSign,
  Bot,
  Clock3,
  Gauge,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Metric = readonly [string, string, string?];

const roiCards: readonly [LucideIcon, string, string, string][] = [
  [BadgeDollarSign, "Cost Savings", "$48.7k", "#5B7FF0"],
  [Clock3, "Hours Saved", "50h", "#D24FC7"],
  [Gauge, "Productivity Lift", "31%", "#F59E0B"],
  [Bot, "Automation Impact", "72.5%", "#EF4444"],
];

const sales: readonly Metric[] = [
  ["Deals Closed", "12", "20%"],
  ["Deals Advanced", "18", "12%"],
  ["Pipeline velocity", "1.4x", "10%"],
  ["Revenue Forecast", "$1.8m", "12%"],
  ["At Risk Opportunities", "3", "$210k"],
];

const clientHealth: readonly Metric[] = [
  ["Major Accounts", "24"],
  ["Sentiment Trend", "Positive"],
  ["SLA Compliance", "98.6%"],
  ["Escalations Resolved", "7"],
  ["CEO Attentions Needed", "2"],
];

const product: readonly Metric[] = [
  ["Completed Assets", "14", "+3"],
  ["Brand Consistency", "96%"],
  ["Creative Backlog", "5", "-2"],
  ["Design Blockers", "1", "Critical"],
];

const systemHealth: readonly Metric[] = [
  ["AI Accuracy", "98.7%", "↑ 3%"],
  ["System Uptime", "99.98%"],
  ["Error rate", "0.1%", "-2%"],
  ["System Anomalies", "2", "Investigating"],
];

const finance: readonly Metric[] = [
  ["Cash Inflow", "$320k", "↑ 15%"],
  ["Cash Outflow", "$210k", "↓ 5%"],
  ["Burn Rate", "$110k/m", "↑ 8%"],
  ["Variance vs plan", "$850", "Favorable"],
  ["Upcoming Obligations", "$850", "Next 30 days"],
];

function SectionTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return <h2 className="text-base font-medium text-[#0E1224]">{number}. {children}</h2>;
}

function MetricRows({ rows }: { rows: readonly Metric[] }) {
  return (
    <div className="space-y-2 rounded-2xl bg-white p-3">
      {rows.map(([label, value, change]) => (
        <div key={label} className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 text-sm">
          <span className="h-[18px] w-1 shrink-0 rounded-sm bg-[#10B981]" />
          <span className="min-w-0 flex-1 text-[#8B93B8]">{label}</span>
          <span className="shrink-0 font-medium text-[#0E1224]">{value}</span>
          {change && <span className="shrink-0 text-xs text-[#10B981]">{change}</span>}
        </div>
      ))}
    </div>
  );
}

function DataSection({ number, title, rows }: { number: number; title: string; rows: readonly Metric[] }) {
  return (
    <section className="min-w-0 space-y-4">
      <SectionTitle number={number}>{title}</SectionTitle>
      <MetricRows rows={rows} />
    </section>
  );
}

export function WeeklyReview() {
  return (
    <div className="mt-4 space-y-4 rounded-2xl bg-white p-4 sm:p-6">
      <section className="space-y-4">
        <SectionTitle number={1}>Executive Summary</SectionTitle>
        <article className="rounded-2xl bg-[#F5F7FF] p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#5B9CD5]/10 text-[#5B7FF0]"><MessageSquareText className="size-6" /></span>
            <h3 className="min-w-0 flex-1 text-lg font-medium sm:text-xl">Chat Summary</h3>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F4BE5E]/15 text-[#F59E0B]"><Sparkles className="size-6" /></span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B] sm:text-base">Strong week driven by revenue growth, operational acceleration, and improved client satisfaction. Key risks remain in vendor delays and two at-risk opportunities. Overall trajectory is positive.</p>
        </article>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[["Major Wins", "8", "#5B7FF0"], ["Major Risks", "3", "#EF4444"], ["Major Shifts", "4", "#D24FC7"], ["Trajectory", "Positive", "#10B981"]].map(([label, value, color]) => (
            <article key={label} className="rounded-lg bg-[#F5F7FF] px-2 py-4 text-center">
              <h3 className="font-medium" style={{ color }}>{label}</h3><strong className="mt-1 block text-lg" style={{ color }}>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 pt-2">
        <SectionTitle number={2}>Aggregate ROI &amp; Efficiency Gains</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {roiCards.map(([Icon, label, value, color]) => <article key={label} className="rounded-lg bg-[#F5F7FF] px-2 py-4 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-xl" style={{ color, backgroundColor: `${color}1A` }}><Icon className="size-6" /></span><h3 className="mt-2 font-medium">{label}</h3><strong className="mt-1 block text-lg" style={{ color }}>{value}</strong></article>)}
        </div>
      </section>

      <div className="grid gap-6 pt-2 lg:grid-cols-2">
        <DataSection number={3} title="Sales & Revenue Performance" rows={sales} />
        <DataSection number={4} title="Client Health & Support Quality" rows={clientHealth} />
      </div>

      <section className="space-y-4 pt-2">
        <SectionTitle number={5}>Operational Delivery &amp; Milestones</SectionTitle>
        <MetricRows rows={[["Milestones Completed", "18", "+4"], ["On-Time Delivery", "94%", "↑ 6%"], ["Active Blockers", "3", "-2"], ["Projects At Risk", "2", "Review"]]} />
      </section>

      <section className="space-y-4 pt-2">
        <SectionTitle number={6}>Team Performance &amp; Capacity</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[["Engineering", "92%"], ["Sales", "88%"], ["Support", "95%"], ["Marketing", "79%"], ["Overall", "Strong"]].map(([label, value]) => <article key={label} className="rounded-lg bg-[#F5F7FF] p-4 text-center"><p className="text-sm text-[#8B93B8]">{label}</p><strong className="mt-1 block text-lg text-[#10B981]">{value}</strong></article>)}
        </div>
      </section>

      <div className="grid gap-6 pt-2 lg:grid-cols-2">
        <DataSection number={7} title="Product & Creative Output" rows={product} />
        <DataSection number={8} title="Accuracy, Reliability & System Health" rows={systemHealth} />
        <DataSection number={9} title="Financial Movements & Variances" rows={finance} />
        <section className="min-w-0 space-y-4">
          <SectionTitle number={10}>Vendor Performance &amp; Accountability</SectionTitle>
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-4 sm:flex-row sm:p-6">
            <div className="flex size-40 shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#10B981 0 67%,#F59E0B 67% 89%,#EF4444 89% 100%)" }}><div className="flex size-[124px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl">18</strong><span className="text-xs text-[#8B93B8]">Total Vendors</span></div></div>
            <div className="w-full space-y-5">{[["On Track", "12 (67%)", "#10B981"], ["At Risk", "4 (22%)", "#F59E0B"], ["Missed SLA", "2 (10%)", "#EF4444"], ["Critical", "0 (0%)", "#8B93B8"]].map(([label, value, color]) => <div key={label} className="flex items-center gap-2 text-sm"><i className="size-2 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1">{label}</span><span>{value}</span></div>)}</div>
          </div>
        </section>
      </div>

      <section className="max-w-[550px] space-y-4 pt-2">
        <div className="rounded-2xl bg-white p-4 sm:p-6"><h2 className="border-b border-[#F5F7FF] pb-4 text-lg font-medium sm:text-xl">11. Strategic Shift &amp; Priority Re-Alignment</h2><div className="mt-4"><MetricRows rows={[["What Changed This Week", "4 key Updates"], ["What must Change Next Week", "3 Priorities"], ["Strategic Adjustments", "2 updates"], ["CEO Level Decisions", "2 needed"]]} /></div></div>
      </section>

      <section className="space-y-3 pt-2">
        <SectionTitle number={12}>CEO Notes (Your Strategic Direction)</SectionTitle><p className="text-sm">Your space:</p>
        <div className="flex flex-col items-center gap-3 rounded-lg bg-[#F4F5FD] p-3 sm:flex-row sm:gap-4"><Image src="/laura.png" alt="Laura" width={80} height={80} className="size-20 shrink-0 rounded-full border border-[#8B93B8] object-cover" /><p className="text-center text-base font-medium leading-relaxed text-[#6B6B6B] sm:text-left sm:text-xl">“We&apos;re building real momentum. Focus on enterprise pipeline, tighten vendor accountability, and protect execution bandwidth across teams.”- Laura</p></div>
      </section>
    </div>
  );
}
