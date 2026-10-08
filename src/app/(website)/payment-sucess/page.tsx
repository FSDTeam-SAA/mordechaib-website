"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, CalendarDays, ArrowRight } from "lucide-react";
import gsap from "gsap";

export default function PaymentSuccessPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        containerRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
        }
      )
        .fromTo(
          iconRef.current,
          {
            opacity: 0,
            scale: 0.5,
            y: 20,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
          }
        )
        .fromTo(
          contentRef.current,
          {
            opacity: 0,
            y: 25,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.35"
        )
        .fromTo(
          buttonRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="flex min-h-screen items-center justify-center bg-white px-4"
    >
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        {/* Success Icon */}
        <div
          ref={iconRef}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <Check
              className="h-8 w-8 stroke-[3]"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="mt-7">
          <p className="text-sm font-semibold text-emerald-600">
            Payment Successful
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0E1224] sm:text-4xl">
            Thank You!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68708A] sm:text-base">
            Your payment has been successfully completed.
            You&apos;re all set to get started.
          </p>
        </div>

        {/* CTA */}
        <div ref={buttonRef} className="mt-8">
          <Link
            href="/starter"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#5B7FF0] px-7 text-sm font-semibold text-white shadow-lg shadow-[#5B7FF0]/25 transition-all duration-200 hover:bg-[#486EE2] hover:shadow-xl hover:shadow-[#5B7FF0]/30 active:scale-[0.98] sm:text-base"
          >
            <CalendarDays className="h-5 w-5" />

            <span>Book a Meeting</span>

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </main>
  );
}