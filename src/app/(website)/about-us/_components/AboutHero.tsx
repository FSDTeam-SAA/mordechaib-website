"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function AboutHero() {
  const { status } = useSession();

  return (
    <section
      className="overflow-hidden bg-cover bg-center bg-no-repeat px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-36"
      style={{ backgroundImage: "url('/herobg.png')" }}
    >
      <div className="container mx-auto grid items-center gap-10 lg:min-h-[520px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 xl:gap-14">
        <div className="mx-auto max-w-[650px] text-center lg:mx-0 lg:text-left">
          <h1 className="text-[34px] font-bold leading-[1.2] tracking-normal text-[#0E1224] sm:text-[44px] lg:text-[46px] xl:text-[54px]">
            Driving Executive Efficiency Through an{" "}
            <span className="text-[#5B7FF0]">AI-Powered</span> Operating System
          </h1>

          <p className="mx-auto mt-5 max-w-[650px] text-sm leading-relaxed text-[#6B6B6B] sm:text-base lg:mx-0 lg:text-[17px]">
            Noltra gives CEOs a unified AI workforce that eliminates operational
            waste, accelerates execution, and delivers measurable efficiency from
            day one.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start lg:gap-4">
            {status === "unauthenticated" && (
              <Link
                href="/sign-up"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#486EE2] sm:w-auto"
              >
                Start
                <ArrowRight size={16} />
              </Link>
            )}

            <div className="relative">
              <Link
                href="/#meeting"
                className="inline-flex h-12 items-center justify-center gap-2 text-sm font-medium text-[#5B7FF0]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#5B7FF0] bg-white">
                  <CalendarDays size={19} />
                </span>
                Book A Meeting
              </Link>
              <Image
                src="/sinature.png"
                alt="Schedule your personalized walkthrough"
                width={426}
                height={120}
                className={cn(
                  "absolute top-11 hidden h-auto w-[180px] object-contain sm:block",
                  status === "unauthenticated" ? "left-14" : "left-2",
                )}
              />
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[720px] lg:mt-0 lg:max-w-none">
          <Image
            src="/hero_image.png"
            alt="Noltra AI operating system dashboard"
            width={1500}
            height={1408}
            priority
            sizes="(max-width: 1023px) 92vw, 50vw"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
