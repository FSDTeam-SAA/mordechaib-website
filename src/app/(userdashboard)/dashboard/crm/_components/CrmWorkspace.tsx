"use client";

import { useState } from "react";
import { Plug, UserRoundCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerContent } from "../../customer/_components/CustomerContent";
import { CrmContactsTable } from "./CrmContactsTable";
import { CrmStatCards } from "./CrmStatCards";

type WorkspaceTab = "customer" | "external";
const tabs = [
  { id: "customer" as const, label: "Customer", icon: UserRoundCog },
  { id: "external" as const, label: "External CRM", icon: Plug },
];

export function CrmWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("customer");

  return (
    <div className="min-h-[calc(100vh-83px)] p-4 pb-10 text-[#0E1224]">
      <CrmStatCards />
      <div className="mb-5 mt-5 flex w-full items-center gap-1 rounded-xl border border-[#DCE6FA] bg-white p-1.5 sm:w-fit" role="tablist" aria-label="CRM sections">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={cn(
                "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition sm:min-w-40",
                isActive ? "bg-[#EEF3FF] text-[#246BFD] shadow-sm" : "text-[#7B89AA] hover:bg-[#F7F9FE] hover:text-[#0E1224]",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        {activeTab === "customer" ? (
          <CustomerContent />
        ) : (
          <CrmContactsTable />
        )}
      </div>
    </div>
  );
}
