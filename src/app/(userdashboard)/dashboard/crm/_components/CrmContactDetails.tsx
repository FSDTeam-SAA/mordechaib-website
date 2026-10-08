import Image from "next/image";
import Link from "next/link";

const contactInfo = [
  ["/crm/details/email.svg", "mikejohnson@gmail.com"],
  ["/crm/details/phone.svg", "+1(555) 987-6543"],
  ["/crm/details/location.svg", "New York ,USA"],
  ["/crm/details/website.svg", "www.google.com"],
  ["/crm/details/linkedin.svg", "www.linkedin.com"],
] as const;

const actions = [
  ["/crm/details/call.svg", "Call"],
  ["/crm/details/send-email.svg", "Email"],
  ["/crm/details/schedule.svg", "Schedule"],
] as const;

const metrics = [
  {
    label: "Expansion Potential",
    value: "High",
    score: "92",
    color: "text-[#10B981]",
  },
  { label: "Deal Value", value: "$6,300", color: "text-[#D946EF]" },
  { label: "Close Probability", value: "75%", color: "text-[#F59E0B]" },
  { label: "Expected Close", value: "Jul15,2026", color: "text-[#EF4444]" },
];

const activities = [
  [
    "/crm/details/activity-call.svg",
    "bg-[#10B981]/10",
    "Follow-Up Call completed with sarah",
    "Positive conversation about our proposal",
    "12m ago",
  ],
  [
    "/crm/details/activity-meeting.svg",
    "bg-[#5B7FF0]/10",
    "Meeting Scheduled",
    "Product demo meeting for jun 30th, 1:00 pm",
    "8m ago",
  ],
  [
    "/crm/details/activity-email.svg",
    "bg-[#D946EF]/10",
    "Email sent",
    "Proposal Details & Next Steps",
    "12m ago",
  ],
  [
    "/crm/details/activity-note.svg",
    "bg-[#5B7FF0]/10",
    "Note added",
    "Discussed budget and requirments",
    "10m ago",
  ],
  [
    "/crm/details/activity-insight.svg",
    "bg-[#9333EA]/10",
    "AI Insight Generated",
    "Discussed potential partnership opportunities",
    "10m ago",
  ],
  [
    "/crm/details/file-xlsx.svg",
    "bg-[#EF4444]/10",
    "Action taken",
    "Approved the project proposal",
    "8m ago",
  ],
  [
    "/crm/details/activity-call.svg",
    "bg-[#10B981]/10",
    "Follow-up needed",
    "Check on team progress",
    "5m ago",
  ],
] as const;

const insights = [
  ["Qualification", "Highly Qualified", "text-[#10B981]"],
  ["Next Best Action", "Send Contract draft", "text-[#F59E0B]"],
  ["Risk Level", "Low Risk", "text-[#EF4444]"],
  ["Predicted Close", "July 15,2026", "text-[#D946EF]"],
  ["LTV Estimate", "$6,300", "text-[#0E1224]"],
] as const;

const tasks = [
  ["Send contract draft", "Due Tomorrow"],
  ["Prepare for jun 30th meeting", "Due jun 10"],
  ["Follow up email", "Due jun 12"],
] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-[#0E1224]">{children}</h2>;
}

function AccentRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-[10px] bg-[#F5F7FF] py-2 pr-2 before:self-stretch before:w-1 before:shrink-0 before:rounded-sm before:bg-[#10B981]">
      {children}
    </div>
  );
}

