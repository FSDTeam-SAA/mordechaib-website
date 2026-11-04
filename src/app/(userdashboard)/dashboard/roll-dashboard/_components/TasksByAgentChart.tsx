import { useRoiDashboard } from "./RoiDashboardClient";
const colors=["#10B981","#264AFF","#F59E0B","#8B22F4","#EF4444","#D24FC7"];
const agentTypeLabel=(value:string)=>value.toLowerCase().split("_").map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ");

export function TasksByAgentChart() {
  const {data}=useRoiDashboard();
  const score=data.tasksByAgent.averageScore;
  return (
    <article className="flex h-full min-h-[486px] min-w-0 flex-col gap-4 rounded-xl bg-white p-4 sm:p-6">
      <header className="border-b border-[#E4EAF8] pb-4"><h2 className="text-xl font-medium text-[#0E1224]">Tasks by Agent</h2></header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative size-40 shrink-0">
          <svg viewBox="0 0 160 160" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            {data.tasksByAgent.items.map((agent,index) => {
              const start=data.tasksByAgent.items.slice(0,index).reduce((sum,item)=>sum+item.percentage,0);
              const visible=Math.max(agent.percentage-2,0);
              return <circle key={agent.agentId} cx="80" cy="80" r="60" fill="none" stroke={colors[index%colors.length]} strokeWidth="12" strokeLinecap="round" pathLength="100" strokeDasharray={`${visible} ${100-visible}`} strokeDashoffset={-start}/>;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-[32px] font-medium leading-none text-[#0E1224]">{score.availability==="AVAILABLE"&&score.value!=null?score.value:"—"}</strong><span className="mt-1 text-sm text-[#0E1224]">Avg Score</span></div>
        </div>
        <div className="flex w-full flex-1 flex-col justify-between">
          {data.tasksByAgent.items.length?data.tasksByAgent.items.map((agent,index) => <div key={agent.agentId} className="flex min-h-[26px] items-center gap-2 px-2 py-1 text-sm"><span className="size-2 shrink-0 rounded-full" style={{background:colors[index%colors.length]}}/><span className="min-w-0 flex-1 text-[#0E1224]">{agentTypeLabel(agent.agentType)}</span><span className="font-medium" style={{color:colors[index%colors.length]}}>{agent.percentage}%</span></div>):<p className="text-center text-sm text-[#8B93B8]">No automated tasks in this period.</p>}
        </div>
      </div>
    </article>
  );
}
