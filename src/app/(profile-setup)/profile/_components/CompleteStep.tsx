import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepLayout } from "./StepLayout";

export function CompleteStep({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const successIcon = <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-[#12b886] bg-white"><span className="flex size-10 items-center justify-center rounded-full bg-[#12b886] text-white"><Check className="size-6" /></span></div>;
  return <StepLayout title="You're All Set" description="Your AI workforce is ready. Let's start with your first voice note." showLogo={false} headerIcon={successIcon}>
    <div className="flex gap-2"><Button type="button" variant="outline" onClick={onBack} className="h-11 w-24 rounded-[12px] border-[#1c2538]">Back</Button><Button type="button" onClick={onComplete} className="h-11 flex-1 rounded-[12px] bg-[#5b7ced] text-white hover:bg-[#496be0]">Continue To Dashboard</Button></div>
  </StepLayout>;
}
