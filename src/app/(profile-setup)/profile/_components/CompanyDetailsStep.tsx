import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepLayout } from "./StepLayout";
import type { ProfileFormData } from "./types";

type Props = { data: ProfileFormData; onChange: (data: Partial<ProfileFormData>) => void; onNext: () => void };
const fields = [
  ["companyName", "Company Name", "Enter full name...", "text", true], ["website", "Website (optional)", "https://yourcompany.com", "url", false],
  ["phoneNumber", "Phone Number", "+012 3456 7891", "tel", true], ["businessHoursStart", "Business hours start", "", "time", true],
  ["businessHoursEnd", "Business hours end", "", "time", true],
] as const;
const addressFields = [["city", "City", "Washington DC"], ["street", "Street", "82/1 road"], ["state", "State", "Washington DC"], ["postalCode", "Postal code", "1234"]] as const;

export function CompanyDetailsStep({ data, onChange, onNext }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onNext(); };
  const renderInput = (key: keyof ProfileFormData, label: string, placeholder: string, type = "text", required = true) => (
    <label className="space-y-1.5 text-base font-normal text-[#8B93B8]" key={key}>
      <span>{label}</span>
      <Input type={type} value={data[key]} onChange={(event) => onChange({ [key]: event.target.value })} placeholder={placeholder} required={required} className="h-10 rounded-[12px] border-0 bg-[#f4f6fd] text-sm shadow-none placeholder:text-[#a4aecb] focus-visible:ring-[#5d7df3]" />
    </label>
  );
  return (
    <StepLayout title="Set Up Your Business Profile" description="Your AI agents will represent this business.">
      <form onSubmit={submit}>
        <fieldset><legend className="mb-3 text-sm font-medium text-[#4268ed]">Company Details</legend><div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">{fields.map(([key, label, placeholder, type, required]) => renderInput(key, label, placeholder, type, required))}</div></fieldset>
        <fieldset className="mt-5"><legend className="mb-3 text-sm font-medium text-[#4268ed]">Service Address</legend><div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">{addressFields.map(([key, label, placeholder]) => renderInput(key, label, placeholder))}</div></fieldset>
        <Button type="submit" className="mt-5 h-11 w-full rounded-[12px] bg-[#5b7ced] text-white hover:bg-[#496be0]">Next</Button>
      </form>
    </StepLayout>
  );
}
