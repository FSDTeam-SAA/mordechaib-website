"use client";

import { Check, PhoneCall, Radio, Settings2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type TwilioIntegrationDetails = {
  provider?: string;
  label?: string;
  connected?: boolean;
  status?: string;
  isDefault?: boolean;
  connectPath?: string;
  account?: {
    id?: string;
    name?: string;
    phoneNumber?: string;
  } | null;
  configuration?: {
    twilioNumber?: string;
    forwardingNumber?: string;
    country?: string;
    numberType?: string;
    numberCapabilities?: Record<string, boolean>;
    enabledFeatures?: Record<string, boolean>;
  } | null;
};

type TwilioDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: TwilioIntegrationDetails | null;
};

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#EEF1F6] py-3 last:border-0">
    <span className="shrink-0 text-sm text-[#8189A3]">{label}</span>
    <span className="min-w-0 break-all text-right text-sm font-medium text-[#252A40]">
      {value || "—"}
    </span>
  </div>
);

const FeaturePill = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${enabled ? "bg-[#EAF9EF] text-[#269A58]" : "bg-[#F1F3F7] text-[#9299AA]"}`}
  >
    {enabled && <Check className="size-3.5" aria-hidden="true" />}
    {label}
  </span>
);

export function TwilioDetailsModal({
  open,
  onOpenChange,
  details,
}: TwilioDetailsModalProps) {
  const configuration = details?.configuration;
  const capabilities = configuration?.numberCapabilities ?? {};
  const features = configuration?.enabledFeatures ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[#0E1224]/45 backdrop-blur-[3px]"
        className="max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[470px] gap-0 overflow-y-auto !rounded-[16px] border-0 bg-[#F8F9FC] p-0 shadow-[0_24px_70px_rgba(21,25,54,0.22)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <header className="rounded-t-[16px] bg-gradient-to-br from-[#6032E8] to-[#7553F3] px-5 py-5 pr-14 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <PhoneCall className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-semibold">Twilio Connection</DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
                <span className="size-2 rounded-full bg-[#65E39A]" />
                {details?.status || "CONNECTED"}
              </DialogDescription>
            </div>
          </div>
        </header>

        <div className="grid gap-3 p-4 sm:p-5">
          <section className="rounded-xl border border-[#E5E9F2] bg-white p-4 shadow-[0_2px_8px_rgba(30,40,80,0.04)]">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#343A52]">
              <Radio className="size-4 text-[#6841EA]" /> Call routing
            </h3>
            <DetailRow label="Twilio number" value={configuration?.twilioNumber} />
            <DetailRow label="Forwarding number" value={configuration?.forwardingNumber} />
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="rounded-lg bg-[#F7F8FC] p-3">
                <p className="text-xs text-[#8A92AA]">Country</p>
                <p className="mt-1 text-sm font-semibold text-[#252A40]">{configuration?.country || "—"}</p>
              </div>
              <div className="rounded-lg bg-[#F7F8FC] p-3">
                <p className="text-xs text-[#8A92AA]">Number type</p>
                <p className="mt-1 text-sm font-semibold text-[#252A40]">{configuration?.numberType || "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E9F2] bg-white p-4 shadow-[0_2px_8px_rgba(30,40,80,0.04)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#343A52]">
              <Settings2 className="size-4 text-[#6841EA]" /> Capabilities & features
            </h3>
            <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[#8A92AA]">Number capabilities</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(capabilities).map(([name, enabled]) => <FeaturePill key={name} label={name.toUpperCase()} enabled={enabled} />)}
            </div>
            <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[#8A92AA]">Enabled features</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(features).map(([name, enabled]) => <FeaturePill key={name} label={name.replace(/([A-Z])/g, " $1")} enabled={enabled} />)}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
