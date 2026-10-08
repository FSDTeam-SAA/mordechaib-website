"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "./CustomerTable";

type Props = { customerId: string | null; open: boolean; onOpenChange: (open: boolean) => void; onUpdated: () => void };
type FormState = { name: string; email: string; phone: string; company: string; jobTitle: string; notes: string };
type ApiResponse = { success?: boolean; message?: string; data?: Customer };
const emptyForm: FormState = { name: "", email: "", phone: "", company: "", jobTitle: "", notes: "" };
const inputClass = "h-11 w-full rounded-[10px] border border-[#DCE1EA] bg-white px-3 text-sm text-[#252A40] outline-none transition placeholder:text-[#A0A7B9] focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/15 disabled:bg-[#F7F8FB]";

export function EditCustomerModal({ customerId, open, onOpenChange, onUpdated }: Props) {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const addTag = (value: string) => { const tag = value.trim().replace(/^,+|,+$/g, ""); if (!tag) return; setTags((current) => current.some((item) => item.toLowerCase() === tag.toLowerCase()) ? current : [...current, tag]); setTagInput(""); };

  useEffect(() => {
    if (!open || !customerId) return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) { setError("Your session is missing. Please sign in again."); return; }
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true); setError("");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(customerId)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: controller.signal });
        const result = (await response.json().catch(() => ({}))) as ApiResponse;
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load customer.");
        const customer = result.data;
        setForm({ name: customer.name ?? "", email: customer.email ?? "", phone: customer.phone ?? "", company: customer.company ?? "", jobTitle: customer.jobTitle ?? "", notes: customer.notes ?? "" });
        setTags(customer.tags ?? []);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load customer.");
      } finally { if (!controller.signal.aborted) setIsLoading(false); }
    };
    void load(); return () => controller.abort();
  }, [customerId, open, session?.user.accessToken]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!customerId || isSaving) return;
    const accessToken = session?.user.accessToken; if (!accessToken) { setError("Your session is missing. Please sign in again."); return; }
    setIsSaving(true); setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(customerId)}`, { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim(), jobTitle: form.jobTitle.trim(), notes: form.notes.trim(), tags }) });
      const result = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok || result.success === false) throw new Error(result.message || "Unable to update customer.");
      toast.success("Customer updated successfully."); onOpenChange(false); onUpdated();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update customer."); }
    finally { setIsSaving(false); }
  };

  return <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}><DialogContent overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]" className="max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[620px] gap-0 overflow-y-auto !rounded-[16px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)]"><header className="border-b border-[#E4EAF8] px-5 py-5 pr-14 sm:px-6"><DialogTitle className="text-xl font-semibold text-[#0E1224]">Edit Customer</DialogTitle><DialogDescription className="mt-1 text-sm text-[#8B93B8]">Update this customer&apos;s contact information.</DialogDescription></header>
    {isLoading ? <div className="space-y-4 p-6">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-11 w-full bg-[#F5F7FF]" />)}</div> : <form onSubmit={submit} className="p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" required><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></Field><Field label="Email" required><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} /></Field><Field label="Phone" required><input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></Field><Field label="Company"><input value={form.company} onChange={(e) => update("company", e.target.value)} className={inputClass} /></Field><Field label="Job title" wide><input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} className={inputClass} /></Field>
      <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-medium text-[#343A52]">Tags</span><div className="flex min-h-11 flex-wrap items-center gap-2 rounded-[10px] border border-[#DCE1EA] px-2.5 py-2 focus-within:border-[#5B7FF0] focus-within:ring-2 focus-within:ring-[#5B7FF0]/15">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#5B7FF0]/10 py-1 pl-2.5 pr-1.5 text-xs text-[#5B7FF0]">{tag}<button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))} aria-label={`Remove ${tag}`}><X className="size-3" /></button></span>)}<input value={tagInput} onChange={(e) => e.target.value.includes(",") ? e.target.value.split(",").forEach(addTag) : setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} onBlur={() => addTag(tagInput)} placeholder="Add tag" className="h-6 min-w-[120px] flex-1 outline-none" /></div></label>
      <Field label="Notes" wide><textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className={`${inputClass} h-auto resize-none py-3`} /></Field>
    </div>{error && <p className="mt-4 text-sm text-[#C24152]">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4EAF8] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => onOpenChange(false)} disabled={isSaving} className="h-11 rounded-lg border border-[#DCE1EA] px-5 text-sm font-medium text-[#596079]">Cancel</button><button type="submit" disabled={isSaving || isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5B7FF0] px-5 text-sm font-medium text-white disabled:opacity-60">{isSaving && <LoaderCircle className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Changes"}</button></div></form>}
  </DialogContent></Dialog>;
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) { return <label className={`grid gap-1.5 ${wide ? "sm:col-span-2" : ""}`}><span className="text-sm font-medium text-[#343A52]">{label}{required && <span className="text-[#EF4444]"> *</span>}</span>{children}</label>; }
