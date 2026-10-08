"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgentStatusBar } from "./AgentStatusBar";
import { ChiefNavigation, ChiefTab } from "./ChiefNavigation";
import { ChiefSidebar } from "./ChiefSidebar";
import { ExecutiveBriefings } from "./ExecutiveBriefings";
import { LauraConversation } from "./LauraConversation";

export function ChiefOfStaffDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ChiefTab>(
    searchParams.get("tab") === "executive" ? "executive" : "ask",
  );

  function changeTab(tab: ChiefTab) {
    setActiveTab(tab);
    router.replace(
      tab === "executive"
        ? "/dashboard/chief-of-staff?tab=executive"
        : "/dashboard/chief-of-staff",
      { scroll: false },
    );
  }

  return (
    <main className="min-h-[calc(100vh-83px)] bg-[#F5F7FF] p-3 text-[#0E1224] sm:p-4">
      <ChiefNavigation activeTab={activeTab} onTabChange={changeTab} />
      {activeTab === "ask" ? (
        <>
          <AgentStatusBar />
          <div className="grid items-start lg:grid-cols-[348px_minmax(0,1fr)]">
            <ChiefSidebar />
            <LauraConversation />
          </div>
        </>
      ) : (
        <ExecutiveBriefings />
      )}
    </main>
  );
}