export function CrmContactDetails() {
  return (
    <main className="min-h-[calc(100vh-83px)] space-y-4 p-4 text-[#0E1224]">
      <section className="flex flex-col gap-6 rounded-xl bg-white p-4 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Image
            src="/crm/details/mike-johnson.png"
            alt="Mike Johnson"
            width={120}
            height={120}
            className="size-[96px] shrink-0 rounded-full object-cover sm:size-[120px]"
          />
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-2xl font-bold">Mike Johnson</h1>
              <span className="rounded-full bg-[#EF4444]/10 px-2 py-1 text-sm text-[#EF4444]">
                Hot Lead
              </span>
            </div>
            <p className="text-sm text-[#8B93B8]">
              Marketing Director <span className="px-2">•</span> Johnson
              Construction
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-3">
              {contactInfo.map(([icon, value]) => (
                <span
                  key={value}
                  className="flex items-center gap-2 text-sm text-[#8B93B8]"
                >
                  <Image src={icon} alt="" width={16} height={16} />
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          {actions.map(([icon, label]) => (
            <button
              key={label}
              type="button"
              className="flex h-[52px] items-center gap-2 rounded-[10px] border border-[#5B7FF0] px-4 text-base font-medium text-[#5B7FF0]"
            >
              <Image src={icon} alt="" width={18} height={18} />
              {label}
            </button>
          ))}
          <button
            type="button"
            className="h-[52px] rounded-[10px] bg-[#5B7FF0] px-4 text-base font-medium text-white"
          >
            Add Task
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.46fr)_minmax(360px,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg bg-white p-3 text-center"
              >
                <p className="text-sm text-[#8B93B8]">{metric.label}</p>
                <div
                  className={`flex items-center justify-center gap-2 text-lg font-bold ${metric.color}`}
                >
                  {metric.score && (
                    <span className="flex size-8 items-center justify-center rounded-full border border-[#10B981] bg-[#10B981]/10">
                      {metric.score}
                    </span>
                  )}
                  {metric.value}
                </div>
              </article>
            ))}
          </section>
          <section className="min-h-[520px] rounded-2xl bg-white p-4">
            <SectionTitle>Activity Timeline</SectionTitle>
            <div className="mt-4 space-y-2">
              {activities.map(([icon, iconBg, title, description, time]) => (
                <div
                  key={title}
                  className="flex min-h-[57px] items-center gap-2 rounded-lg bg-[#F5F7FF] p-2"
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded ${iconBg}`}
                  >
                    <Image src={icon} alt="" width={16} height={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#8B93B8]">
                      {description}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-[#8B93B8]">
                    {time}
                  </time>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="rounded-2xl bg-white p-4">
            <SectionTitle>Ai Insight</SectionTitle>
            <div className="mt-4 space-y-2">
              {insights.map(([label, value, color]) => (
                <AccentRow key={label}>
                  <span className="min-w-0 flex-1 text-sm text-[#8B93B8]">
                    {label}
                  </span>
                  <strong
                    className={`text-right text-base sm:text-lg ${color}`}
                  >
                    {value}
                  </strong>
                </AccentRow>
              ))}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-4">
            <SectionTitle>Open Task</SectionTitle>
            <div className="mt-4 space-y-2">
              {tasks.map(([task, due]) => (
                <AccentRow key={task}>
                  <label className="flex min-w-0 flex-1 items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-[#0E1224]"
                    />
                    <span className="truncate">{task}</span>
                  </label>
                  <span className="shrink-0 rounded-lg border border-[#EF4444] bg-[#EF4444]/10 px-2 py-1 text-xs text-[#EF4444]">
                    {due}
                  </span>
                </AccentRow>
              ))}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-4">
            <SectionTitle>Files</SectionTitle>
            <div className="mt-4 space-y-2">
              {[
                ["/crm/details/file-extra.svg", "Q2 Pricing Sheet.xlsx"],
                ["/crm/details/file-pdf.svg", "Supplier Pricing.pdf"],
                ["/crm/details/file-pdf.svg", "Supplier Pricing.pdf"],
              ].map(([icon, file], index) => (
                <AccentRow key={`${file}-${index}`}>
                  <Image src={icon} alt="" width={18} height={18} />
                  <span className="truncate text-sm text-[#8B93B8]">
                    {file}
                  </span>
                </AccentRow>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-2xl bg-white p-4">
        <SectionTitle>Notes</SectionTitle>
        <div className="mt-4 rounded-lg bg-[#F4F5FE] p-4 text-sm text-[#8B93B8]">
          <p className="pl-4 before:mr-2 before:content-['•']">
            Client is interested in AI automation for their marketing workflow.
            Budget approved up to $10k for Phase 1. Decision maker is Sarah.
            Technical team will be involved in the demo. Prefers email and
            WhatsApp for communication.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-fit rounded-full bg-[#5B7FF0]/10 px-2 py-1 text-[#5B7FF0]">
              AI Note
            </span>
            <p>Client is eager to proceed. Prepare contract asap.</p>
          </div>
        </div>
      </section>
      <Link href="/dashboard/crm" className="sr-only">
        Back to CRM
      </Link>
    </main>
  );
}
