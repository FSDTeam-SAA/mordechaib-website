import { UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepLayout } from "./StepLayout";

const choices = [["Just me (solo founder)", "SOLO"], ["2-10 employees", "TWO_TO_TEN"], ["11-50 employees", "ELEVEN_TO_FIFTY"], ["51-100 employees", "FIFTY_ONE_TO_ONE_HUNDRED"], ["101-500 employees", "ONE_HUNDRED_ONE_TO_FIVE_HUNDRED"], ["500+ employees", "FIVE_HUNDRED_PLUS"]] as const;
export function TeamSizeStep({ value, onChange, onBack, onNext, isSubmitting }: { value: string; onChange: (value: string) => void; onBack: () => void; onNext: () => void; isSubmitting: boolean }) {
  return <StepLayout title="How big is your team?" description="We'll customize your workflow features accordingly.">
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Team size">{choices.map(([label, apiValue], index) => { const Icon = index === 0 ? UserRound : UsersRound; return <button type="button" role="radio" aria-checked={value === apiValue} onClick={() => onChange(apiValue)} className={cn("flex h-11 items-center gap-3 rounded-[12px] border px-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d7df3]", value === apiValue ? "border-[#6f8df3] bg-[#dfe7ff] text-[#4c70ea]" : "border-transparent bg-[#f4f6fd] text-[#8290b4] hover:border-[#cbd5f8]")} key={apiValue}><Icon className="size-4" />{label}</button>; })}</div>
    <div className="mt-8 flex gap-2"><Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-11 w-24 rounded-[12px] border-[#1c2538]">Back</Button><Button type="button" onClick={onNext} disabled={!value || isSubmitting} className="h-11 flex-1 rounded-[12px] bg-[#5b7ced] text-white hover:bg-[#496be0]">{isSubmitting ? "Saving..." : "Continue"}</Button></div>
  </StepLayout>;
}
