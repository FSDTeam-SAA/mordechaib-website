import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { ChartShell } from "./ChartShell";
import { useRoiDashboard } from "./RoiDashboardClient";

const colors=["#10B981","#8B93B8","#5B7FF0","#A855F7","#F59E0B"];

export function TimeSavedByCategory() {
  const {data}=useRoiDashboard();
  const max=Math.max(...data.timeSavedByCategory.map(item=>item.minutesSaved||0),1);
  const cash=(value:number,currency:string)=>new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(value);
  const control = <button className="flex items-center gap-1 rounded-lg bg-[#5B9CD5]/10 px-2 py-1 text-xs text-[#5B7FF0]">Weekly <ChevronDown className="size-3"/></button>;
  return (
    <ChartShell title="Time Saved by Category" controls={control} className="h-full">
      <div className="mt-3 space-y-2 border-t border-[#E4EAF8] pt-3">
        {data.timeSavedByCategory.map((item,index) => (
          <div key={item.key} className="relative overflow-hidden rounded border border-[#F5F7FF] bg-white px-2 py-1.5">
            <span className="absolute inset-y-1 left-0 w-1 rounded-r" style={{backgroundColor:colors[index]}} />
            <div className="flex items-center gap-2 pl-1.5"><Image src={item.key.includes("MEETING")||item.key.includes("CRM")?"/roi-dashboard/meetings.svg":item.key==="FOLLOW_UP"?"/roi-dashboard/trend.svg":"/roi-dashboard/tasks.svg"} alt="" width={20} height={20} unoptimized className="size-5" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0E1224]">{item.label}</span><span className="text-xs text-[#6B6B6B]">{item.availability==="AVAILABLE"?<>{item.hoursSaved}h | <strong className="font-medium text-[#0E1224]">{cash(item.moneySaved||0,item.currency)}</strong></>:"Unavailable"}</span></div>
            {item.availability==="AVAILABLE"&&<div className="ml-7 mt-1 h-2.5 overflow-hidden rounded-sm bg-[#F5F7FF]"><div className="h-full" style={{width:`${(item.minutesSaved||0)/max*100}%`,backgroundColor:colors[index]}} /></div>}
          </div>
        ))}
      </div>
    </ChartShell>
  );
}
