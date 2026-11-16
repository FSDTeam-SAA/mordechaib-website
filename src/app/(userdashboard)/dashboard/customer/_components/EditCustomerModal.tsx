"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ChevronDown, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "./CustomerTable";

type Props = { customerId: string | null; open: boolean; onOpenChange: (open: boolean) => void; onUpdated: () => void };
type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "HOT_LEAD" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";
type FormState = { name: string; email: string; phone: string; company: string; jobTitle: string; location: string; website: string; linkedinUrl: string; leadStatus: LeadStatus; notes: string };
type ApiResponse = { success?: boolean; message?: string | string[]; data?: Customer };

const emptyForm: FormState = { name: "", email: "", phone: "", company: "", jobTitle: "", location: "", website: "", linkedinUrl: "", leadStatus: "NEW", notes: "" };
const leadStatuses: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" }, { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" }, { value: "PROPOSAL", label: "Proposal" },
  { value: "HOT_LEAD", label: "Hot Lead" }, { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed Won" }, { value: "CLOSED_LOST", label: "Closed Lost" },
];
const messageOf = (result: ApiResponse, fallback: string) => Array.isArray(result.message) ? result.message.join(", ") : result.message || fallback;

export function EditCustomerModal({ customerId, open, onOpenChange, onUpdated }: Props) {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const addTag = (value: string) => {
    const tag = value.trim().replace(/^,+|,+$/g, "");
    if (!tag) return;
    setTags((current) => current.some((item) => item.toLowerCase() === tag.toLowerCase()) ? current : [...current, tag]);
    setTagInput("");
  };

  const selectAvatar = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Avatar must be a JPEG, PNG, or WebP image.");
    if (file.size > 5 * 1024 * 1024) return setError("Avatar image must be 5 MB or smaller.");
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
    setAvatar(file);
    setError("");
  };

  useEffect(() => {
    if (!open || !customerId) return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) { setError("Your session is missing. Please sign in again."); return; }
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true); setError(""); setAvatar(null); setTagInput("");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(customerId)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: controller.signal });
        const result = (await response.json().catch(() => ({}))) as ApiResponse;
        if (!response.ok || !result.success || !result.data) throw new Error(messageOf(result, "Unable to load customer."));
        const customer = result.data;
        setForm({
          name: customer.name ?? "", email: customer.email ?? "", phone: customer.phone ?? "",
          company: customer.company ?? "", jobTitle: customer.jobTitle ?? "", location: customer.location ?? "",
          website: customer.website ?? "", linkedinUrl: customer.linkedinUrl ?? "",
          leadStatus: (customer.leadStatus as LeadStatus) ?? "NEW", notes: customer.notes ?? "",
        });
        setTags(customer.tags ?? []);
        setAvatarPreview(customer.avatarUrl ?? "");
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load customer.");
      } finally { if (!controller.signal.aborted) setIsLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [customerId, open, session?.user.accessToken]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerId || isSaving) return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) return setError("Your session is missing. Please sign in again.");
    const optionalFields = Object.fromEntries(Object.entries(form).filter(([key, value]) => key !== "name" && key !== "leadStatus" && value.trim()).map(([key, value]) => [key, value.trim()]));
    setIsSaving(true); setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(customerId)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), ...optionalFields, leadStatus: form.leadStatus, tags }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok || result.success === false) throw new Error(messageOf(result, "Unable to update customer."));

      if (avatar) {
        const avatarBody = new FormData();
        avatarBody.append("avatar", avatar);
        const avatarResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(customerId)}`, { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, body: avatarBody });
        if (!avatarResponse.ok) toast.warning("Customer was updated, but the profile image could not be uploaded.");
      }
      toast.success("Customer updated successfully.");
      onOpenChange(false);
      onUpdated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update customer.");
    } finally { setIsSaving(false); }
  };

  const fieldClass = "h-[38px] w-full rounded-[9px] border border-transparent bg-[#F4F6FD] px-3 text-[13px] text-[#27304A] outline-none transition placeholder:text-[#9AA6C8] focus:border-[#7C98F5] focus:bg-white focus:ring-2 focus:ring-[#5B7FF0]/10 disabled:opacity-60";
  const labelClass = "mb-1 block text-xs font-medium text-[#8390B5]";

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent overlayClassName="bg-[#17203A]/30 backdrop-blur-[5px]" className="max-h-[calc(100dvh-28px)] w-[calc(100%-28px)] max-w-[664px] gap-0 overflow-y-auto !rounded-[14px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.2)]">
        <header className="border-b border-[#EDF0F8] px-[18px] py-4 pr-14">
          <DialogTitle className="text-[15px] font-semibold text-[#20263A]">Edit Contact</DialogTitle>
          <DialogDescription className="sr-only">Update this customer contact.</DialogDescription>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 p-[18px]">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-[38px] w-full bg-[#F4F6FD]" />)}</div>
        ) : (
          <form onSubmit={submit} className="p-[18px]">
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
              <Field label="Full Name" wide><input required maxLength={200} value={form.name} onChange={(e) => update("name", e.target.value)} className={fieldClass} /></Field>
              <Field label="Email Address"><input type="email" maxLength={320} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="sarah@gmail.com" className={fieldClass} /></Field>
              <Field label="Phone Number"><input type="tel" maxLength={32} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+880 1812 345678" className={fieldClass} /></Field>
              <Field label="Company Name"><input maxLength={200} value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Ltd." className={fieldClass} /></Field>
              <Field label="Job Title"><input maxLength={200} value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="Operations Director" className={fieldClass} /></Field>
              <Field label="Location"><input maxLength={300} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="New York, USA" className={fieldClass} /></Field>
              <Field label="Lead Status"><span className="relative block"><select value={form.leadStatus} onChange={(e) => update("leadStatus", e.target.value)} className={`${fieldClass} appearance-none pr-9`}>{leadStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8CA0D2]" /></span></Field>
              <Field label="LinkedIn"><input type="url" maxLength={500} value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/example" className={fieldClass} /></Field>
              <Field label="Website"><input type="url" maxLength={500} value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://example.com" className={fieldClass} /></Field>

              <div className="sm:col-span-2"><span className={labelClass}>Profile Image</span><div className="flex items-center gap-3 rounded-[9px] bg-[#F4F6FD] p-2.5">
                <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5EBFF] text-sm font-semibold text-[#5B7FF0]">{avatarPreview ? <Image src={avatarPreview} alt="Customer profile" fill unoptimized className="object-cover" /> : form.name.trim().charAt(0).toUpperCase() || "?"}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#3C4664]">{avatar?.name || (avatarPreview ? "Current profile image" : "Choose a profile image")}</p><p className="mt-0.5 text-[10px] text-[#929EBC]">JPEG, PNG or WebP · Max 5 MB</p></div>
                {avatar ? <button type="button" onClick={() => { setAvatar(null); setAvatarPreview(""); }} className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D8E0F5] bg-white px-2.5 text-[11px] text-[#657399]"><X className="size-3.5" /> Remove</button> : <label className="inline-flex h-8 cursor-pointer items-center rounded-md bg-white px-3 text-[11px] font-medium text-[#5675DB] shadow-sm ring-1 ring-[#D8E0F5]">Browse<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { selectAvatar(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" /></label>}
              </div></div>

              <div className="sm:col-span-2"><span className={labelClass}>Tags</span><div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-[9px] bg-[#F4F6FD] px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#5B7FF0]/10">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[#E5EBFF] px-2 py-1 text-[11px] text-[#5675DB]">{tag}<button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))}><X className="size-3" /></button></span>)}<input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} onBlur={() => addTag(tagInput)} placeholder="Type a tag and press Enter" className="h-6 min-w-40 flex-1 bg-transparent px-1 text-[13px] outline-none" /></div></div>
              <Field label="Notes" wide><textarea maxLength={5000} value={form.notes} onChange={(e) => update("notes", e.target.value)} onInput={(e) => { e.currentTarget.style.height = "auto"; e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; }} rows={3} placeholder="Write notes" className={`${fieldClass} h-auto min-h-[76px] resize-none overflow-hidden py-2.5`} /></Field>
            </div>
            {error && <p role="alert" className="mt-3 text-xs text-[#C24152]">{error}</p>}
            <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => onOpenChange(false)} disabled={isSaving} className="h-[39px] rounded-[7px] border border-[#5B7FF0] text-xs font-medium text-[#5276EA]">Cancel</button><button type="submit" disabled={isSaving || isLoading} className="inline-flex h-[39px] items-center justify-center gap-2 rounded-[7px] bg-[#5B7FF0] text-xs font-medium text-white disabled:opacity-60">{isSaving && <LoaderCircle className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Changes"}</button></div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-medium text-[#8390B5]">{label}</span>{children}</label>;
}
