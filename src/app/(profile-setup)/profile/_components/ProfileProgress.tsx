import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  ["Company Details", "Tell us about your business"],
  ["Your Industry", "Help us tailor your agents"],
  ["Business Size", "We'll tailor your workspace"],
  ["You're all set!", "Welcome to Noltra"],
];

export function ProfileProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="pb-2" aria-label={`Step ${currentStep} of 4`}>
      <ol className="mx-auto flex max-w-4xl items-start">
        {steps.map(([title, description], index) => {
          const number = index + 1;
          const complete = number < currentStep;
          const active = number === currentStep;
          return (
            <li className="relative flex flex-1 flex-col items-center" key={title}>
              {index > 0 && <span className={cn("absolute right-1/2 top-3 h-px w-full", number <= currentStep ? "bg-[#12b886]" : "bg-[#9ca3b5]")} />}
              <span aria-current={active ? "step" : undefined} className={cn("relative z-10 flex size-7 items-center justify-center rounded-full border bg-white text-xs font-medium", complete && "border-[#12b886] bg-[#12b886] text-white", active && "border-[#5d7df3] text-[#4268ed]", !complete && !active && "border-[#7f8799]")}>
                {complete ? <Check className="size-4" strokeWidth={2.5} /> : number}
              </span>
              <span className={cn("mt-3 px-1 text-center text-[9px] font-medium sm:text-sm", complete && "text-[#06a979]", active && "text-[#4268ed]")}>{title}</span>
              <span className={cn("mt-1 hidden text-center text-[12px] text-[#9aa3bd] sm:block", complete && "text-[#19b68a]", active && "text-[#8197e9]")}>{description}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
