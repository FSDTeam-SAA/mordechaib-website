"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

const defaultGreeting =
  "During today’s AI strategy session, we analyzed your business operations and identified opportunities to automate repetitive workflows, improve team efficiency, and streamline client management. Based on the discussion, the AI generated recommended tasks and follow-up meetings focused on onboarding automation";

export default function GreetingSettings() {
  const [greeting, setGreeting] = useState(defaultGreeting);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-white p-4 sm:p-6">
        <div className="border-b border-[#F5F7FF] pb-4">
          <h2 className="text-lg font-medium leading-normal text-[#0E1224] sm:text-xl">
            AI Greeting Message
          </h2>
          <p className="mt-2 text-xs leading-normal text-[#6B6B6B] sm:text-sm">
            This message is spoken when the AI answers a call
          </p>
        </div>

        <textarea
          value={greeting}
          onChange={(event) => setGreeting(event.target.value)}
          aria-label="AI greeting message"
          className="mt-4 min-h-[180px] w-full resize-none rounded-lg bg-[#F5F7FF] p-4 text-sm leading-normal text-[#0E1224]/70 outline-none transition-shadow focus:ring-2 focus:ring-[#5B7FF0]/30 sm:min-h-[162px]"
        />
        <button
          type="button"
          onClick={() => toast.success("AI greeting saved successfully.")}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-[12px] bg-[#5B7FF0] px-8 text-base font-medium text-white transition-colors hover:bg-[#4D70DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0]/40 focus-visible:ring-offset-2"
        >
          Save Greeting
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 sm:p-6">
        <div className="border-b border-[#F5F7FF] pb-4">
          <h2 className="text-lg font-medium leading-normal text-[#0E1224] sm:text-xl">
            Business Hours
          </h2>
          <p className="mt-2 text-xs leading-normal text-[#6B6B6B] sm:text-sm">
            AI auto-answers outside these hours
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TimeSelect label="Monday–Friday" defaultValue="09:00AM–06:00PM" />
          <TimeSelect label="Saturday–Sunday" defaultValue="Closed" />
        </div>
      </section>
    </div>
  );
}

function TimeSelect({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs leading-normal text-[#6B7280]">{label}</span>
      <span className="relative mt-2 block">
        <select
          defaultValue={defaultValue}
          className="h-10 w-full appearance-none rounded-lg bg-[#F5F7FF] px-3 pr-9 text-xs text-[#6B7280] outline-none focus:ring-2 focus:ring-[#5B7FF0]/30"
        >
          {label === "Monday–Friday" ? (
            <>
              <option>09:00AM–06:00PM</option>
              <option>08:00AM–05:00PM</option>
              <option>10:00AM–07:00PM</option>
              <option>Closed</option>
            </>
          ) : (
            <>
              <option>Closed</option>
              <option>09:00AM–01:00PM</option>
              <option>09:00AM–06:00PM</option>
            </>
          )}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B93B8]"
          strokeWidth={1.5}
        />
      </span>
    </label>
  );
}
