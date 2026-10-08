import Image from "next/image";
import { Check } from "lucide-react";

const visionPoints = [
  "AI that lightens the load, not adds to it",
  "A workspace where owners and AI work side-by-side",
  "Days that feel organized instead of overwhelming",
  "Insights that make decisions easier and smarter",
  "Technology that grows with the business, not against it",
];

function OurVision() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <h2 className="text-[30px] font-midium leading-tight text-[#0E1224] sm:text-[36px] lg:text-[48px]">
            Our Vision With <span className="text-[#5B7FF0]">Noltra</span>
          </h2>
          <h3 className="mt-5 text-base font-midium leading-tight text-[#141936] sm:text-2xl">
            Built from real struggle, shaped by real owners
          </h3>

          <div className="mt-5 space-y-4 text-sm leading-relaxed font-normal text-[#141936] sm:text-xl">
            <p>
              Noltra wasn&apos;t imagined in a strategy meeting - it came from living
              the chaos of small-business life. The long nights, the constant
              pressure, the feeling of running everything alone. I built Noltra
              because I knew that pain personally, and I knew owners deserved better.
            </p>
            <p>
              Our vision is to give small-business owners clarity, confidence, and
              time back - through an AI operating system that feels like a partner,
              not another tool to manage.
            </p>
          </div>

          <ul className="mt-6 space-y-4">
            {visionPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-[#141936] sm:text-xl font-normal">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 aspect-[16/9] overflow-hidden rounded-lg lg:order-2">
          <Image
            src="/about2.png"
            alt="Noltra vision"
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default OurVision;
