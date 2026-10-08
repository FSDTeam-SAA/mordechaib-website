"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddContactModal } from "./AddContactModal";

type Status =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Hot Lead"
  | "Closed Won"
  | "Closed Lost";
type Contact = {
  initials: string;
  name: string;
  email: string;
  company: string;
  score: number;
  value: string;
  lastContact: string;
  status: Status;
};

const contacts: Contact[] = [
  {
    initials: "MJ",
    name: "Mike Johnson",
    email: "mike@johnsonconstruction.com",
    company: "Johnson Construction",
    score: 92,
    value: "$8,400",
    lastContact: "Today",
    status: "Hot Lead",
  },
  {
    initials: "MJ",
    name: "Lisa Rivera",
    email: "lisa@riverapartners.com",
    company: "Rivera & Partners",
    score: 92,
    value: "$5,200",
    lastContact: "Yesterday",
    status: "Contacted",
  },
  {
    initials: "MJ",
    name: "Carlos Metro",
    email: "carlos@metrogym.com",
    company: "Metro Gym",
    score: 92,
    value: "$3,600",
    lastContact: "3 days ago",
    status: "Qualified",
  },
  {
    initials: "MJ",
    name: "Sarah Park",
    email: "sarah@parklaw.com",
    company: "Park Law Associates",
    score: 92,
    value: "$6,800",
    lastContact: "Today",
    status: "New",
  },
  {
    initials: "MJ",
    name: "Maria Santos",
    email: "maria@santoshvac.com",
    company: "Chen Consulting",
    score: 92,
    value: "$4,100",
    lastContact: "1 week ago",
    status: "Proposal Sent",
  },
  {
    initials: "MJ",
    name: "James Taylor",
    email: "maria@santoshvac.com",
    company: "Chen Consulting",
    score: 92,
    value: "$4,100",
    lastContact: "1 week ago",
    status: "Closed Won",
  },
  {
    initials: "AK",
    name: "Alicia Keys",
    email: "alicia@musicworld.com",
    company: "Harmony Inc.",
    score: 88,
    value: "$3,800",
    lastContact: "2 weeks ago",
    status: "Closed Won",
  },
  {
    initials: "JT",
    name: "John Legend",
    email: "john@legendsmusic.com",
    company: "Soundwave LLC",
    score: 95,
    value: "$5,500",
    lastContact: "3 days ago",
    status: "Closed Won",
  },
];

