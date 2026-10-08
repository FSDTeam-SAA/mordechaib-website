"use client";

import { useState } from "react";
import { Building2, Mail, Pencil, Phone, PhoneCall, Trash2, Users } from "lucide-react";
import { DeleteCustomerModal } from "./DeleteCustomerModal";
import { EditCustomerModal } from "./EditCustomerModal";
import { OutboundCallModal } from "./OutboundCallModal";

export type Customer = {
  id: string;
  createdByUserId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
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
const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [callingCustomer, setCallingCustomer] = useState<Customer | null>(null);
  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] table-fixed text-sm">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[17%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="h-[52px] border-b border-[#E4EAF8] text-left text-[#0E1224]">
              <th className="px-5 font-normal">Customer</th>
              <th className="px-5 font-normal">Phone</th>
              <th className="px-5 font-normal">Company</th>
              <th className="px-5 font-normal">Tags</th>
              <th className="px-5 text-center font-normal">Status</th>
              <th className="px-5 text-center font-normal">Added</th>
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
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0]/10 text-xs font-semibold text-[#5B7FF0]">
                      {initials(customer.name)}
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
                <td className="px-5">
                  <div className="flex max-h-14 flex-wrap gap-1.5 overflow-hidden">
                    {customer.tags?.length ? (
                      customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#5B7FF0]/10 px-2 py-1 text-[11px] font-medium text-[#5B7FF0]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8B93B8]">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[customer.status ?? ""] ?? "bg-[#8B93B8]/10 text-[#64748B]"}`}
                  >
                    {label(customer.status)}
                  </span>
                </td>
                <td className="px-5 text-center text-xs text-[#65708D]">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-5">
                  <div className="flex items-center justify-center gap-2">
                    {customer.phone ? (
                      <button type="button" onClick={() => setCallingCustomer(customer)} aria-label={`Call ${customer.name}`} className="flex size-8 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981] transition hover:bg-[#10B981] hover:text-white"><PhoneCall className="size-4" /></button>
                    ) : (
                      <button type="button" disabled aria-label={`${customer.name} has no phone number`} className="flex size-8 cursor-not-allowed items-center justify-center rounded-lg bg-[#8B93B8]/10 text-[#8B93B8] opacity-50"><PhoneCall className="size-4" /></button>
                    )}
                    <button type="button" onClick={() => setEditingCustomer(customer)} aria-label={`Edit ${customer.name}`} className="flex size-8 items-center justify-center rounded-lg bg-[#5B7FF0]/10 text-[#5B7FF0] transition hover:bg-[#5B7FF0] hover:text-white"><Pencil className="size-4" /></button>
                    <button type="button" onClick={() => setDeletingCustomer(customer)} aria-label={`Delete ${customer.name}`} className="flex size-8 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444] transition hover:bg-[#EF4444] hover:text-white"><Trash2 className="size-4" /></button>
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
      <EditCustomerModal customerId={editingCustomer?.id ?? null} open={Boolean(editingCustomer)} onOpenChange={(open) => !open && setEditingCustomer(null)} onUpdated={onChanged} />
      <DeleteCustomerModal customerId={deletingCustomer?.id ?? null} customerName={deletingCustomer?.name} open={Boolean(deletingCustomer)} onOpenChange={(open) => !open && setDeletingCustomer(null)} onDeleted={onChanged} />
      <OutboundCallModal open={Boolean(callingCustomer)} onOpenChange={(open) => !open && setCallingCustomer(null)} customerName={callingCustomer?.name} initialClientPhone={callingCustomer?.phone ?? ""} />
    </section>
  );
}
