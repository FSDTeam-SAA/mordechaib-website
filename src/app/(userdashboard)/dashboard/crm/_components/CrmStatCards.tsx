import Image from "next/image";

const stats = [
  {
    value: "$ 24,650",
    label: "RoI - Money Saved",
    note: "18%",
    suffix: "vs last week",
    icon: "/crm/money.svg",
    chart: "/crm/money-chart.svg",
    iconBg: "bg-[#10B981]/10",
    noteClass: "bg-[#10B981]/10 text-[#10B981]",
  },
  {
    value: "12",
    label: "Tasks Today",
    note: "12 Overdue",
    icon: "/crm/tasks.svg",
    chart: "/crm/tasks-chart.svg",
    iconBg: "bg-[#D946EF]/10",
    noteClass: "bg-[#D946EF]/10 text-[#D24FC7]",
  },
  {
    value: "17.2h",
    label: "Hours Saved",
    note: "18%",
    suffix: "vs last week",
    icon: "/crm/time.svg",
    chart: "/crm/time-chart.svg",
    iconBg: "bg-[#5B9CD5]/20",
    noteClass: "bg-[#5B7FF0]/10 text-[#5B7FF0]",
  },
  {
    value: "5",
    label: "Meeting Scheduled",
    note: "2 Today",
    icon: "/crm/meeting.svg",
    chart: "/crm/meeting-chart.svg",
    iconBg: "bg-[#FFAE00]/10",
    noteClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
  },
];

export function CrmStatCards() {
  return (
    <section
      aria-label="CRM summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="relative h-[156px] min-w-0 overflow-hidden rounded-[12px] bg-white p-4"
        >
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}
          >
            <Image src={stat.icon} alt="" width={20} height={20} />
          </div>
          <div className="mt-2 min-w-0 pr-[104px]">
            <p className="whitespace-nowrap text-2xl font-bold leading-normal">
              {stat.value}
            </p>
            <p className="whitespace-nowrap text-sm text-[#ADAAAA]">
              {stat.label}
            </p>
            <div className="mt-[3px] flex items-center gap-0.5 whitespace-nowrap">
              <span
                className={`rounded-lg px-1 py-1 text-[10px] font-bold leading-[13px] ${stat.noteClass}`}
              >
                {stat.note}
              </span>
              {stat.suffix && (
                <span className="text-xs text-[#8B93B8]">{stat.suffix}</span>
              )}
            </div>
          </div>
          <Image
            src={stat.chart}
            alt=""
            width={108}
            height={65}
            className="absolute bottom-4 right-4 h-[65px] w-[108px]"
          />
        </article>
      ))}
    </section>
  );
}
