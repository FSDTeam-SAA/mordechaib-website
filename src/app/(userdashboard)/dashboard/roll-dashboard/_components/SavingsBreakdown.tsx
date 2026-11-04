import Image from "next/image";
import { ChartShell } from "./ChartShell";
import { useRoiDashboard } from "./RoiDashboardClient";

export function SavingsBreakdown() {
  const {data}=useRoiDashboard();
  const cash=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:data.savingsBreakdown.currency,maximumFractionDigits:2}).format(value);
  return (
    <ChartShell title="Savings Breakdown" className="h-full lg:col-span-2 xl:col-span-1">
      <div className="mt-3 border-t border-[#E4EAF8] pt-3">
        <div className="relative rounded bg-[#F5F7FF] px-3 py-2"><span className="absolute inset-y-1 left-0 w-1 rounded-r bg-[#10B981]"/><div className="space-y-2">{data.savingsBreakdown.items.map(item => <div key={item.key} className="flex items-center justify-between gap-3 text-xs"><span className="text-[#0E1224]">{item.label}</span><span className="shrink-0 text-[#6B6B6B]">{item.availability==="AVAILABLE"?`${item.minutesPerAction} min/action`:"Unavailable"}</span></div>)}</div></div>
        <h3 className="my-3 text-base font-medium text-[#0E1224]">Current Period Impact</h3>
        <div className="space-y-2 border-b border-[#F5F7FF] pb-4">
          {data.savingsBreakdown.items.map(item => <div key={item.key} className="grid grid-cols-[20px_1fr_auto_auto_auto] items-center gap-2 text-xs text-[#8B93B8]"><Image src={item.key.includes("MEETING")||item.key.includes("CRM")?"/roi-dashboard/meetings.svg":item.key==="FOLLOW_UP"?"/roi-dashboard/trend.svg":"/roi-dashboard/tasks.svg"} alt="" width={20} height={20} unoptimized className="size-5"/><span className="min-w-0 truncate"><b className="mr-2 font-normal">{item.count??"—"}</b>{item.label}</span><span>{item.availability==="AVAILABLE"?`× ${item.minutesPerAction}m`:""}</span><span>{item.availability==="AVAILABLE"?"=":""}</span><strong className="font-medium text-[#0E1224]">{item.moneySaved==null?"—":cash(item.moneySaved)}</strong></div>)}
        </div>
        <div className="relative mt-3 flex items-center justify-between bg-[#F5F7FF] p-2 pl-3 text-sm"><span className="absolute inset-y-1 left-0 w-1 rounded-r bg-[#F59E0B]"/><span>Total Money Saved</span><strong className="text-xl font-medium text-[#10B981]">{cash(data.savingsBreakdown.totalMoneySaved)}</strong></div>
      </div>
    </ChartShell>
  );
}
