import Image from "next/image";
import { Bot, CheckCircle2, Mic, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Leave a Voice Note",
    lead: "Tell Noltra what you need.",
    text: "Follow up with John tomorrow, update his CRM, and schedule a meeting for next week.",
    icon: Mic,
  },
  {
    number: "02",
    title: "Noltra Executes",
    lead: "Your AI Chief of Staff gets to work.",
    text: "It creates tasks, updates your CRM, sends follow-ups, schedules meetings, and routes work to the right AI agent.",
    icon: Bot,
  },
  {
    number: "03",
    title: "Record Your Calls",
    lead: "Let Noltra listen to the conversation.",
    text: "Noltra captures important details from client calls or meetings and lists what needs to happen next.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Your AI Chief of Staff Takes Over",
    lead: "Turn the conversation into execution.",
    text: "Tasks are created, follow-ups are scheduled, CRM records are updated, and your team knows exactly what needs to happen.",
    icon: TrendingUp,
  },
];

const moduleItems = [
  {
    title: "Voice Note",
    text: "Follow up with Sarah about the proposal.",
    icon: Mic,
  },
  {
    title: "Client Steps",
    text: "Extract next steps and commitments.",
    icon: Bot,
  },
  {
    title: "Execution",
    text: "Create tasks, update CRM and follow up.",
    icon: CheckCircle2,
  },
  {
    title: "Daily Brief",
    text: "Here's what happened and what's next.",
    icon: TrendingUp,
  },
];

const HowItWorks = () => {
  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-14">
      <div className="container mx-auto">
        <div className="mx-auto w-full  text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF014] px-3 py-1.5 text-[11px] font-medium text-[#5B7FF0] sm:mb-5 sm:text-xs">
            <Bot size={13} />
            How It Works
          </div>

          <h2 className="text-[28px] font-bold leading-tight text-[#0E1224] sm:text-4xl lg:text-[48px]">
            Talk to Noltra. It Turns{" "}
            <span className="text-[#5B7FF0]">Conversations Into Execution.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-[720px] text-[13px] leading-relaxed text-[#6B6B6B] sm:mt-4 sm:text-base">
            Leave a voice note, finish a client call, or record a meeting. Noltra
            understands what happened and turns it into work.
          </p>
        </div>

        <div className="mt-9 grid items-center gap-8 sm:mt-12 lg:mt-16 lg:grid-cols-[0.95fr_1fr] lg:gap-16">
          <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
            <div className="relative">
              <div className="relative mx-auto aspect-[1.05/1] w-full max-w-[315px] overflow-hidden rounded-xl bg-[#F4F7FF] shadow-sm sm:max-w-none lg:h-[640px] lg:aspect-auto">
                <Image
                  src="/howitwork.png"
                  alt="Noltra execution workspace"
                  fill
                  sizes="(min-width: 1024px) 46vw, (min-width: 640px) 430px, 315px"
                  className="object-cover object-left"
                />
              </div>

              <div className="mx-auto mt-4 w-full max-w-[315px] rounded-xl border border-[#E7E9F2] bg-white p-4 shadow-[0_16px_44px_rgba(14,18,36,0.12)] sm:absolute sm:-bottom-8 sm:right-[-34px] sm:mt-0 sm:max-w-none sm:w-[340px] sm:p-5 lg:right-[-78px] lg:w-[365px]">
                <h3 className="text-xl font-medium text-[#0E1224] sm:text-2xl">
                  Execution Module
                </h3>
                <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                  {moduleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex gap-2.5 sm:gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[12px] bg-[#FCE8FF] text-[#D946EF1A] sm:h-7 sm:w-7">
                          <Icon size={14} className="text-[#D24FC7] sm:size-[15px]" />
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-[#0E1224] sm:text-base">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#0E1224] sm:text-sm">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="mx-auto mt-5 max-w-[315px] text-center text-lg font-medium leading-snug text-[#5B7FF0] sm:mt-20 sm:max-w-none sm:text-left sm:text-2xl">
              You talk. Noltra listens. Noltra executes.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[680px]">
            <div>
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    data-home-step
                    className="relative mb-3 border-l border-[#A9B8F8] bg-white px-4 py-3 shadow-md last:mb-0 sm:px-7 sm:py-4"
                  >
                    <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#FCE8FF] text-[#E84BD9] sm:right-6 sm:h-9 sm:w-9">
                      <Icon size={18} className="sm:size-5" />
                    </span>
                    <p className="text-[26px] font-bold leading-none text-[#5B7FF0] sm:text-[32px]">
                      {step.number}
                    </p>
                    <h3 className="mt-2 pr-10 text-lg font-semibold leading-tight text-[#0E1224] sm:mt-3 sm:pr-12 sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs font-normal text-[#0E1224] sm:text-sm">
                      {step.lead}
                    </p>
                    <p className="mt-1.5 text-xs font-normal leading-relaxed text-[#0E1224] sm:mt-2 sm:text-sm">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
