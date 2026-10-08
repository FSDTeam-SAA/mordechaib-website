import { SquarePen } from "lucide-react";

const quickActions = ["“Get today’s briefing”", "“Schedule a meeting with Iqbal”", "“Review yesterday’s performance”", "“Identify top 5 risks this week”", "“Discuss team challenges”", "“Generate ROI report “", "“Show me what changed today”"] as const;
const intelligence = ["Churn Prediction", "NPS Analytics", "Customer Health Score", "Renewal Forecasting"] as const;

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">{children}</h2>;
}

export function ChiefSidebar() {
  return (
    <aside className="space-y-4 py-4 lg:pr-4">
      <section className="rounded-lg bg-white p-3">
        <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
          <h2 className="text-base font-medium">Recent</h2>
          <button className="flex items-center gap-2 rounded-lg bg-[#F5F7FF] p-2 text-sm"><SquarePen className="size-5" strokeWidth={1.6} /> New Chat</button>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <button className="flex h-8 w-full items-center overflow-hidden bg-[#F5F7FF] pr-3 text-left before:mr-3 before:h-6 before:w-1 before:shrink-0 before:rounded-r-full before:bg-[#5B7FF0]"><span className="truncate">I&apos;ll schedule that meeting right away......</span></button>
          {["Meeting schedule......", "Generate ROI report..................", "Generate ROI report..................", "Generate ROI report.................."].map((item, index) => (
            <button key={`${item}-${index}`} className="block h-[34px] w-full truncate rounded-lg px-3 text-left">{item}</button>
          ))}
        </div>
      </section>
      <section className="rounded-lg bg-white p-3">
        <PanelTitle>Quick Actions</PanelTitle>
        <div className="mt-4 space-y-2">
          {quickActions.map((action) => <button key={action} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC]">{action}</button>)}
        </div>
      </section>
      <section className="rounded-lg bg-white p-3">
        <PanelTitle>Customer Intelligence</PanelTitle>
        <div className="mt-4 space-y-2">
          {intelligence.map((item) => <button key={item} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC]">{item}</button>)}
        </div>
      </section>
    </aside>
  );
}
