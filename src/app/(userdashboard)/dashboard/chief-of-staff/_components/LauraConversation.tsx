"use client";

import Image from "next/image";
import { CalendarDays, Mic, Paperclip, Send } from "lucide-react";
import { FormEvent, useState } from "react";

function UserAvatar() {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xl font-medium text-[#5B7FF0] shadow-[0_0_4px_rgba(0,0,0,.25)]">RH</span>;
}

function LauraAvatar() {
  return <Image src="/laura.png" alt="Laura" width={36} height={36} className="size-9 shrink-0 rounded-full border border-[#8B93B8] object-cover" />;
}

function LauraMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full max-w-[386px] items-start gap-3 self-start"><LauraAvatar /><div className="min-w-0 flex-1 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-[#F5F7FF] bg-[#F5F7FF] p-3 text-xs leading-normal">{children}</div></div>;
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex max-w-[409px] items-end gap-3 self-end"><div className="rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl bg-[#5B7FF0] p-3 text-sm text-white">{children}</div><UserAvatar /></div>;
}

export function LauraConversation() {
  const [message, setMessage] = useState("");
  function submitMessage(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage(""); }

  return (
    <section className="flex min-h-[720px] flex-col bg-white py-4 lg:min-h-[995px]">
      <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white p-4 sm:p-6">
        <UserMessage>Good Morning!</UserMessage>
        <LauraMessage>
          <p>Good morning! I&apos;ve reviewed your schedule and business activity. Here are today&apos;s priorities:</p>
          <p>Marcus Chen follow-up is due — his proposal window closes Friday.</p>
          <p>3 new leads came in overnight from the BlueStone campaign.</p>
          <p>Your revenue is tracking 14% above July target — great momentum.</p>
          <p className="mt-3">Shall I draft the follow-up email to Marcus?</p>
        </LauraMessage>
        <UserMessage>Yes, draft the email. Also, what&apos;s the status of the Nova Analytics onboarding?</UserMessage>
        <LauraMessage>
          <p>Email drafted for Marcus Chen — ready to send in your Outbox.</p>
          <p className="mt-3">Nova Analytics onboarding: Priya Sharma confirmed the Jul 9 call. I&apos;ve added it to your calendar and created a prep checklist with 6 items. The Operations Agent is handling the technical setup.</p>
          <p className="mt-3">Anything else you need before your 10 AM team standup?</p>
        </LauraMessage>
        <UserMessage>Schedule a meeting with Mike Johnson</UserMessage>
        <LauraMessage>
          <p>I&apos;ll schedule that meeting right away. I found an available slot at 2:00 PM tomorrow. Here are the details:</p>
          <div className="mt-3 rounded-lg bg-white p-2 text-xs shadow-[0_0_4px_rgba(0,0,0,.16)]">
            <h3 className="flex items-center gap-2 text-sm text-[#5B7FF0]"><CalendarDays className="size-4" /> Meeting Preview</h3>
            <dl className="mt-2 grid grid-cols-[68px_1fr] gap-y-2 text-[#555577]">
              <dt>Date:</dt><dd>Tomorrow, July 7</dd><dt>Time:</dt><dd>2:00 PM - 2:30 PM ET</dd><dt>Attendees:</dt><dd>You, Mike Johnson</dd><dt>Reminder:</dt><dd>15 min before</dd>
            </dl>
            <div className="mt-2 flex gap-3"><button className="rounded-lg border border-[#8B93B8] px-4 py-2 text-sm text-[#555577]">Cancel</button><button className="flex-1 rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white">Confirm &amp; Add a calendar</button></div>
          </div>
        </LauraMessage>
      </div>
      <form onSubmit={submitMessage} className="mt-2 flex h-[72px] items-center gap-3 rounded-lg bg-white px-4 sm:px-8">
        <button type="button" aria-label="Attach file"><Paperclip className="size-6" strokeWidth={1.6} /></button>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share what’s on your mind..." className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#8B93B8]" />
        <button type="button" aria-label="Voice message" className="flex size-10 items-center justify-center rounded-full bg-[#F5F7FF]"><Mic className="size-6" strokeWidth={1.6} /></button>
        <button type="submit" aria-label="Send message" className="flex size-10 items-center justify-center rounded-full bg-[#5B7FF0] text-white"><Send className="size-6" strokeWidth={1.6} /></button>
      </form>
    </section>
  );
}
