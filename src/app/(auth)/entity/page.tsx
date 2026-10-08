"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";
import { SetupPackageModal } from "./_components/SetupPackageModal";

const setupOptions = [
  {
    title: "Self-Connect",
    badge: "(Free)",
    description: "Complete setup independently with guided steps.",
    features: [
      "Connect your Email",
      "Connect your Calendar",
      "Connect your CRM",
      "Connect your Business Workflows",
      "Step-by-Step Guided Setup",
    ],
    note: "You can complete everything yourself",
    action: "I’ll Set It Up Myself",
    href: "/profile",
    buttonClass: "bg-[#5f7ff0] hover:bg-[#526fdb]",
  },
  {
    title: "Done-For-You Integration",
    description: "Complete setup independently with guided steps.",
    features: [
      "Full CRM Migration",
      "Workflow Automation Setup",
      "AI Agent Setup & Configuration",
      "Team Onboarding",
      "Executive Dashboard",
    ],
    note: "Starter and Growth are free - we help Customers with Setup. Only Enterprise is Paid for $197",
    action: "Book Integration Call",
    href: undefined,
    buttonClass: "bg-[#d148c4] hover:bg-[#bb3caf]",
  },
];

export default function EntityPage() {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "left");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-[1280px] overflow-hidden rounded-[14px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-[1.735fr_1fr]">
        <div ref={formPanelRef} className="min-h-[536px] px-4 py-7">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#111526] transition hover:text-[#5f7ff0]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          <div className="mx-auto mt-7 max-w-[675px]">
            <header className="text-center">
              <h1 className="text-[30px] font-bold leading-tight text-[#111526] sm:text-[34px]">
                Setup Options
              </h1>
              <p className="mx-auto mt-3 max-w-[570px]  leading-5 text-[#6B6B6B] text-base">
                Choose the path that fits how you prefer to work. Both options deliver the same
                fully configured system.
              </p>
            </header>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {setupOptions.map((option) => (
                <article
                  key={option.title}
                  className="flex min-h-[284px] flex-col rounded-[12px] border border-[#dfe1e7] bg-white p-3.5"
                >
                  <h2 className="text-base font-semibold text-[#202437]">
                    {option.title}{" "}
                    {option.badge && (
                      <span className="font-normal text-[#5f7ff0]">{option.badge}</span>
                    )}
                  </h2>
                  <p className="mt-2 border-y border-[#e2e3e8] py-2.5 text-[12px] font-medium leading-4 text-[#252a3b]">
                    {option.description}
                  </p>

                  <ul className="flex-1 space-y-1 py-4">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-sm text-[#24293b]">
                        <Check
                          aria-hidden="true"
                          strokeWidth={2.5}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5f7ff0]"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="flex min-h-[42px] items-center justify-center border-t border-[#e2e3e8] px-2 py-2 text-center text-[11px] leading-4 text-[#98a2c6]">
                    {option.note}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (option.href) {
                        router.push(option.href);
                      } else {
                        setPackageModalOpen(true);
                      }
                    }}
                    className={`mt-2 h-10 w-full rounded-[8px] px-3 text-[14px]! font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2 ${option.buttonClass}`}
                  >
                    {option.action}
                  </button>
                </article>
              ))}
            </div>

            <footer className="mt-7 border-t border-[#eeeff2] pt-4 text-center text-xs leading-6 text-[#747780]">
              <p>Both paths lead to the same fully configured system.</p>
              <p>Choose the style that fits how you prefer to work.</p>
            </footer>
          </div>
        </div>

        <div
          ref={imagePanelRef}
          className="relative hidden min-h-[536px] overflow-hidden bg-[#6080f2] md:block"
        >
          <Image
            src="/entity.png"
            alt="Noltra AI product benefits"
            fill
            priority
            sizes="(min-width: 990px) 362px, 37vw"
            className="object-cover"
          />
        </div>
      </section>

      <SetupPackageModal
        open={packageModalOpen}
        onOpenChange={setPackageModalOpen}
        selectedPackageId={selectedPackageId}
        onSelect={setSelectedPackageId}
      />
    </main>
  );
}
