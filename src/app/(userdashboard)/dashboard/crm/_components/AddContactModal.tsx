"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AddContactModalProps = { children: ReactNode };
const inputClassName =
  "h-[44px] border-0 bg-[#F5F7FF] px-4 text-base text-[#0E1224] shadow-none placeholder:text-[#8B93B8] focus-visible:ring-1 focus-visible:ring-[#5B7FF0] md:text-base";
const selectClassName =
  "h-[49px] border-0 bg-[#F5F7FF] px-4 text-base text-[#8B93B8] shadow-none focus:ring-1 focus:ring-[#5B7FF0]";

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-base leading-[19px] text-[#8B93B8]">
      {label}
      {children}
    </label>
  );
}

function ContactSelect({
  name,
  placeholder,
  options,
}: {
  name: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select name={name} defaultValue={placeholder}>
      <SelectTrigger className={selectClassName} aria-label={name}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-lg border-0 bg-white p-0 shadow-[0_8px_24px_rgba(14,18,36,0.14)]">
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="rounded-md px-2 py-2 text-base text-[#6B6B6B] focus:bg-[#5B7FF0] focus:text-white data-[state=checked]:bg-[#5B7FF0] data-[state=checked]:text-white [&>span:first-child]:hidden"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AddContactModal({ children }: AddContactModalProps) {
  const [open, setOpen] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        overlayClassName="bg-black/10 backdrop-blur-[5px]"
        className="flex  max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[902px] flex-col gap-4 overflow-hidden !rounded-[24px] border-0 bg-white p-4 shadow-[0_24px_80px_rgba(14,18,36,0.18)] [&>button]:right-4 [&>button]:top-4 [&>button]:text-[#7080B5] [&>button_svg]:size-5 sm:p-6 sm:[&>button]:right-6 sm:[&>button]:top-6"
      >
        <div className="shrink-0 border-b border-[#F5F7FF] pb-4 pr-10">
          <DialogTitle className="text-left text-xl font-medium leading-[26px] text-[#0E1224]">
            Add New Contact
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter the details for the new CRM contact.
          </DialogDescription>
        </div>
        <form
          id="add-contact-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]"
        >
          <div className="grid gap-2">
            <FormField label="Full Name">
              <Input
                name="fullName"
                placeholder="Sarah Mitchell"
                required
                className={inputClassName}
              />
            </FormField>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <FormField label="Email Address">
                <Input
                  name="email"
                  type="email"
                  placeholder="sarah@gmail.com"
                  required
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Phone Number">
                <Input
                  name="phone"
                  type="tel"
                  placeholder="sarah@gmail.com"
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
              <FormField label="Company name">
                <Input
                  name="company"
                  placeholder="seme inc."
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Job Title">
                <Input
                  name="jobTitle"
                  placeholder="Executive"
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Location">
                <Input
                  name="location"
                  placeholder="Washington dc"
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <FormField label="Lead Status">
                <ContactSelect
                  name="leadStatus"
                  placeholder="New"
                  options={[
                    "New",
                    "Contacted",
                    "Qualified",
                    "Proposal",
                    "Hot Lead",
                    "Negotiation",
                    "Closed Won",
                    "Closed Lost",
                  ]}
                />
              </FormField>
              <FormField label="Pipeline Value($)">
                <Input
                  name="pipelineValue"
                  inputMode="decimal"
                  placeholder="$2100"
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <FormField label="LinkedIn">
                <Input
                  name="linkedin"
                  type="url"
                  placeholder="www.linkedin.com"
                  className={inputClassName}
                />
              </FormField>
              <FormField label="Website">
                <Input
                  name="website"
                  type="url"
                  placeholder="www.google.com"
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <FormField label="Preferred communication channel">
                <ContactSelect
                  name="communicationChannel"
                  placeholder="Email"
                  options={["Email", "WhatsApp", "Phone"]}
                />
              </FormField>
              <FormField label="Contact source">
                <ContactSelect
                  name="contactSource"
                  placeholder="Inbound"
                  options={[
                    "Inbound",
                    "Referral",
                    "Outbound",
                    "Ad campaign",
                    "Agent Prospecting ext",
                  ]}
                />
              </FormField>
            </div>
            <FormField label="Notes">
              <textarea
                name="notes"
                placeholder="write notes"
                className="h-[125px] resize-none rounded-xl border-0 bg-[#F5F7FF] p-4 text-base text-[#0E1224] outline-none placeholder:text-[#8B93B8] focus:ring-1 focus:ring-[#5B7FF0]"
              />
            </FormField>
          </div>
        </form>
        <div className="grid shrink-0 gap-3 sm:grid-cols-2 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-[46px] rounded-[12px] border-[#5B7FF0] bg-white text-base font-medium text-[#5B7FF0] shadow-none hover:bg-[#5B7FF0]/5 hover:text-[#5B7FF0] sm:h-[52px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-contact-form"
            className="h-[46px] rounded-[12px] bg-[#5B7FF0] text-base font-medium text-white shadow-none hover:bg-[#4E70DC] sm:h-[52px]"
          >
            Add Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
