import Image from "next/image";
import { Bot } from "lucide-react";

const agents = [
  {
    name: "Steve",
    role: "Sales Agent",
    color: "border-[#5B9CD580]",
    avatar: "/profile.png",
    tagClassName: "bg-[#EAF4FF] text-[#5B9CD5]",
    tags: ["Opportunity Identification", "Suggests content", "Automated Quote Creation", "Sales Pipeline Monitoring"],
    text: "Listens to every conversation, identifies opportunities, updates your CRM, and ensures no revenue slips through the cracks.",
  },
  {
    name: "Cassie",
    role: "Customer Support Agent",
    color: "border-[#06B6D480]",
    avatar: "/cassie.png",
    tagClassName: "bg-[#E8FBFF] text-[#06B6D4]",
    tags: ["Ticket tagging", "Reply generation", "Issue prioritization", "Urgent escalation"],
    text: "Captures issues, drafts responses, and escalates urgent cases so clients stay happy without manual triage.",
  },
  {
    name: "Vizzy",
    role: "Operations Agent",
    color: "border-[#D24FC780]",
    avatar: "/vizzy.png",
    tagClassName: "bg-[#FDEBFB] text-[#D24FC7]",
    tags: ["Task extraction", "Team assignment", "Deadline tracking", "Workflow automation"],
    text: "Extracts tasks, assigns owners, tracks deadlines, and keeps your internal machine running smoothly.",
  },
  {
    name: "Dexter",
    role: "Strategy Agent",
    color: "border-[#5B7FF080]",
    avatar: "/dexter.png",
    tagClassName: "bg-[#EEF2FF] text-[#5B7FF0]",
    tags: ["Executive reports", "Revenue forecasting", "Risk analysis", "Client scoring"],
    text: "Analyzes performance, forecasts revenue, scores clients, and delivers your daily executive briefing.",
  },
  {
    name: "Havi",
    role: "Design Agent",
    color: "border-[#F59E0B80]",
    avatar: "/havi.png",
    tagClassName: "bg-[#FFF5DE] text-[#F59E0B]",
    tags: ["Brief generation", "Asset tracking", "Brand consistency", "Creative requests"],
    text: "Turns voice notes into briefs, tracks assets, and keeps every creative request brand consistent.",
  },
  {
    name: "Soshie",
    role: "Marketing Agent",
    color: "border-[#10B98180]",
    avatar: "/shshie.png",
    tagClassName: "bg-[#E9FBF5] text-[#10B981]",
    tags: ["Lead Engagement Automation", "Marketing Campaign Analytics", "Real-Time Social Listening", "Automated Content Planner"],
    text: "Automates outreach, analyzes campaigns, listens across social channels, and keeps your funnel active.",
  },
];

const AIAgentSystem = () => {
  return (
    <section id="features" className="bg-[#F5F7FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="container mx-auto">
        <div className="mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF014] px-3 py-1.5 text-[11px] font-medium text-[#5B7FF0] sm:mb-5 sm:text-sm">
            <Bot size={13} />
            AI Agent System
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#8EA6F8] bg-white sm:h-16 sm:w-16">
              <Image
                src="/laura.png"
                alt="Laura profile"
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-[28px] font-bold leading-tight text-[#0E1224] sm:text-4xl lg:text-[46px]">
              Laura- Your <span className="text-[#5B7FF0]">AI Chief of Staff</span>
            </h2>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#6B6B6B] sm:mt-4 sm:text-lg lg:text-xl">
            Leave a voice note, finish a client call, or record a meeting.Laura turns it into action across your six AI agents.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <article
              key={agent.name}
              className={`rounded-xl border-t-[4px] ${agent.color} bg-white p-4 shadow-sm sm:p-5`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#EAF0FF]">
                  <Image
                    src={agent.avatar}
                    alt={`${agent.name} profile`}
                    width={1000}
                    height={1000}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium leading-tight text-[#0E1224]">{agent.name}</h3>
                  <p className="text-base font-normal text-[#0E1224]">{agent.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#0E1224] sm:mt-5 sm:text-base">{agent.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span key={tag} className={`rounded-[12px] px-3 py-2 text-xs ${agent.tagClassName}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIAgentSystem;
