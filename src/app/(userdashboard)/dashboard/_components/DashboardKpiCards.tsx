import Image from "next/image";
import { TrendingUp } from "lucide-react";

const cards = [
  { value: "$ 24,650", label: "RoI - Money Saved", badge: "18%", suffix: "vs last week", icon: "/dashboard-cards/money.svg", chart: "/dashboard-cards/money-chart.svg", color: "#10B981", tint: "bg-[#10B981]/10" },
  { value: "12", label: "Tasks Today", badge: "12 Overdue", suffix: undefined, icon: "/dashboard-cards/tasks.svg", chart: "/dashboard-cards/tasks-chart.svg", color: "#D24FC7", tint: "bg-[#D24FC7]/10" },
  { value: "17.2h", label: "Hours Saved", badge: "18%", suffix: "vs last week", icon: "/dashboard-cards/hours.svg", chart: "/dashboard-cards/hours-chart.svg", color: "#5B7FF0", tint: "bg-[#5B7FF0]/10" },
  { value: "5", label: "Meeting Scheduled", badge: "2 Today", suffix: undefined, icon: "/dashboard-cards/meetings.svg", chart: "/dashboard-cards/meetings-chart.svg", color: "#F59E0B", tint: "bg-[#F59E0B]/10" },
] as const;

export function DashboardKpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="relative min-h-[156px] overflow-hidden rounded-lg bg-white p-4">
          <span className={`flex size-10 items-center justify-center rounded-xl ${card.tint}`}>
            <Image src={card.icon} alt="" width={20} height={20} unoptimized className="size-5" />
          </span>
          <div className="relative z-10 mt-2 max-w-[155px]">
            <p className="text-2xl font-bold leading-normal text-[#0E1224]">{card.value}</p>
            <p className="text-sm leading-normal text-[#8B93B8]">{card.label}</p>
            <div className="mt-[3px] flex items-center gap-0.5 whitespace-nowrap text-xs text-[#8B93B8]">
              <span className={`flex items-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold ${card.tint}`} style={{ color: card.color }}>
                {card.suffix && <TrendingUp className="size-3" strokeWidth={2} />}
                {card.badge}
              </span>
              {card.suffix && <span>{card.suffix}</span>}
            </div>
          </div>
          <Image src={card.chart} alt="" width={108} height={65} unoptimized className="absolute bottom-4 right-4 h-[65px] w-[108px]" />
        </article>
      ))}
    </section>
  );
}
