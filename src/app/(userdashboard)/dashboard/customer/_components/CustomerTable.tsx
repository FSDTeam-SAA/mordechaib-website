"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Eye, Linkedin, Mail, MapPin, Phone, Trash2, Users } from "lucide-react";
import { DeleteCustomerModal } from "./DeleteCustomerModal";

export type Customer = {
  id: string;
  createdByUserId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  leadStatus?: string | null;
  notes?: string | null;
  tags?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-[#10B981]/10 text-[#10B981]",
  INACTIVE: "bg-[#8B93B8]/10 text-[#64748B]",
  BLOCKED: "bg-[#EF4444]/10 text-[#EF4444]",
};
const label = (value?: string) => {
  if (!value) return "—";
  const text = value.replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CU";

export function CustomerTable({
  customers,
  onChanged,
}: {
  customers: Customer[];
  onChanged: () => void;
}) {
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1260px] table-fixed text-sm">
          <colgroup>
            <col className="w-[260px]" />
            <col className="w-[200px]" />
            <col className="w-[220px]" />
            <col className="w-[130px]" />
            <col className="w-[170px]" />
            <col className="w-[230px]" />
            <col className="w-[120px]" />
            <col className="w-[150px]" />
          </colgroup>
          <thead>
            <tr className="h-[52px] border-b border-[#E4EAF8] text-left text-[#0E1224]">
              <th className="px-5 font-normal">Customer</th>
              <th className="px-5 font-normal">Location</th>
              <th className="px-5 font-normal">Links</th>
              <th className="px-5 font-normal">Lead Status</th>
              <th className="px-5 font-normal">Phone</th>
              <th className="px-5 font-normal">Company</th>
              <th className="px-5 text-center font-normal">Status</th>
              <th className="px-5 text-center font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="h-[76px] border-b border-[#E4EAF8]/50 text-[#141936] transition-colors last:border-0 hover:bg-[#FAFBFF]"
              >
                <td className="px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5B7FF0]/10 text-xs font-semibold text-[#5B7FF0]">
                      {customer.avatarUrl ? (
                        <Image src={customer.avatarUrl} alt={customer.name} fill unoptimized className="object-cover" />
                      ) : initials(customer.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={customer.name}>
                        {customer.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#8B93B8]">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate" title={customer.email ?? ""}>
                          {customer.email || "No email"}
                        </span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5">
                  <span className="flex items-start gap-2 text-[#44506F]">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#8B93B8]" />
                    <span className="line-clamp-2" title={customer.location ?? ""}>{customer.location || "—"}</span>
                  </span>
                </td>
                <td className="px-5">
                  <div className="space-y-2 text-xs">
                    {customer.website ? <a href={customer.website} target="_blank" rel="noreferrer" title={customer.website} className="flex items-center gap-2 text-[#5B7FF0] hover:underline"><ExternalLink className="size-3.5 shrink-0" /><span className="truncate">{customer.website}</span></a> : <span className="text-[#8B93B8]">No website</span>}
                    {customer.linkedinUrl ? <a href={customer.linkedinUrl} target="_blank" rel="noreferrer" title={customer.linkedinUrl} className="flex items-center gap-2 text-[#3974C6] hover:underline"><Linkedin className="size-3.5 shrink-0" /><span className="truncate">{customer.linkedinUrl}</span></a> : <p className="text-[#8B93B8]">No LinkedIn</p>}
                  </div>
                </td>
                <td className="px-5">
                  <span className="inline-flex rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-medium text-[#D48605]">{label(customer.leadStatus ?? undefined)}</span>
                </td>
                <td className="px-5">
                  <span className="flex items-center gap-2 text-[#44506F]">
                    <Phone className="size-4 shrink-0 text-[#8B93B8]" />
                    {customer.phone || "—"}
                  </span>
                </td>
                <td className="px-5">
                  <p
                    className="flex items-center gap-2 truncate font-medium"
                    title={customer.company ?? ""}
                  >
                    <Building2 className="size-4 shrink-0 text-[#8B93B8]" />
                    <span className="truncate">{customer.company || "—"}</span>
                  </p>
                  <p
                    className="mt-1 truncate pl-6 text-xs text-[#8B93B8]"
                    title={customer.jobTitle ?? ""}
                  >
                    {customer.jobTitle || "No job title"}
                  </p>
                </td>
                <td className="px-5 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[customer.status ?? ""] ?? "bg-[#8B93B8]/10 text-[#64748B]"}`}
                  >
                    {label(customer.status)}
                  </span>
                </td>
                <td className="px-5">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/dashboard/crm/${customer.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#84A9FF] bg-[#EEF3FF] px-3.5 text-xs font-medium text-[#2563EB] transition hover:bg-[#DCE6FA]"
                    >
                      <Eye className="size-3.5 shrink-0 text-[#2563EB]" />
                      <span className="underline underline-offset-2">Details</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeletingCustomer(customer)}
                      aria-label={`Delete ${customer.name}`}
                      className="flex size-8 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444] transition hover:bg-[#EF4444] hover:text-white"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="flex h-44 flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#5B7FF0]/10 text-[#5B7FF0]">
              <Users className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-[#44506F]">
              No customers found
            </p>
            <p className="mt-1 text-xs text-[#8B93B8]">
              Customer contacts will appear here.
            </p>
          </div>
        )}
      </div>
      <DeleteCustomerModal
        customerId={deletingCustomer?.id ?? null}
        customerName={deletingCustomer?.name}
        open={Boolean(deletingCustomer)}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        onDeleted={onChanged}
      />
    </section>
  );
}
