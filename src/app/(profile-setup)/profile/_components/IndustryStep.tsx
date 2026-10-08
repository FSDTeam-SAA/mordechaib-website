import { BriefcaseBusiness, Building2, GraduationCap, HeartPulse, Landmark, Scale, ShoppingBag, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepLayout } from "./StepLayout";

const choices: Array<[string, string, LucideIcon]> = [["Real Estate", "REAL_ESTATE", Building2], ["Technology", "TECHNOLOGY", BriefcaseBusiness], ["Healthcare", "HEALTHCARE", HeartPulse], ["Finance", "FINANCE", Landmark], ["Legal", "LEGAL", Scale], ["Retail", "RETAIL", ShoppingBag], ["Construction", "CONSTRUCTION", Wrench], ["Consulting", "CONSULTING", BriefcaseBusiness], ["Education", "EDUCATION", GraduationCap], ["Other", "OTHER", Sparkles]];
export function IndustryStep({ value, onChange, onBack, onNext }: { value: string; onChange: (value: string) => void; onBack: () => void; onNext: () => void }) {
  return <StepLayout title="What's your industry?" description="We'll train your AI agents with industry-specific knowledge.">
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Industry">{choices.map(([label, apiValue, Icon]) => <button type="button" role="radio" aria-checked={value === apiValue} onClick={() => onChange(apiValue)} className={cn("flex h-11 items-center gap-3 rounded-[12px] border px-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d7df3]", value === apiValue ? "border-[#6f8df3] bg-[#dfe7ff] text-[#4c70ea]" : "border-transparent bg-[#f4f6fd] text-[#222738] hover:border-[#cbd5f8]")} key={apiValue}><Icon className="size-4" />{label}</button>)}</div>
    <div className="mt-8 flex gap-2"><Button type="button" variant="outline" onClick={onBack} className="h-11 w-24 rounded-[12px] border-[#1c2538]">Back</Button><Button type="button" onClick={onNext} disabled={!value} className="h-11 flex-1 rounded-[12px] bg-[#5b7ced] text-white hover:bg-[#496be0]">Continue</Button></div>
  </StepLayout>;
}
