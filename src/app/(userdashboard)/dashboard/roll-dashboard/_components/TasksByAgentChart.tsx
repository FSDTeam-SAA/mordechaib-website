import Image from "next/image";

const agents = [["Sales Agent", "35%", "#10B981"], ["Customer Support Agent", "40%", "#264AFF"], ["Operations Agent", "20%", "#F59E0B"], ["Strategy Agent", "10%", "#8B22F4"], ["Design Agent", "5%", "#EF4444"], ["Marketing Agent", "50%", "#D24FC7"]];

const arcs = [
  ["arc-green.svg", "left-[54.55%] right-[2.89%] top-[63.94%] bottom-[0.51%]"],
  ["arc-orange.svg", "left-[69.3%] right-[3.98%] top-[5.24%] bottom-[66.65%]"],
  ["arc-blue.svg", "left-[2.83%] right-[32.38%] top-0 bottom-[58.77%]"],
  ["arc-magenta.svg", "left-0 right-[72.2%] top-[40.49%] bottom-[6.86%]"],
  ["arc-purple.svg", "left-[28.09%] right-[46.49%] top-[90.9%] bottom-0"],
  ["arc-red.svg", "left-[92.99%] right-0 top-[33.69%] bottom-[36.91%]"],
] as const;

export function TasksByAgentChart() {
  return (
    <article className="flex h-full min-h-[486px] min-w-0 flex-col gap-4 rounded-xl bg-white p-4 sm:p-6">
      <header className="border-b border-[#E4EAF8] pb-4"><h2 className="text-xl font-medium text-[#0E1224]">Tasks by Agent</h2></header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative size-40 shrink-0">
          {arcs.map(([file, position]) => <span key={file} className={`absolute ${position}`}><Image src={`/roi-dashboard/agent-chart/${file}`} alt="" fill unoptimized className="object-fill" /></span>)}
          <div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-[32px] font-medium leading-none text-[#0E1224]">87</strong><span className="mt-1 text-sm text-[#0E1224]">Avg Score</span></div>
        </div>
        <div className="flex w-full flex-1 flex-col justify-between">
          {agents.map(([name,value,color], index) => <div key={name} className="flex min-h-[26px] items-center gap-2 px-2 py-1 text-sm"><span className="size-2 shrink-0 rounded-full" style={{background:index === 3 ? "linear-gradient(100deg,#5F08FA,#D946EF)" : color}}/><span className="min-w-0 flex-1 text-[#0E1224]">{name}</span><span className="font-medium" style={index === 3 ? {background:"linear-gradient(100deg,#5F08FA,#D946EF)",WebkitBackgroundClip:"text",color:"transparent"} : {color}}>{value}</span></div>)}
        </div>
      </div>
    </article>
  );
}
