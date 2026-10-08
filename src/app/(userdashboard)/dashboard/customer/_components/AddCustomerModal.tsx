"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type AddCustomerModalProps = { onCreated: () => void };
type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  notes: string;
};
type CreateContactResponse = { success?: boolean; message?: string };

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  notes: "",
};

export function AddCustomerModal({ onCreated }: AddCustomerModalProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(initialForm);
      setTags([]);
      setTagInput("");
      setError("");
    }
  };

  const addTag = (value: string) => {
    const tag = value.trim().replace(/^,+|,+$/g, "");
    if (!tag) return;
    setTags((current) =>
      current.some((item) => item.toLowerCase() === tag.toLowerCase())
        ? current
        : [...current, tag],
    );
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setTags((current) => current.filter((item) => item !== tag));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      setError("Your session is missing. Please sign in again.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            company: form.company.trim(),
            jobTitle: form.jobTitle.trim(),
            notes: form.notes.trim(),
            tags,
          }),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as CreateContactResponse;
      if (!response.ok || result.success === false)
        throw new Error(result.message || "Unable to add customer.");
      setOpen(false);
      setForm(initialForm);
      setTags([]);
      setTagInput("");
      toast.success("Customer added successfully.");
      onCreated();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add customer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-[10px] border border-[#DCE1EA] bg-white px-3 text-sm text-[#252A40] outline-none transition placeholder:text-[#A0A7B9] focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/15 disabled:bg-[#F7F8FB]";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#5B7FF0] px-4 text-sm font-medium text-white shadow-[0_4px_12px_rgba(91,127,240,0.22)] transition hover:bg-[#4E6FDE]"
      >
        <UserPlus className="size-[18px]" />
        Add Customer
      </button>
      <DialogContent
        overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
        className="max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[620px] gap-0 overflow-y-auto !rounded-[16px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
      >
        <header className="border-b border-[#E4EAF8] px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="text-xl font-semibold text-[#0E1224]">
            Add Customer
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#8B93B8]">
            Create a new customer contact for your workspace.
          </DialogDescription>
        </header>
        <form onSubmit={submit} className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-[#343A52]">
                Full name <span className="text-[#EF4444]">*</span>
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter your name"
                disabled={isSubmitting}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-[#343A52]">
                Email <span className="text-[#EF4444]">*</span>
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-[#343A52]">
                Phone <span className="text-[#EF4444]">*</span>
              </span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-[#343A52]">
                Company
              </span>
              <input
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="Enter your company name."
                disabled={isSubmitting}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[#343A52]">
                Job title
              </span>
              <input
                value={form.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                placeholder="Enter your job title."
                disabled={isSubmitting}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[#343A52]">Tags</span>
              <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-[10px] border border-[#DCE1EA] bg-white px-2.5 py-2 transition focus-within:border-[#5B7FF0] focus-within:ring-2 focus-within:ring-[#5B7FF0]/15">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF0]/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-[#5B7FF0]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isSubmitting}
                      aria-label={`Remove ${tag} tag`}
                      className="flex size-4 items-center justify-center rounded-full transition hover:bg-[#5B7FF0]/15"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value.includes(",")) {
                      value.split(",").forEach(addTag);
                    } else {
                      setTagInput(value);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addTag(tagInput);
                    } else if (
                      event.key === "Backspace" &&
                      !tagInput &&
                      tags.length
                    ) {
                      removeTag(tags[tags.length - 1]);
                    }
                  }}
                  onBlur={() => addTag(tagInput)}
                  placeholder={
                    tags.length ? "Add another tag" : "Type a tag and press Enter"
                  }
                  disabled={isSubmitting}
                  className="h-6 min-w-[150px] flex-1 border-0 bg-transparent px-1 text-sm text-[#252A40] outline-none placeholder:text-[#A0A7B9]"
                />
              </div>
              <span className="text-xs text-[#8B93B8]">
                Press Enter or comma to add each tag.
              </span>
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[#343A52]">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add helpful notes about this customer..."
                disabled={isSubmitting}
                rows={3}
                className={`${inputClass} h-auto resize-none py-3`}
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-[#C24152]">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4EAF8] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-11 rounded-[10px] border border-[#DCE1EA] px-5 text-sm font-medium text-[#596079] hover:bg-[#F7F8FB] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B7FF0] px-5 text-sm font-medium text-white hover:bg-[#4E6FDE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {isSubmitting ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
