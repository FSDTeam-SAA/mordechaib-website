import Image from "next/image";
import { Check } from "lucide-react";

const benefits = [
  {
    title: "Turns Conversations Into Action",
    text: "After every client call, meeting, or voice note, Noltra understands what was discussed, identifies important next steps, and automatically creates actionable tasks.",
  },
  {
    title: "Automates the Follow-Through",
    text: "From updating your CRM and scheduling meetings to sending follow-ups and assigning tasks, Noltra helps ensure that nothing important gets overlooked.",
  },
  {
    title: "Coordinates Your AI Workforce",
    text: "Your AI Chief of Staff connects specialized AI agents to the work that needs to get done, helping coordinate Sales, Marketing, Operations, and Customer Support.",
  },
  {
    title: "Keeps Your Business Moving",
    text: "With organized tasks, clear ownership, and visibility into ongoing work, Noltra helps your business stay aligned and on track.",
  },
];

function AboutSection() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg lg:h-[730px] lg:aspect-auto">
          <Image
            src="/aboutsection.png"
            alt="Executive considering operational challenges"
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-[30px] font-bold leading-tight text-[#0E1224] sm:text-[36px] lg:text-[48px]">
            Why We Built <span className="text-[#5B7FF0]">Noltra</span>
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-[#141936] sm:text-xl">
            Running a business means managing countless conversations, decisions,
            tasks, and follow-ups. But too often, important details get lost, tasks go
            unfinished, and business owners spend more time managing operations than
            growing their company.
          </p>
          <p className="mt-4 text-sm font-medium leading-relaxed text-[#141936] sm:text-xl">
            We built Noltra to change that. Noltra turns everyday business
            conversations into organized action and execution.
          </p>

          <div className="mt-5 space-y-9">
            {benefits.map((benefit, index) => (
              <div key={`${benefit.title}-${index}`} className="flex items-start gap-3">
                <span
                  className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "linear-gradient(134.37deg, #8A38F5 4.64%, #21D4FD 99.44%)" }}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                <div>
                  <h3 className="text-base capitalize font-semibold leading-tight text-[#0E1224] sm:text-2xl">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#141936] sm:text-base">
                    {benefit.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-[#20263D] sm:text-base">
            Noltra isn&apos;t another tool you have to manage. It&apos;s your AI Chief of
            Staff, turning conversations into execution so you can spend less time
            managing the work and more time growing your business.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
