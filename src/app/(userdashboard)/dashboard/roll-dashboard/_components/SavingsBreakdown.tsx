import Image from "next/image";
import { ChartShell } from "./ChartShell";

const rates = [["Email Drafting","$1/drafted email"],["CRM Updates","$2/update"],["Meetings Auto - Scheduled","$3/meeting"],["Task Creation","$1.50/task"],["Follow-Ups","$1 / follow-up"]];
const impact = [
  ["12","Email Drafted","$1","$12","/roi-dashboard/tasks.svg"], ["14","CRM Updates","$2","$28","/roi-dashboard/meetings.svg"],
  ["10","Meetings Scheduled","$2","$30","/roi-dashboard/meetings.svg"], ["8","Tasks Created","$1.50","$12","/roi-dashboard/tasks.svg"],
  ["6","Follow-Ups","$1","$6","/roi-dashboard/trend.svg"],
];

export function SavingsBreakdown() {
  return (
    <ChartShell title="Savings Breakdown" className="h-full lg:col-span-2 xl:col-span-1">
      <div className="mt-3 border-t border-[#E4EAF8] pt-3">
        <div className="relative rounded bg-[#F5F7FF] px-3 py-2"><span className="absolute inset-y-1 left-0 w-1 rounded-r bg-[#10B981]"/><div className="space-y-2">{rates.map(([name,rate]) => <div key={name} className="flex items-center justify-between gap-3 text-xs"><span className="text-[#0E1224]">{name}</span><span className="shrink-0 text-[#6B6B6B]">{rate}</span></div>)}</div></div>
        <h3 className="my-3 text-base font-medium text-[#0E1224]">Current Period Impact</h3>
        <div className="space-y-2 border-b border-[#F5F7FF] pb-4">
          {impact.map(([count,name,rate,total,icon]) => <div key={name} className="grid grid-cols-[20px_1fr_auto_auto_auto] items-center gap-2 text-xs text-[#8B93B8]"><Image src={icon} alt="" width={20} height={20} unoptimized className="size-5"/><span className="min-w-0 truncate"><b className="mr-2 font-normal">{count}</b>{name}</span><span>× {rate}</span><span>=</span><strong className="font-medium text-[#0E1224]">{total}</strong></div>)}
        </div>
        <div className="relative mt-3 flex items-center justify-between bg-[#F5F7FF] p-2 pl-3 text-sm"><span className="absolute inset-y-1 left-0 w-1 rounded-r bg-[#F59E0B]"/><span>Total Money Saved</span><strong className="text-xl font-medium text-[#10B981]">$88</strong></div>
      </div>
    </ChartShell>
  );
}
