import Image from "next/image";
import { Check } from "lucide-react";

const benefits = [
  {
    title: "Eliminates fragmentation",
    text: "by consolidating CRM, tasks, meetings, workflows, and communication into a single, aligned system",
  },
  {
    title: "Executes work automatically",
    text: "with AI that understands context, priorities, and the operational chain of command",
  },
  {
    title: "Executes work automatically",
    text: "with AI that understands context, priorities, and the operational chain of command",
  },
  {
    title: "Keeps teams accountable and synchronized",
    text: "with clear ownership, structured processes, and real-time visibility",
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
            Modern companies lose efficiency because teams are forced to work across
            scattered, disconnected tools. Information gets buried, workflows stall,
            and leaders end up managing operational friction instead of scaling the
            business.
          </p>
          <p className="mt-4 text-sm font-medium leading-relaxed text-[#141936] sm:text-xl">
            Noltra fixes this by giving CEOs{" "}
            <span className="text-[#5B7FF0]">one intelligent operating system</span>{" "}
            that delivers real operational efficiency:
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
            This isn&apos;t another productivity tool - it&apos;s your AI workforce,
            engineered to run your company with precision, speed, and efficiency so
            leadership can focus entirely on growth.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
