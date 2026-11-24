"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ChevronDown, LoaderCircle, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type AddCustomerModalProps = { onCreated: () => void };
type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "HOT_LEAD" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";
type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  location: string;
  website: string;
  linkedinUrl: string;
  leadStatus: LeadStatus;
  notes: string;
};

const initialForm: FormState = {
  name: "", email: "", phone: "", company: "", jobTitle: "",
  location: "", website: "", linkedinUrl: "", leadStatus: "NEW", notes: "",
};

const leadStatuses: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "HOT_LEAD", label: "Hot Lead" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

export function AddCustomerModal({ onCreated }: AddCustomerModalProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const reset = () => {
    setForm(initialForm);
    setTags([]);
    setTagInput("");
    setAvatar(null);
    setAvatarPreview("");
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const addTag = (value: string) => {
    const tag = value.trim().replace(/^,+|,+$/g, "");
    if (!tag) return;
    setTags((current) => current.some((item) => item.toLowerCase() === tag.toLowerCase()) ? current : [...current, tag]);
    setTagInput("");
  };

  const selectAvatar = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Avatar must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
    setAvatar(file);
    setError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) return setError("Your session is missing. Please sign in again.");

    const optionalFields = Object.fromEntries(
      Object.entries(form)
        .filter(([key, value]) => key !== "name" && key !== "leadStatus" && value.trim())
        .map(([key, value]) => [key, value.trim()]),
    );

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          ...optionalFields,
          leadStatus: form.leadStatus,
          tags,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
        data?: { id?: string };
      };
      if (!response.ok || result.success === false) {
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(message || "Unable to add customer.");
      }

      if (avatar && result.data?.id) {
        const avatarBody = new FormData();
        avatarBody.append("avatar", avatar);
        const avatarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts/${encodeURIComponent(result.data.id)}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: avatarBody,
          },
        );
        if (!avatarResponse.ok) {
          toast.warning("Customer was added, but the profile image could not be uploaded.");
        }
      }
      setOpen(false);
      reset();
      toast.success("Customer added successfully.");
      onCreated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "h-[38px] w-full rounded-[9px] border border-transparent bg-[#F4F6FD] px-3 text-[13px] text-[#27304A] outline-none transition placeholder:text-[#9AA6C8] focus:border-[#7C98F5] focus:bg-white focus:ring-2 focus:ring-[#5B7FF0]/10 disabled:opacity-60";
  const labelClass = "mb-1 block text-xs font-medium text-[#8390B5]";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#5B7FF0] px-3.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(91,127,240,0.22)] transition hover:bg-[#4E6FDE]">
        <UserPlus className="size-[18px]" /> Add Customer
      </button>
      <DialogContent
        overlayClassName="bg-[#17203A]/30 backdrop-blur-[5px]"
        className="max-h-[calc(100dvh-28px)] w-[calc(100%-28px)] max-w-[664px] gap-0 overflow-y-auto !rounded-[14px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.2)]"
      >
        <header className="border-b border-[#EDF0F8] px-[18px] py-3.5 pr-12">
          <DialogTitle className="text-[15px] font-semibold text-[#20263A]">Add New Contact</DialogTitle>
          <DialogDescription className="sr-only">Create a new customer contact.</DialogDescription>
        </header>

        <form onSubmit={submit} className="p-[18px]">
          <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Full Name</span>
              <input required maxLength={200} value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Sarah Mitchell" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Email Address</span>
              <input type="email" maxLength={320} value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="sarah@gmail.com" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Phone Number</span>
              <input type="tel" maxLength={32} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+880 1812 345678" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Company Name</span>
              <input maxLength={200} value={form.company} onChange={(e) => updateField("company", e.target.value)} placeholder="Acme Ltd." disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Job Title</span>
              <input maxLength={200} value={form.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder="Operations Director" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Location</span>
              <input maxLength={300} value={form.location} onChange={(e) => updateField("location", e.target.value)} placeholder="New York, USA" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Lead Status</span>
              <span className="relative block">
                <select value={form.leadStatus} onChange={(e) => updateField("leadStatus", e.target.value)} disabled={isSubmitting} className={`${fieldClass} appearance-none pr-8`}>
                  {leadStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8CA0D2]" />
              </span>
            </label>
            <label>
              <span className={labelClass}>LinkedIn</span>
              <input type="url" maxLength={500} value={form.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/example" disabled={isSubmitting} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>Website</span>
              <input type="url" maxLength={500} value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://example.com" disabled={isSubmitting} className={fieldClass} />
            </label>
            <div className="sm:col-span-2">
              <span className={labelClass}>Profile Image</span>
              <div className="flex items-center gap-3 rounded-[9px] bg-[#F4F6FD] p-2.5">
                <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5EBFF] text-sm font-semibold text-[#5B7FF0]">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Selected profile" fill unoptimized className="object-cover" />
                  ) : (
                    form.name.trim().charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#3C4664]">{avatar?.name || "Choose a profile image"}</p>
                  <p className="mt-0.5 text-[10px] text-[#929EBC]">JPEG, PNG or WebP · Max 5 MB</p>
                </div>
                {avatar ? (
                  <button type="button" onClick={() => { setAvatar(null); setAvatarPreview(""); }} disabled={isSubmitting} className="inline-flex h-8 items-center gap-1 rounded-md border border-[#D8E0F5] bg-white px-2.5 text-[11px] font-medium text-[#657399] hover:text-[#D24B5C]">
                    <X className="size-3.5" /> Remove
                  </button>
                ) : (
                  <label className="inline-flex h-8 cursor-pointer items-center rounded-md bg-white px-2.5 text-[11px] font-medium text-[#5675DB] shadow-sm ring-1 ring-[#D8E0F5] hover:bg-[#F9FAFF]">
                    Browse
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={isSubmitting} onChange={(e) => { selectAvatar(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
                  </label>
                )}
              </div>
            </div>
            <label className="sm:col-span-2">
              <span className={labelClass}>Tags</span>
              <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-[9px] border border-transparent bg-[#F4F6FD] px-2.5 py-1.5 focus-within:border-[#7C98F5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5B7FF0]/10">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[#E5EBFF] px-2 py-1 text-[11px] font-medium text-[#5675DB]">
                    {tag}<button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))} aria-label={`Remove ${tag} tag`}><X className="size-3" /></button>
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} onBlur={() => addTag(tagInput)} placeholder={tags.length ? "Add another tag" : "Type a tag and press Enter"} disabled={isSubmitting} className="h-6 min-w-40 flex-1 bg-transparent px-1 text-[13px] text-[#27304A] outline-none placeholder:text-[#9AA6C8]" />
              </div>
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Notes</span>
              <textarea
                maxLength={5000}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                placeholder="Write notes"
                disabled={isSubmitting}
                rows={3}
                className={`${fieldClass} h-auto min-h-[76px] resize-none overflow-hidden py-2.5`}
              />
            </label>
          </div>

          {error && <p role="alert" className="mt-2.5 text-xs text-[#C24152]">{error}</p>}
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="h-[39px] rounded-[7px] border border-[#5B7FF0] text-xs font-medium text-[#5276EA] transition hover:bg-[#F5F7FF] disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex h-[39px] items-center justify-center gap-2 rounded-[7px] bg-[#5B7FF0] text-xs font-medium text-white transition hover:bg-[#4E6FDE] disabled:opacity-60">
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {isSubmitting ? "Adding..." : "Add Contact"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
