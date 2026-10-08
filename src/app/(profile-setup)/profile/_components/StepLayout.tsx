import Image from "next/image";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function StepLayout({ title, description, children, showLogo = true, headerIcon }: { title: string; description: string; children: ReactNode; showLogo?: boolean; headerIcon?: ReactNode }) {
  return (
    <Card className="rounded-[12px] border-[#e4e7ef] bg-white px-5 py-8 shadow-[0_2px_10px_rgba(24,31,56,0.08)] sm:px-9 sm:py-10 lg:px-12">
      <header className="text-center">
        {showLogo && <Image src="/logo.png" alt="Noltra.ai" width={78} height={78} className="mx-auto mb-2 size-[72px] object-contain sm:size-[78px]" priority />}
        {headerIcon}
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-[#303447] sm:text-base">{description}</p>
      </header>
      <div className="mt-8 sm:mt-9">{children}</div>
    </Card>
  );
}
