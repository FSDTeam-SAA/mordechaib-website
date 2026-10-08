"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";
import BookingCalendar from "./_components/BookingCalendar";

export default function StarterPage() {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "right");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <section className="grid w-full max-w-[1180px] overflow-hidden rounded-[14px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-[1.1fr_1fr]">
        <div ref={formPanelRef} className="flex min-h-[620px] flex-col px-4 py-6 sm:px-7 md:px-8 lg:px-10">
          <button type="button" onClick={() => router.back()} className="inline-flex w-fit items-center gap-2 text-xs font-medium text-[#111526] transition-colors hover:text-[#5f7ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>

          <div className="mx-auto mt-5 flex w-full max-w-[550px] flex-1 flex-col sm:mt-7">
            <header className="text-center">
              <h1 className="text-[25px] font-bold leading-tight text-[#111526] sm:text-[30px]">AI Business Launch Package</h1>
              <p className="mt-2 text-[13px] leading-5 text-[#737783] sm:text-sm">Launch your entire AI workforce in 48 hours - done for you.</p>
            </header>

            <BookingCalendar
              onNext={(date) => router.push(`/starter-dateslot?date=${date}`)}
            />
          </div>
        </div>

        <div ref={imagePanelRef} className="relative min-h-[500px] overflow-hidden bg-[#6080f2] md:min-h-[620px]">
          <Image src="/auth.png" alt="Noltra AI product benefits" fill priority sizes="(min-width: 1180px) 562px, (min-width: 768px) 48vw, 100vw" className="object-cover object-center" />
        </div>
      </section>
    </main>
  );
}
