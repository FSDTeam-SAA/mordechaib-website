import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleCheck, Sparkles } from "lucide-react";

const Hero = () => {
  const points = [
    { lead: "conversation", text: "becomes action." },
    { lead: "action", text: "becomes progress." },
    { lead: "CEO", text: "becomes more efficient." },
  ];

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:min-h-screen lg:px-8 lg:pb-20 lg:pt-36"
      style={{ backgroundImage: "url('/herobg.png')" }}
    >
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-[1.05fr_0.85fr] xl:gap-12">
        <div data-hero-copy className="mx-auto max-w-[800px] text-center lg:mx-0 lg:text-left">
          <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#5B7FF01A] px-3 py-2 text-[11px] font-medium leading-tight text-[#5B7FF0] sm:text-[13px] lg:text-[14px]">
            <Sparkles size={13} />
            <span>AI Workforce Operating System for Small Businesses</span>
          </div>

          <h1 className="mx-auto max-w-[720px] text-[32px] font-bold !leading-[1.16] tracking-normal text-[#0E1224] sm:text-[42px] lg:mx-0 lg:text-[40px] xl:max-w-[800px] xl:text-[60px]">
            Operate With the{" "}
            <span className="text-[#5B7FF0]">Efficiency of a World Class CEO</span>{" "}
            Automatically
          </h1>

          <p className="mx-auto mt-4 max-w-[720px] text-sm font-normal leading-relaxed text-[#6B6B6B] sm:text-base lg:mx-0 lg:text-base xl:text-xl">
            After every client call or meeting, record a quick voice note. Your AI Chief of
            Staff instantly understands the conversation, turns it into structured
            execution, updates your CRM, schedules meetings, follows up with clients,
            and keeps your entire business moving without you needing to manage the
            details.
          </p>

          <div className="mx-auto mt-5 max-w-[560px] space-y-3 text-left lg:mx-0">
            {points.map((point) => (
              <div
                key={point.lead}
                className="flex items-center gap-3 text-sm font-medium text-[#6B6B6B] sm:text-base"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D9E1FF] bg-white">
                  <CircleCheck className="h-4 w-4 text-[#5B7FF0]" />
                </span>
                <span>
                  Every <span className="text-[#5B7FF0]">{point.lead}</span> {point.text}
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start lg:gap-4">
            <Link
              href="#trial"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#486EE2] sm:w-auto sm:text-base"
            >
              Start Free Trial
              <ArrowRight size={15} />
            </Link>
            <Link
              href="#meeting"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] px-1 text-sm font-medium text-[#5B7FF0] sm:w-auto sm:text-base"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#5B7FF0] bg-white sm:h-12 sm:w-12">
                <CalendarDays size={20} />
              </span>
              Book A Meeting
            </Link>
            <Image
              src="/sinature.png"
              alt="AI workforce dashboard"
              width={1000}
              height={1000}
              priority
              className="absolute bottom-[-42px] left-[280px] hidden h-[50px] w-[212px] object-cover lg:block"
            />
          </div>
        </div>

        <div data-hero-visual className="relative mx-auto hidden w-full max-w-[760px] lg:mx-0 lg:block lg:max-w-none">
          <Image
            src="/hero_image.png"
            alt="AI workforce dashboard"
            width={1000}
            height={1000}
            priority
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
