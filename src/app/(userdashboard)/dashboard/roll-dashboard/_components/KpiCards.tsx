import Image from "next/image";

const cards = [
  { value: "15", label: "Total Tasks Automated", icon: "/roi-dashboard/tasks.svg", chart: "/roi-dashboard/tasks-sparkline.svg", iconBg: "bg-[#D946EF]/10" },
  { value: "50", label: "Meetings Auto-Scheduled", icon: "/roi-dashboard/meetings.svg", chart: "/roi-dashboard/meetings-sparkline.svg", iconBg: "bg-[#5B9CD5]/10" },
  { value: "15h", label: "Total Hours Saved", icon: "/roi-dashboard/hours.svg", chart: "/roi-dashboard/hours-sparkline.svg", iconBg: "bg-[#F59E0B]/10" },
  { value: "$ 1200", label: "Total Money Saved", chart: "/roi-dashboard/money-sparkline.svg", iconBg: "bg-[#10B981]/10" },
];

export function KpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="relative min-h-[112px] overflow-hidden rounded-lg bg-white p-4">
          <div className={`flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
            {card.icon ? <Image src={card.icon} alt="" width={20} height={20} unoptimized className="size-5" /> : <span className="text-2xl font-medium text-[#10B981]">$</span>}
          </div>
          <div className="relative z-10 mt-2">
            <p className="text-2xl font-bold leading-none text-[#0E1224]">{card.value}</p>
            <p className="mt-2 text-sm leading-none text-[#8B93B8]">{card.label}</p>
          </div>
          <Image src={card.chart} alt="" width={108} height={65} unoptimized className="absolute bottom-3 right-3 h-[65px] w-[108px]" />
        </article>
      ))}
    </section>
  );
}
