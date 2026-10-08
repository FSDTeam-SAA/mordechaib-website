import { ArrowRight, Mic } from "lucide-react";
import Image from "next/image";
import { DashboardKpiCards } from "./_components/DashboardKpiCards";
import { TaskOverviewCard } from "./_components/TaskOverviewCard";

const agents = [
  ["/profile.png", "Steve", "Sales Agent", true],
  ["/cassie.png", "Cassie", "Support Agent", false],
  ["/vizzy.png", "Vizzy", "Operations Agent", true],
  ["/dexter.png", "Dexter", "Strategy Agent", true],
  ["/havi.png", "Havi", "Design Agent", true],
  ["/shshie.png", "Soshie", "Marketing Agent", true],
] as const;
const meetings = [
  ["Johnson Construction - Deal Review", "2:00pm", "30min"],
  ["Green Tech - Budget Meeting", "4:00pm", "45min"],
  ["Smith & Co. - Project Kickoff", "3:00pm", "1hr"],
  ["Creative Designs - Client Presentation", "5:00pm", "1hr 30min"],
];
const priorities = [
  ["Finalize Commercial Proposal for Acme Corp", "Steve (Sales)", "HIGH"],
  [
    "Resolve Urgent Billing SLA Ticket #492",
    "Cassie (Customer Support)",
    "HIGH",
  ],
  [
    "Draft Q3 Marketing Strategy & Social Posts",
    "Soshie (Marketing)",
    "MEDIUM",
  ],
  [
    "Competitor Pricing & Package Analysis",
    "Dexter (Strategy Agent)",
    "MEDIUM",
  ],
];

function CardTitle({
  children,
  action = "View All",
}: {
  children: React.ReactNode;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
      <h2 className="text-xl font-medium text-[#0E1224]">{children}</h2>
      <button className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]">
        {action}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-4 pb-10">
      <DashboardKpiCards />

      <section className="rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-medium text-[#0E1224]">Ai Workforce</h2>
            <p className="mt-1 text-sm text-[#8B93B8]">
              Your specialist AI agents working.
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-[#5B7FF0]">
            View all agents
            <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {agents.map(([image, name, role, active]) => (
            <div key={name} className="flex items-center gap-2">
              <Image
                src={image}
                alt={`${name} profile`}
                width={60}
                height={60}
                className="size-[60px] shrink-0 rounded-[12px] object-cover"
              />
              <div className="min-w-0">
                <p className="font-medium text-[#0E1224]">{name}</p>
                <p className="truncate text-xs text-[#8B93B8]">{role}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${active ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#8B93B8]/10 text-[#8B93B8]"}`}
                >
                  {active ? "Active" : "Deactivate"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl bg-white p-6">
          <CardTitle action="View Calendar">Upcoming Meetings</CardTitle>
          <div className="mt-4 space-y-2">
            {meetings.map(([name, time, duration], index) => (
              <div key={name} className="flex gap-2 py-1">
                <span
                  className={`w-1.5 rounded-full ${index % 2 ? "bg-[#D24FC7]" : "bg-[#5B7FF0]"}`}
                />
                <div>
                  <p className="text-sm font-medium text-[#0E1224]">{name}</p>
                  <p className="mt-1 text-sm text-[#8B93B8]">
                    {time}
                    <span className="mx-3">•</span>
                    {duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 h-[52px] w-full rounded-lg bg-[#5B7FF0] text-sm font-medium text-white">
            Schedule Meeting
          </button>
        </article>
        <article className="rounded-2xl bg-white p-6">
          <CardTitle action="View Full Briefing">
            Today&apos;s Executive Briefing
          </CardTitle>
          <div className="mt-4 space-y-5">
            {[
              "Follow up with Johnson Construction",
              "Review pending client approvals",
              "Prepare Q3 strategy summary",
              "Send weekly performance report",
              "Confirm tomorrow's meetings",
            ].map((item, index) => (
              <div key={item} className="flex gap-3">
                <span
                  className={`mt-1.5 size-2 rounded-full ${index === 2 ? "bg-[#F59E0B]" : index === 4 ? "bg-[#8B93B8]" : "bg-[#10B981]"}`}
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-medium text-[#0E1224]">{item}</p>
                    <span className="text-xs text-[#8B93B8]">
                      {index < 2 ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8B93B8]">
                    {10 + index}:30 AM
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl bg-white p-6">
          <CardTitle>Recent Voice Notes</CardTitle>
          <div className="mt-4 space-y-5">
            {[
              "Follow up with Johnson Construction",
              "Operations workflow update",
              "Campaign planning notes",
              "Client feedback summary",
            ].map((item, i) => (
              <div key={item} className="flex gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-[#5B7FF0]/10 text-[#5B7FF0]">
                  <Mic className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0E1224]">
                    {item}
                  </p>
                  <p className="mt-2 text-xs text-[#8B93B8]">
                    {i ? "2h ago" : "10 min ago"} ·{" "}
                    {i % 2 ? "Operations" : "Sales"} · {i + 1} tasks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <TaskOverviewCard />
        <article className="rounded-2xl bg-white p-6">
          <CardTitle>Top Priorities</CardTitle>
          <div className="mt-4 space-y-4">
            {priorities.map(([title, owner, level], index) => (
              <div key={title} className="flex gap-2">
                <span
                  className={`size-5 shrink-0 rounded-full border-2 ${index === 3 ? "border-[#10B981] bg-[#10B981]/10" : "border-[#8B93B8]"}`}
                />
                <div className="min-w-0">
                  <p
                    className={
                      index === 3
                        ? "truncate text-sm text-[#8B93B8] line-through"
                        : "truncate text-sm font-medium text-[#0E1224]"
                    }
                  >
                    {title}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-[#8B93B8]">
                    <span
                      className={`size-1.5 rounded ${level === "HIGH" ? "bg-[#EF4444]" : "bg-[#8B93B8]"}`}
                    />
                    {owner}
                    <span
                      className={`rounded-full px-2 py-1 ${level === "HIGH" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#E4EAF8]"}`}
                    >
                      {level}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
