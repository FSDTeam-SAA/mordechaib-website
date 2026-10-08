import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { ChartShell } from "./ChartShell";

const categories = [
  ["CRM Updates", "14h", "$28", "#10B981", "/roi-dashboard/meetings.svg"],
  ["Email Drafting", "14h", "$12", "#8B93B8", "/roi-dashboard/tasks.svg"],
  ["Meeting Scheduling", "14h", "$30", "#5B7FF0", "/roi-dashboard/meetings.svg"],
  ["Task Creations", "14h", "$12", "#A855F7", "/roi-dashboard/tasks.svg"],
  ["Follow-Ups", "14h", "$6", "#F59E0B", "/roi-dashboard/trend.svg"],
];

export function TimeSavedByCategory() {
  const control = <button className="flex items-center gap-1 rounded-lg bg-[#5B9CD5]/10 px-2 py-1 text-xs text-[#5B7FF0]">Weekly <ChevronDown className="size-3"/></button>;
  return (
    <ChartShell title="Time Saved by Category" controls={control} className="h-full">
      <div className="mt-3 space-y-2 border-t border-[#E4EAF8] pt-3">
        {categories.map(([name,hours,money,color,icon]) => (
          <div key={name} className="relative overflow-hidden rounded border border-[#F5F7FF] bg-white px-2 py-1.5">
            <span className="absolute inset-y-1 left-0 w-1 rounded-r" style={{backgroundColor:color}} />
            <div className="flex items-center gap-2 pl-1.5"><Image src={icon} alt="" width={20} height={20} unoptimized className="size-5" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0E1224]">{name}</span><span className="text-xs text-[#6B6B6B]">{hours} | <strong className="font-medium text-[#0E1224]">{money}</strong></span></div>
            <div className="ml-7 mt-1 h-2.5 overflow-hidden rounded-sm bg-[#F5F7FF]"><div className="h-full w-[72%]" style={{backgroundColor:color}} /></div>
          </div>
        ))}
      </div>
    </ChartShell>
  );
}
