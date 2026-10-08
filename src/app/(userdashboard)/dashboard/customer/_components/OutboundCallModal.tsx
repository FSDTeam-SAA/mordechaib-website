"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; customerName?: string; initialClientPhone?: string };
type IntegrationResponse = { success?: boolean; message?: string; data?: { items?: Array<{ provider?: string; connected?: boolean; status?: string; configuration?: { forwardingNumber?: string } | null }> } };
type CallResponse = { success?: boolean; message?: string };

export function OutboundCallModal({ open, onOpenChange, customerName, initialClientPhone = "" }: Props) {
  const { data: session } = useSession();
  const [clientPhone, setClientPhone] = useState(initialClientPhone);
  const [agentPhone, setAgentPhone] = useState("");
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setClientPhone(initialClientPhone);
    const token = session?.user.accessToken;
    if (!token) { setError("Your session is missing. Please sign in again."); return; }
    const controller = new AbortController();
    const loadAgentPhone = async () => {
      setIsLoadingAgent(true); setError(""); setAgentPhone("");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/integrations`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal });
        const result = (await response.json().catch(() => ({}))) as IntegrationResponse;
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to load Twilio configuration.");
        const twilio = result.data?.items?.find((item) => item.provider?.toUpperCase() === "TWILIO" && (item.connected || item.status?.toUpperCase() === "CONNECTED"));
        const forwardingNumber = twilio?.configuration?.forwardingNumber;
        if (!forwardingNumber) throw new Error("No Twilio forwarding number is configured.");
        setAgentPhone(forwardingNumber);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load Twilio configuration.");
      } finally { if (!controller.signal.aborted) setIsLoadingAgent(false); }
    };
    void loadAgentPhone(); return () => controller.abort();
  }, [initialClientPhone, open, session?.user.accessToken]);

  const startCall = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!clientPhone.trim() || !agentPhone || isCalling) return;
    const token = session?.user.accessToken; if (!token) { setError("Your session is missing. Please sign in again."); return; }
    setIsCalling(true); setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calls/outbound`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ clientPhone: clientPhone.trim(), agentPhone }) });
      const result = (await response.json().catch(() => ({}))) as CallResponse;
      if (!response.ok || result.success === false) throw new Error(result.message || "Unable to start the call.");
      toast.success("Outbound call started successfully."); onOpenChange(false);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to start the call."); }
    finally { setIsCalling(false); }
  };

  return <Dialog open={open} onOpenChange={(next) => !isCalling && onOpenChange(next)}><DialogContent overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]" className="w-[calc(100%-24px)] max-w-[410px] gap-0 !rounded-[16px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)]"><form onSubmit={startCall} className="p-5 sm:p-6"><span className="flex size-11 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]"><PhoneCall className="size-5" /></span><DialogTitle className="mt-4 text-xl font-semibold text-[#0E1224]">Call {customerName || "Customer"}</DialogTitle><DialogDescription className="mt-1.5 text-sm leading-5 text-[#8B93B8]">Start an outbound call using your connected Twilio number.</DialogDescription>
    <label className="mt-5 grid gap-1.5"><span className="text-sm font-medium text-[#343A52]">Client phone</span><input type="tel" required autoFocus value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} disabled={isCalling} placeholder="+8801812345678" className="h-11 rounded-[10px] border border-[#DCE1EA] px-3 text-sm text-[#252A40] outline-none focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/15" /></label>
    <div className="mt-3 rounded-[10px] bg-[#F5F7FF] px-3 py-2.5"><p className="text-xs text-[#8B93B8]">Agent forwarding number</p><p className="mt-1 text-sm font-medium text-[#343A52]">{isLoadingAgent ? "Loading..." : agentPhone || "Not available"}</p></div>
    {error && <p role="alert" className="mt-3 text-sm text-[#C24152]">{error}</p>}
    <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => onOpenChange(false)} disabled={isCalling} className="h-11 rounded-lg border border-[#DCE1EA] text-sm font-medium text-[#596079]">Cancel</button><button type="submit" disabled={isCalling || isLoadingAgent || !agentPhone || !clientPhone.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-4 text-sm font-medium text-white transition hover:bg-[#0E9F72] disabled:cursor-not-allowed disabled:opacity-60">{isCalling ? <LoaderCircle className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}{isCalling ? "Calling..." : "Start Call"}</button></div>
  </form></DialogContent></Dialog>;
}