const tabs = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Hot Lead",
  "Closed Won",
  "Closed Lost",
] as const;
const statusStyles: Record<Status, string> = {
  New: "bg-[#8B93B8]/10 text-[#ADAAAA]",
  Contacted: "bg-[#5B9CD5]/10 text-[#5B7FF0]",
  Qualified: "bg-[#D946EF]/10 text-[#D946EF]",
  "Proposal Sent": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Hot Lead": "bg-[#EF4444]/10 text-[#EF4444]",
  "Closed Won": "bg-[#10B981]/10 text-[#10B981]",
  "Closed Lost": "bg-[#EF4444]/10 text-[#EF4444]",
};

export function CrmContactsTable() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const filtered = useMemo(
    () =>
      contacts.filter((contact) => {
        const matchesTab =
          activeTab === "All" ||
          (activeTab === "Proposal"
            ? contact.status === "Proposal Sent"
            : contact.status === activeTab);
        const term = query.trim().toLowerCase();
        return (
          matchesTab &&
          (!term ||
            [contact.name, contact.email, contact.company, contact.status].some(
              (value) => value.toLowerCase().includes(term),
            ))
        );
      }),
    [activeTab, query],
  );

  return (
    <section className="mt-4" aria-label="CRM contacts">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-[43px] w-full items-center gap-2 rounded-lg border border-[#8B93B8]/10 bg-white px-[13px] text-[#8B93B8] sm:w-80">
          <Search className="size-5 shrink-0" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#8B93B8]"
          />
          <kbd className="rounded border border-[#8B93B8]/5 px-2 py-1 text-[10px]">
            ⌘K
          </kbd>
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-6">
          <button
            type="button"
            className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] border border-[#5B7FF0] px-6 text-base font-medium text-[#5B7FF0] sm:min-w-[155px]"
          >
            <Download className="size-4 lg:hidden" />
            Export CRM
          </button>
          <AddContactModal>
            <button
              type="button"
              className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-6 text-base font-medium text-white sm:min-w-[198px]"
            >
              <Plus className="size-4 lg:hidden" />
              Add New Contact
            </button>
          </AddContactModal>
        </div>
      </div>
      <div className="mt-4 overflow-hidden bg-white px-3 py-6">
        <div className="mb-[10px] flex justify-start overflow-x-auto pb-1 lg:justify-end">
          <div className="flex w-max items-center rounded-lg bg-[#F5F7FF] p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap rounded-[8px] px-2 py-1 text-sm text-[#6B6B6B]",
                  activeTab === tab && "bg-[#5B7FF0] text-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] table-fixed">
            <thead>
              <tr className="h-[52px] border-b border-[#E4EAF8] text-left text-base">
                <th className="w-[18%] px-4 font-normal">Contact</th>
                <th className="w-[14%] px-4 text-center font-normal">
                  Company
                </th>
                <th className="w-[14%] px-4 text-center font-normal">Score</th>
                <th className="w-[14%] px-4 text-center font-normal">Value</th>
                <th className="w-[14%] px-4 text-center font-normal">
                  Last Contact
                </th>
                <th className="w-[14%] px-4 text-center font-normal">Status</th>
                <th className="w-[12%] px-4 text-center font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr
                  key={`${contact.name}-${contact.email}`}
                  className="h-[65px] text-sm text-[#8B93B8] hover:bg-[#FAFBFF]"
                >
                  <td className="px-4">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5B9CD5] to-[#D946EF] text-[13px] font-bold text-white">
                        {contact.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-base text-[#0E1224]">
                          {contact.name}
                        </span>
                        <span className="block truncate text-xs">
                          {contact.email}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="truncate px-4 text-center">
                    {contact.company}
                  </td>
                  <td className="px-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-1.5 w-9 overflow-hidden rounded-full bg-[#F5F7FF]">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            contact.status === "New"
                              ? "bg-[#8B93B8]"
                              : contact.status === "Contacted"
                                ? "bg-[#F59E0B]"
                                : "bg-[#10B981]",
                          )}
                          style={{ width: `${contact.score}%` }}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          contact.status === "New"
                            ? "text-[#8B93B8]"
                            : contact.status === "Contacted"
                              ? "text-[#F59E0B]"
                              : "text-[#10B981]",
                        )}
                      >
                        {contact.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 text-center">{contact.value}</td>
                  <td className="px-4 text-center">{contact.lastContact}</td>
                  <td className="px-4 text-center">
                    <span
                      className={cn(
                        "inline-flex whitespace-nowrap rounded-full px-2 py-1",
                        statusStyles[contact.status],
                      )}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 text-center">
                    <Link
                      href={`/dashboard/crm/${encodeURIComponent(contact.name.toLowerCase().replaceAll(" ", "-"))}`}
                      className="inline-flex h-[30px] items-center gap-1.5 rounded-xl border border-[#5B7FF0]/50 bg-[#5B7FF0]/10 px-3 text-[10px] text-[#5B7FF0]"
                    >
                      <Eye className="size-4" strokeWidth={1.6} />
                      <span className="underline">Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-[#8B93B8]">
              No contacts found.
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#8B93B8] sm:text-base">
          Showing 1 to 9 of 120 results
        </p>
        <div className="flex gap-2 overflow-x-auto" aria-label="Pagination">
          <button
            type="button"
            aria-label="Previous page"
            className="flex size-10 shrink-0 items-center justify-center rounded border border-[#8B93B8] text-[#8B93B8]"
          >
            <ChevronLeft className="size-5" />
          </button>
          {["1", "2", "3", "...", "17"].map((page) => (
            <button
              type="button"
              key={page}
              className={cn(
                "size-10 shrink-0 rounded border border-[#8B93B8] text-sm text-[#8B93B8]",
                page === "1" && "border-[#5B7FF0] bg-[#5B7FF0] text-white",
              )}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            className="flex size-10 shrink-0 items-center justify-center rounded border border-[#8B93B8] text-[#8B93B8]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
