"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Tag,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Customer } from "./CustomerTable";

type Props = {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCall?: (customer: Customer) => void;
};

const leadStatusStyles: Record<string, { bg: string; text: string }> = {
  NEW: { bg: "bg-[#2563EB]/10", text: "text-[#2563EB]" },
  CONTACTED: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
  QUALIFIED: { bg: "bg-[#10B981]/10", text: "text-[#10B981]" },
  PROPOSAL_SENT: { bg: "bg-[#F59E0B]/10", text: "text-[#D97706]" },
  WON: { bg: "bg-[#10B981]/15", text: "text-[#059669]" },
  LOST: { bg: "bg-[#EF4444]/10", text: "text-[#DC2626]" },
};

const customerStatusStyles: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "bg-[#10B981]/10", text: "text-[#10B981]" },
  INACTIVE: { bg: "bg-[#8B93B8]/10", text: "text-[#64748B]" },
  ARCHIVED: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" },
};

const formatLabel = (value?: string | null) => {
  if (!value) return "—";
  const text = value.replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getInitials = (name?: string) => {
  if (!name) return "CU";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CU"
  );
};

export function ContactDetailsModal({
  customer,
  open,
  onOpenChange,
  onCall,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [open]);

  if (!customer) return null;

  const leadStyle =
    customer.leadStatus && leadStatusStyles[customer.leadStatus]
      ? leadStatusStyles[customer.leadStatus]
      : { bg: "bg-[#2563EB]/10", text: "text-[#2563EB]" };

  const statusStyle =
    customer.status && customerStatusStyles[customer.status]
      ? customerStatusStyles[customer.status]
      : { bg: "bg-[#10B981]/10", text: "text-[#10B981]" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        showClose={false}
        overlayClassName="bg-[#0E1224]/50 backdrop-blur-[4px]"
        className="flex h-auto max-h-[90dvh] w-[calc(100%-24px)] max-w-[820px] flex-col gap-0 overflow-hidden !rounded-[20px] border border-[#DCE6FA] bg-[#F7F9FE] p-0 shadow-[0_24px_80px_rgba(14,18,36,0.22)]"
      >
        {/* Pinned Header */}
        <header className="relative flex shrink-0 items-center justify-between border-b border-[#E4EAF8] bg-white px-[1.125rem] py-3 sm:px-5">
          <div className="min-w-0 pr-7">
            <DialogTitle className="truncate text-[0.9375rem]/[1.5rem] sm:text-[1.0625rem]/[1.75rem] font-bold text-[#0E1224]">
              Customer Details
            </DialogTitle>
            <DialogDescription className="truncate text-xs text-[#7B89AA]">
              {customer.name} {customer.company ? `• ${customer.company}` : ""}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FF] text-[#7B89AA] transition hover:bg-[#E4EAF8] hover:text-[#0E1224]"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable Body - with Lenis prevention and smooth scrolling */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 text-[#0E1224] [scrollbar-color:#B8C4EE_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C4EE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
        >
          {/* Hero Profile Card */}
          <section className="relative flex flex-col gap-5 rounded-2xl border border-[#E4EAF8] bg-white p-[1.125rem] sm:p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-full border border-[#DCE6FA] bg-gradient-to-br from-[#EEF3FF] to-[#DCE6FA]">
                {customer.avatarUrl ? (
                  <Image
                    src={customer.avatarUrl}
                    alt={customer.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[1.0625rem]/[1.75rem] sm:text-[1.1875rem]/[1.75rem] font-bold text-[#3961DB]">
                    {getInitials(customer.name)}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="truncate text-[1.1875rem]/[1.75rem] sm:text-[1.375rem]/[2rem] font-bold text-[#0E1224]" title={customer.name}>
                    {customer.name}
                  </h2>
                  {customer.leadStatus && (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${leadStyle.bg} ${leadStyle.text}`}
                    >
                      {formatLabel(customer.leadStatus)}
                    </span>
                  )}
                  {customer.status && (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {formatLabel(customer.status)}
                    </span>
                  )}
                </div>

                {(customer.jobTitle || customer.company) && (
                  <p className="truncate text-sm text-[#7B89AA]">
                    {customer.jobTitle}
                    {customer.jobTitle && customer.company ? " • " : ""}
                    {customer.company}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {customer.phone && (
                <button
                  type="button"
                  onClick={() =>
                    onCall ? onCall(customer) : window.open(`tel:${customer.phone}`)
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#10B981]/10 px-3.5 text-xs font-medium text-[#10B981] transition hover:bg-[#10B981] hover:text-white"
                >
                  <PhoneCall className="size-3.5" />
                  Call
                </button>
              )}
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE6FA] bg-white px-3.5 text-xs font-medium text-[#246BFD] transition hover:bg-[#EEF3FF]"
                >
                  <Mail className="size-3.5" />
                  Email
                </a>
              )}
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl border border-[#E4EAF8] bg-white p-[1.125rem] shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7B89AA]">
              Contact Information
            </h3>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={Mail}
                label="Email"
                value={
                  customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-[#246BFD] hover:underline"
                    >
                      {customer.email}
                    </a>
                  ) : null
                }
              />

              <InfoItem
                icon={Phone}
                label="Phone"
                value={
                  customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-[#246BFD] hover:underline"
                    >
                      {customer.phone}
                    </a>
                  ) : null
                }
              />

              <InfoItem
                icon={Building2}
                label="Company"
                value={customer.company}
              />

              <InfoItem
                icon={User}
                label="Job Title"
                value={customer.jobTitle}
              />

              <InfoItem
                icon={MapPin}
                label="Location"
                value={customer.location}
              />

              <InfoItem
                icon={Globe}
                label="Website"
                value={
                  customer.website ? (
                    <a
                      href={customer.website.startsWith("http") ? customer.website : `https://${customer.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#246BFD] hover:underline"
                    >
                      <span>{customer.website}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : null
                }
              />

              <InfoItem
                icon={Linkedin}
                label="LinkedIn"
                value={
                  customer.linkedinUrl ? (
                    <a
                      href={customer.linkedinUrl.startsWith("http") ? customer.linkedinUrl : `https://${customer.linkedinUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#0077B5] hover:underline"
                    >
                      <span>{customer.linkedinUrl}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : null
                }
              />
            </div>
          </section>

          {/* Tags Section (Removed from table, shown here) */}
          <section className="rounded-2xl border border-[#E4EAF8] bg-white p-[1.125rem] shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7B89AA]">
              <Tag className="size-3.5" />
              Tags
            </h3>
            <div className="mt-2.5">
              {customer.tags && customer.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-lg border border-[#DCE6FA] bg-[#EEF3FF] px-2.5 py-1 text-xs font-medium text-[#246BFD]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8B93B8]">No tags assigned.</p>
              )}
            </div>
          </section>

          {/* Notes Section */}
          <section className="rounded-2xl border border-[#E4EAF8] bg-white p-[1.125rem] shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7B89AA]">
              <FileText className="size-3.5" />
              Notes
            </h3>
            <div className="mt-2.5">
              {customer.notes ? (
                <div className="rounded-xl border border-[#E9EFFD] bg-[#F7F9FE] p-3.5 text-sm leading-relaxed text-[#20263A] whitespace-pre-wrap">
                  {customer.notes}
                </div>
              ) : (
                <p className="text-sm text-[#8B93B8]">No notes added for this contact.</p>
              )}
            </div>
          </section>

          {/* System & Metadata Details */}
          <section className="rounded-2xl border border-[#E4EAF8] bg-white p-[1.125rem] shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7B89AA]">
              <Clock className="size-3.5" />
              System Details
            </h3>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#EDF0F8] bg-[#F9FBFF] p-2.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#7B89AA]">
                  <Hash className="size-3.5" /> Contact ID
                </p>
                <p className="mt-1 font-mono text-xs text-[#20263A] break-all">
                  {customer.id}
                </p>
              </div>

              {customer.createdByUserId && (
                <div className="rounded-xl border border-[#EDF0F8] bg-[#F9FBFF] p-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#7B89AA]">
                    <User className="size-3.5" /> Created By
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#20263A] break-all">
                    {customer.createdByUserId}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-[#EDF0F8] bg-[#F9FBFF] p-2.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#7B89AA]">
                  <Calendar className="size-3.5" /> Created At
                </p>
                <p className="mt-1 text-xs font-medium text-[#20263A]">
                  {formatDateTime(customer.createdAt)}
                </p>
              </div>

              <div className="rounded-xl border border-[#EDF0F8] bg-[#F9FBFF] p-2.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#7B89AA]">
                  <Clock className="size-3.5" /> Last Updated
                </p>
                <p className="mt-1 text-xs font-medium text-[#20263A]">
                  {formatDateTime(customer.updatedAt)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#EDF0F8] bg-[#F9FBFF] p-2.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-[#7B89AA]">
        <Icon className="size-3.5" />
        {label}
      </p>
      <div className="mt-1.5 truncate text-sm font-medium text-[#20263A]" title={typeof value === "string" ? value : undefined}>
        {value || <span className="text-[#8B93B8]">—</span>}
      </div>
    </div>
  );
}
