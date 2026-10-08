import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GreetingSettings from "./_components/GreetingSettings";
import VoiceAgentSettings from "./_components/VoiceAgentSettings";

export default function CallIntelligenceSettingsPage() {
  return (
    <div className="min-h-[calc(100vh-83px)] p-4 text-[#0E1224]">
      <Link
        href="/dashboard/call-intelligence"
        className="inline-flex items-center gap-2 text-base text-[#8B93B8] transition-colors hover:text-[#5B7FF0]"
      >
        <span className="flex size-10 items-center justify-center rounded-full border border-[#8B93B8]">
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </span>
        <span>Return to Details</span>
      </Link>

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-2">
        <VoiceAgentSettings />
        <GreetingSettings />
      </div>
    </div>
  );
}
