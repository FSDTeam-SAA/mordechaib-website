import { Bot, BrainCircuit, ChartNoAxesCombined, Database, Mic, Workflow } from "lucide-react";

const advantages = [
  [BrainCircuit, "AI Chief of Staff", "Your AI Chief of Staff understands conversations, identifies priorities, and converts decisions into action - ensuring nothing slips, nothing stalls, and execution stays efficient."],
  [Database, "Unified Business Workspace", "CRM, tasks, meetings, calendars, AI conversations, and business intelligence - all in one place. No switching tools. No wasted time. Just efficient operations."],
  [Mic, "Voice-to-Action Automation", "Record a meeting or drop a voice note, and Noltra instantly turns it into structured tasks, CRM updates, follow-ups, and automated workflows. Zero manual work. Zero operational drag."],
  [Bot, "AI Workforce", "Access a team of specialized AI agents across Sales, Marketing, Operations, Design, Support, and Strategy. They execute work, accelerate output, and multiply your team's efficiency."],
  [ChartNoAxesCombined, "Built to Scale", "From solo founders to enterprise teams, Noltra scales with your business. Secure, flexible, and engineered to support growth without adding operational complexity."],
  [Workflow, "Actionable Insights", "Receive real-time recommendations, executive summaries, performance analytics, and strategic insights - giving CEOs the clarity to make fast, confident, data-driven decisions."],
] as const;

function NoltraAdvantage() {
  return (
    <section className="bg-[#F5F7FF] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="text-[30px] font-bold leading-tight text-black sm:text-[36px] lg:text-[48px]">
            The <span className="text-[#5B7FF0]">Noltra</span> Advantage
          </h2>
          <p className="mx-auto mt-3  text-sm leading-relaxed text-[#141936] sm:text-lg">
            The AI operating system engineered to eliminate inefficiency, accelerate execution, and keep companies aligned
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {advantages.map(([Icon, title, text]) => (
            <article key={title} className="rounded-lg bg-white p-4 sm:p-5 lg:min-h-[186px]">
              <span
                className="flex size-[40px] items-center justify-center rounded-[12px] text-white"
                style={{ background: "linear-gradient(134.37deg, #8A38F5 4.64%, #21D4FD 99.44%)" }}
              >
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-2xl font-midium leading-tight text-[#0E1224]">{title}</h3>
              <p className="mt-4 text-xs leading-relaxed text-[#0E1224] sm:text-[16px]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NoltraAdvantage;
