import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GreetingSettings from "./_components/GreetingSettings";
import VoiceAgentSettings from "./_components/VoiceAgentSettings";

export default function CallIntelligenceSettingsPage() {
  return (
    <div className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 text-[#0E1224]">
      <Link
        href="/dashboard/call-intelligence"
        className="inline-flex items-center gap-2 text-[0.9375rem]/[1.5rem] text-[#8B93B8] transition-colors hover:text-[#5B7FF0]"
      >
        <span className="flex size-10 items-center justify-center rounded-full border border-[#8B93B8]">
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </span>
        <span>Return to Details</span>
      </Link>

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-2">
        <VoiceAgentSettings />
        <GreetingSettings />
      </div>
    </div>
  );
}
