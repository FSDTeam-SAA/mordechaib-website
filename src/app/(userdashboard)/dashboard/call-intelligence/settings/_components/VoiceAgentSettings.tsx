import Image from "next/image";
import SettingToggle from "./SettingToggle";

const settings = [
  {
    title: "Enable Voice AI Agent",
    description: "AI answers calls and generates summaries",
  },
  {
    title: "Auto-answer all calls",
    description: "AI answers every call, not just when unavailable",
  },
  {
    title: "Record conversations",
    description: "Full call recordings stored securely for 90 days",
  },
  {
    title: "Auto-update CRM from calls",
    description: "Contacts and deals updated from call data",
  },
  {
    title: "Auto-create tasks from calls",
    description: "Extracted action items become tasks for review",
  },
  {
    title: "Send caller summary email",
    description: "Email you a summary after each analyzed call",
  },
];

export default function VoiceAgentSettings() {
  return (
    <section className="rounded-2xl bg-white p-3 sm:p-4">
      <div className="flex items-center gap-3 border-b border-[#F5F7FF] pb-2.5">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-[#8B93B8] sm:size-14">
          <Image
            src="/call-intelligence/voice-agent.png"
            alt="Voice AI agent"
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-[1.0625rem]/[1.75rem] font-medium leading-normal text-[#0E1224] sm:text-[1.1875rem]/[1.75rem]">
            Enable Voice AI Agent
          </h2>
          <p className="mt-2 text-xs leading-normal text-[#6B6B6B] sm:text-sm">
            AI answers calls and generates summaries
          </p>
        </div>
      </div>

      <div className="pt-1">
        {settings.map((setting) => (
          <SettingToggle key={setting.title} {...setting} />
        ))}
      </div>
    </section>
  );
}
