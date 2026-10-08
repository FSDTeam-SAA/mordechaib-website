"use client";

import { FormEvent, ReactNode, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fieldClassName =
  "h-[51px] w-full rounded-[12px] border-0 bg-[#F5F7FF] px-4 text-base text-[#0E1224] outline-none placeholder:text-[#8B93B8] focus:ring-1 focus:ring-[#5B7FF0]";
const selectTriggerClassName =
  "h-[51px] cursor-pointer border-0 bg-[#F5F7FF] px-4 text-base font-normal text-[#0E1224] shadow-none focus:ring-1 focus:ring-[#5B7FF0] data-[placeholder]:text-[#8B93B8]";
const selectContentClassName =
  "z-[70] border-[#E4EAF8] bg-white shadow-[0_12px_36px_rgba(14,18,36,0.14)]";
const selectItemClassName = "cursor-pointer";

type MeetingResponse = {
  success?: boolean;
  message?: string | string[];
};

function getResponseMessage(result: MeetingResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-base leading-[1.2] text-[#8B93B8]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function NewMeetingModal({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [sendBot, setSendBot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [inviteeInput, setInviteeInput] = useState("");
  const [timezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );

  const parseEmails = (value: string) =>
    value
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

  const addInvitees = (value: string) => {
    const emails = parseEmails(value);
    if (emails.length === 0) return;

    const invalidEmail = emails.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );
    if (invalidEmail) {
      toast.error(`${invalidEmail} is not a valid email address.`);
      return;
    }

    setInvitees((current) => Array.from(new Set([...current, ...emails])));
    setInviteeInput("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const date = String(formData.get("date") || "");
    const time = String(formData.get("time") || "");
    const localStart = new Date(`${date}T${time}:00`);

    if (Number.isNaN(localStart.getTime())) {
      toast.error("Please select a valid meeting date and time.");
      return;
    }

    const pendingInvitees = parseEmails(inviteeInput);
    const invalidEmail = pendingInvitees.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );
    if (invalidEmail) {
      toast.error(`${invalidEmail} is not a valid email address.`);
      return;
    }
    const allInvitees = Array.from(new Set([...invitees, ...pendingInvitees]));
    if (allInvitees.length === 0) {
      toast.error("Please add at least one invitee email.");
      return;
    }
    const platform = String(formData.get("platform") || "GOOGLE_MEET");

    const payload = {
      platform,
      title: String(formData.get("title") || "").trim(),
      agenda: String(formData.get("agenda") || "").trim(),
      startsAt: localStart.toISOString(),
      durationMinutes: Number(formData.get("durationMinutes")),
      timezone,
      invitees: allInvitees,
      reminderMinutesBeforeStart: Number(
        formData.get("reminderMinutesBeforeStart"),
      ),
      sendBot,
      botName: sendBot
        ? String(formData.get("botName") || "Noltra AI Notetaker").trim()
        : "",
      idempotencyKey: `frontend-request-${crypto.randomUUID()}`,
      metadata: {
        additionalProp1: {},
      },
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/meetings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as MeetingResponse;

      if (!response.ok || result.success === false) {
        throw new Error(
          getResponseMessage(result, "Unable to schedule the meeting."),
        );
      }

      form.reset();
      setInvitees([]);
      setInviteeInput("");
      setSendBot(true);
      setOpen(false);
      toast.success(getResponseMessage(result, "Meeting scheduled successfully."));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to schedule the meeting.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        data-lenis-prevent
        showClose={false}
        overlayClassName="bg-[#0E1224]/30 backdrop-blur-[6px] "
        className="flex max-h-[calc(100dvh-64px)] w-[calc(100%-24px)] max-w-[780px] flex-col gap-0 overflow-hidden !rounded-[12px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.24)] sm:max-h-[760px]"
      >
        <header className="flex shrink-0 items-start justify-between border-b border-[#E4EAF8] bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <DialogTitle className="text-xl font-semibold leading-normal text-[#0E1224] sm:text-2xl">
              Schedule Meeting
            </DialogTitle>
            <p className="mt-1 text-sm text-[#8B93B8]">
              Create a meeting and invite your participants
            </p>
          </div>
          <DialogClose
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F5F7FF] text-[#8B93B8] outline-none transition-colors hover:bg-[#E4EAF8] hover:text-[#0E1224] focus-visible:ring-2 focus-visible:ring-[#5B7FF0]"
            aria-label="Close schedule meeting modal"
          >
            <X className="size-5" />
          </DialogClose>
        </header>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin] sm:px-7 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C4EE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meeting Title*">
                <input
                  required
                  name="title"
                  placeholder="e.g. Weekly project review"
                  className={fieldClassName}
                />
              </Field>
              <Field label={`Invitee emails*${invitees.length ? ` (${invitees.length})` : ""}`}>
                <div className="flex min-h-[51px] w-full flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F5F7FF] px-3 py-2 focus-within:ring-1 focus-within:ring-[#5B7FF0]">
                  {invitees.map((email) => (
                    <span key={email} className="flex max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#44506F] shadow-sm ring-1 ring-[#E4EAF8]">
                      <span className="max-w-[180px] truncate">{email}</span>
                      <button type="button" aria-label={`Remove ${email}`} onClick={() => setInvitees((current) => current.filter((item) => item !== email))} className="flex size-4 shrink-0 items-center justify-center rounded-full text-[#8B93B8] transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444]"><X className="size-3" /></button>
                    </span>
                  ))}
                  <input
                    type="email"
                    value={inviteeInput}
                    onChange={(event) => setInviteeInput(event.target.value)}
                    onBlur={() => addInvitees(inviteeInput)}
                    onPaste={(event) => {
                      const pastedValue = event.clipboardData.getData("text");
                      if (/[\s,;]/.test(pastedValue.trim())) {
                        event.preventDefault();
                        addInvitees(pastedValue);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === "," || event.key === ";") {
                        event.preventDefault();
                        addInvitees(inviteeInput);
                      } else if (event.key === "Backspace" && !inviteeInput && invitees.length) {
                        setInvitees((current) => current.slice(0, -1));
                      }
                    }}
                    placeholder={invitees.length ? "Add another email" : "Type email, then press Enter"}
                    className="h-7 min-w-[190px] flex-1 bg-transparent px-1 text-sm text-[#0E1224] outline-none placeholder:text-[#8B93B8]"
                  />
                </div>
                <span className="mt-1.5 block text-xs text-[#8B93B8]">Press Enter or comma after each email. You can also paste multiple emails.</span>
              </Field>
            </div>
            <Field label="Agenda*">
              <textarea
                required
                name="agenda"
                placeholder="Review progress and agree next steps"
                className={`${fieldClassName} min-h-[92px] resize-none py-3`}
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Date*">
                <input
                  required
                  type="date"
                  name="date"
                  className={fieldClassName}
                />
              </Field>
              <Field label="Time*">
                <input
                  required
                  type="time"
                  name="time"
                  className={fieldClassName}
                />
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Platform">
                <Select name="platform" defaultValue="GOOGLE_MEET">
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    <SelectItem className={selectItemClassName} value="GOOGLE_MEET">Google Meet</SelectItem>
                    <SelectItem className={selectItemClassName} value="ZOOM">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Duration">
                <Select name="durationMinutes" defaultValue="30" required>
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    <SelectItem className={selectItemClassName} value="15">15 minutes</SelectItem>
                    <SelectItem className={selectItemClassName} value="30">30 minutes</SelectItem>
                    <SelectItem className={selectItemClassName} value="45">45 minutes</SelectItem>
                    <SelectItem className={selectItemClassName} value="60">60 minutes</SelectItem>
                    <SelectItem className={selectItemClassName} value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Reminder">
                <Select
                  name="reminderMinutesBeforeStart"
                  defaultValue="15"
                  required
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Select reminder" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClassName}>
                    <SelectItem className={selectItemClassName} value="0">At start time</SelectItem>
                    <SelectItem className={selectItemClassName} value="5">5 minutes before</SelectItem>
                    <SelectItem className={selectItemClassName} value="10">10 minutes before</SelectItem>
                    <SelectItem className={selectItemClassName} value="15">15 minutes before</SelectItem>
                    <SelectItem className={selectItemClassName} value="30">30 minutes before</SelectItem>
                    <SelectItem className={selectItemClassName} value="60">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Device Timezone">
                <input
                  readOnly
                  value={timezone}
                  className={`${fieldClassName} text-[#8B93B8]`}
                />
              </Field>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-[12px] bg-[#F5F7FF] px-4 py-3">
              <span>
                <span className="block text-base text-[#0E1224]">
                  Send AI Notetaker
                </span>
                <span className="mt-1 block text-xs text-[#8B93B8]">
                  Let the AI bot join and take meeting notes
                </span>
              </span>
              <input
                type="checkbox"
                checked={sendBot}
                onChange={(event) => setSendBot(event.target.checked)}
                className="size-5 accent-[#5B7FF0]"
              />
            </label>
            {sendBot && (
              <Field label="Bot Name">
                <input
                  required
                  name="botName"
                  defaultValue="Noltra AI Notetaker"
                  className={fieldClassName}
                />
              </Field>
            )}
          </div>
          <footer className="grid shrink-0 gap-3 border-t border-[#E4EAF8] bg-white px-5 py-4 sm:grid-cols-2 sm:gap-4 sm:px-7">
            <DialogClose
              type="button"
              className="h-[52px] rounded-[8px] border border-[#5B7FF0] text-base font-medium text-[#5B7FF0] transition-colors hover:bg-[#5B7FF0]/5"
            >
              Cancel
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[52px] rounded-[8px] bg-[#5B7FF0] text-base font-medium text-white transition-colors hover:bg-[#4E6FDE] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
