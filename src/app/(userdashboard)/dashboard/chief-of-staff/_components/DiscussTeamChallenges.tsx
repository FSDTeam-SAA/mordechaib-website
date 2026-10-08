import Image from "next/image";
import { BarChart3, CheckCircle2, DollarSign, FolderKanban, LogIn, Siren } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Row = readonly [string, string?, string?];
type IconCard = readonly [LucideIcon, string, string, string, string];

const actionItems: readonly IconCard[] = [
  [CheckCircle2, "Approval", "IT Budget Increase", "High  $120k", "#5B7FF0"],
  [LogIn, "Sign-off", "Q4 partnership proposal", "Medium  $85k", "#F59E0B"],
  [Siren, "Escalation", "Address client complaint", "Critical  high Impact", "#EF4444"],
];

const kpis: readonly IconCard[] = [
  [DollarSign, "Revenue", "1.62m", "", "#5B7FF0"],
  [FolderKanban, "Active Project", "18", "", "#D24FC7"],
  [BarChart3, "Gross Margin", "3.58%", "", "#F59E0B"],
  [BarChart3, "Burn Rate", "$91.05k", "", "#EF4444"],
];

function BriefingSection({ number, title, subtitle, rows }: { number: number; title: string; subtitle: string; rows: readonly Row[] }) {
  return (
    <section className="min-w-0">
      <h2 className="text-base font-medium">{number}. {title}</h2>
      <p className="mt-3 text-sm">{subtitle}</p>
      <div className="mt-4 rounded-2xl bg-white p-3">
        <div className="space-y-2">
          {rows.map(([label, value, color]) => (
            <div key={label} className="flex min-h-[35px] items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2 text-sm before:self-stretch before:w-1 before:shrink-0 before:rounded-sm before:bg-[#10B981]">
              <span className="min-w-0 flex-1">{label}</span>
              {value && <span className="shrink-0 text-right font-medium" style={{ color: color || "#0E1224" }}>{value}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiscussTeamChallenges() {
  return (
    <div className="mt-4 space-y-6 rounded-2xl bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <BriefingSection number={1} title="Completed Milestones (Daily Achievements)" subtitle="Daily Achievement" rows={[["Product: v2.4.1 released to production"], ["Sales: 18 new enterprise leads added"], ["Support: 98% SLA achieved"], ["Operations: Inventory replenished"]]} />
        <section><h2 className="text-base font-medium">2. CEO Action Items</h2><p className="mt-3 text-sm">Awaiting Executive Decision or Approval</p><div className="mt-4 space-y-2 rounded-2xl bg-white">{actionItems.map(([Icon, title, sub, value, color]) => <div key={title} className="flex min-h-[60px] items-center gap-4 rounded-lg bg-[#F5F7FF] p-2"><span className="flex size-6 items-center justify-center rounded" style={{ color, backgroundColor: `${color}1A` }}><Icon className="size-4" /></span><span className="min-w-0 flex-1"><b className="block text-lg" style={{ color }}>{title}</b><small className="text-[#8B93B8]">{sub}</small></span><span className="shrink-0 text-xs" style={{ color }}>{value}</span></div>)}</div></section>
        <BriefingSection number={3} title="Next day Decision Framework" subtitle="Pre - Framed Options for Tomorrow" rows={[["Pricing Strategy update"], ["launch Timing Adjustment"], ["Resource Allocation Shift"]]} />
        <BriefingSection number={4} title="Key Risks & Red Flags" subtitle="Top Three" rows={[["Q2 revenue target at risk", "High", "#EF4444"], ["Vendor delay impacting product launch", "High", "#EF4444"], ["2 major accounts showing low engagement", "Medium", "#F59E0B"]]} />
        <BriefingSection number={5} title="Strategic blockers" subtitle="Cross-Team/ Cross Vendor" rows={[["API integration blocked by vendor", "Engineering"], ["Legal review delaying new contracts", "legal"], ["resource dependency from Design Team", "Product"]]} />
        <BriefingSection number={6} title="financial Movements & Variances" subtitle="Todays Financial Summary" rows={[["Cash Inflow", "$320k  ↑15%", "#10B981"], ["Cash Outflow", "$210  ↑9%", "#10B981"], ["Net Movement", "$110k  ↑8%", "#10B981"], ["AR Outstanding", "$850  ↓5%", "#EF4444"]]} />
      </div>

      <section><h2 className="text-base font-medium">7. Operational &amp; Financial Metrics Pulse</h2><p className="mt-3 text-sm">KPI Snapshot</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(([Icon, label, value, , color]) => <article key={label} className="rounded-lg bg-[#F5F7FF] p-4 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-xl" style={{ color, backgroundColor: `${color}1A` }}><Icon className="size-6" /></span><h3 className="mt-2 font-medium">{label}</h3><strong className="mt-1 block text-lg" style={{ color }}>{value}</strong></article>)}</div></section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section><h2 className="text-base font-medium">8. Vendor Performance &amp; Accountability</h2><p className="mt-3 text-sm">Deliverables, SLAs &amp; overdue items</p><div className="mt-4 flex flex-col items-center gap-5 rounded-xl bg-white p-4 sm:flex-row sm:p-6"><div className="flex size-40 shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#10B981 0 70%,#F59E0B 70% 90%,#EF4444 90%)" }}><div className="flex size-[124px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl">92%</strong><span className="text-sm">SLA Met</span></div></div><div className="w-full space-y-6">{[["On Track", "14(70%)", "#10B981"], ["At Risk", "4(20%)", "#F59E0B"], ["Overdue", "2(10%)", "#EF4444"]].map(([label, value, color]) => <div key={label} className="flex items-center gap-2 text-sm"><i className="size-2 rounded-full" style={{ backgroundColor: color }} /><span className="flex-1">{label}</span><b style={{ color }}>{value}</b></div>)}</div></div></section>
        <BriefingSection number={9} title="Priority Alignment Update" subtitle="What Shifted Today" rows={[["Product launch moved to Priority 1", "↑ UP", "#10B981"], ["Enterprise Sales moved to Priority 2", "↑ UP", "#10B981"], ["Marketing Campaign moved to priority 3", "↓ Down", "#EF4444"]]} />
        <BriefingSection number={10} title="Internal Team Accountability" subtitle="Throughput & Performance Signals" rows={[["Engineering", "On Track   92%", "#10B981"], ["Design", "On Track   88%", "#10B981"], ["Marketing", "At Risk   65%", "#F59E0B"], ["Customer Support", "On Track   95%", "#10B981"]]} />
        <BriefingSection number={11} title="Escalations & Rapid Resolution Items" subtitle="Needs Immediate Executive Attention" rows={[["Client contact approval", "15m", "#10B981"], ["Discount approval for ACME deal", "10m", "#EF4444"], ["Resource approval for urgent bug fix", "20m", "#F59E0B"]]} />
      </div>

      <section><h2 className="text-base font-medium">12. CEO Notes (Your Strategic Direction)</h2><p className="mt-3 text-sm">Your space:</p><div className="mt-4 flex items-center gap-4 rounded-lg bg-[#F5F7FF] p-4"><Image src="/laura.png" alt="Laura" width={60} height={60} className="size-[60px] shrink-0 rounded-full border border-[#8B93B8] object-cover" /><p className="text-sm sm:text-base">“Focus only on Enterprise pipeline this week Delay Project Alpha until vendor payment clears Avoid low value meetings and protect deep woke time.”– Laura</p></div></section>
    </div>
  );
}
