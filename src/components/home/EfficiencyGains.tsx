import { CalendarDays, CheckSquare, Clock3, DollarSign, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "Time Returned to Your Business",
    color: "text-[#5B7FF0]",
    icon: Clock3,
    value: "47",
    suffix: "Hours Saved",
    body: "Spend less time on repetitive work and more time leading, serving customers, and growing your business.",
    stat: "+18% this month",
    visual: (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0E1224]">Payment Method</p>
          <span className="h-5 w-10 rounded-full bg-[#31C86B] p-0.5">
            <span className="block h-4 w-4 translate-x-5 rounded-full bg-white" />
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#0E1224]">
          <span>Automation Method</span>
          <span className="text-right">Task - Based</span>
          <span>Every Date</span>
          <span className="text-right">Every Month</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[#D9D9D9]">
          <div className="h-full w-[60%] rounded-full bg-[#5B7FF0]" />
        </div>
      </div>
    ),
  },
  {
    title: "Work Handled by AI",
    color: "text-[#D94DCE]",
    icon: CheckSquare,
    value: "312",
    suffix: "Tasks Completed",
    body: "Your AI workforce handles repetitive tasks and keeps daily operations moving.",
    stat: "+18% this month",
    visual: (
      <div className="rounded-xl bg-[#F7F7F7] p-4 text-xs text-[#0E1224]">
        {["T101", "T102", "T103"].map((id) => (
          <div key={id} className="grid grid-cols-3 gap-3 border-b py-2 last:border-0">
            <span><input type="checkbox" className="mr-2" />{id}</span>
            <span>Data Entry</span>
            <span>May 14</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Lower Operating Costs",
    color: "text-[#10B981]",
    icon: DollarSign,
    value: "$2,640",
    suffix: "Estimated Savings",
    body: "See how AI automation reduces manual work and helps lower operational expenses.",
    stat: "+22% this month",
    visual: (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <p className="text-sm text-[#0E1224]">Target Achieved</p>
          <p className="mt-3 font-bold">$2,640</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#10B981]" />
        </div>
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <p className="text-sm text-[#0E1224]">Goal achieved</p>
          <p className="mt-3 font-bold">100%</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#9BE8D0]" />
        </div>
      </div>
    ),
  },
  {
    title: "Scheduling Made Simple",
    color: "text-[#5BA5E8]",
    icon: CalendarDays,
    value: "28",
    suffix: "Meetings Scheduled",
    body: "Let your AI workforce coordinate meetings, manage calendars, and keep everyone on schedule.",
    stat: "+12% this month",
    visual: (
      <div className="rounded-xl bg-[#F7F7F7] p-4 text-xs">
        <p className="font-semibold text-[#0E1224]">All Scheduled Assets</p>
        <p className="mt-1 text-[#10B981]">Optimization: +12%</p>
        {["Meeting Meeting Title", "Meeting Meeting Title", "Meeting Meeting Title"].map((row, index) => (
          <div key={`${row}-${index}`} className="mt-3 flex justify-between border-t pt-2 text-[#5BA5E8]">
            <span>{row}</span>
            <span className="text-[#10B981]">Urgent</span>
          </div>
        ))}
      </div>
    ),
  },
];

const EfficiencyGains = () => {
  return (
    <section id="solutions" className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#E8FFF6] px-3 py-1.5 text-xs font-medium text-[#10B981]">
            <TrendingUp size={13} />
            Real ROI
          </div>
          <h2 className="text-[28px] font-bold leading-tight text-[#0E1224] sm:text-4xl lg:text-[42px]">
            See Exactly How Much Efficiency
            <br className="hidden sm:block" /> Your <span className="text-[#5B7FF0]">Business Gains</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] text-[13px] leading-relaxed text-[#0E1224] sm:mt-4 sm:text-sm">
            The more you use Noltra, the more leverage you gain. Track every automated task,
            every saved hour, and every decision accelerated.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-[1400px] gap-4 sm:mt-12 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-xl border border-[#E7E7E7] bg-white p-4 shadow-[0_0_12px_rgba(14,18,36,0.10)]">
                <div className="flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[12px] bg-current/10 ${card.color}`}>
                    <Icon size={19} />
                  </span>
                  <span className="rounded-[12px] bg-[#ECFFF8] px-2 py-1 text-xs text-[#10B981]">{card.stat}</span>
                </div>
                <div className="mt-2 min-h-[60px]">
                  <span className={`text-[30px] font-bold leading-none ${card.color}`}>{card.value}</span>
                  <span className={`ml-2 text-[11px] ${card.color}`}>{card.suffix}</span>
                </div>
                <div className="mt-4 flex min-h-[230px] items-start [&>*]:w-full">{card.visual}</div>
                <h3 className={`mt-0 min-h-[56px] text-lg font-bold leading-snug ${card.color}`}>{card.title}</h3>
                <p className="mt-0 text-[13px] leading-relaxed text-[#6B6B6B]">{card.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EfficiencyGains;
