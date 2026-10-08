"use client";

import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isTaskPage = pathname.startsWith("/dashboard/tasks");
  const isAddTaskPage = pathname === "/dashboard/tasks/add-task";
  const isRoiPage = pathname.startsWith("/dashboard/roll-dashboard");
  const isCalendarPage = pathname.startsWith("/dashboard/calendar");
  const isCrmPage = pathname.startsWith("/dashboard/crm");
  const isAgentsPage = pathname.startsWith("/dashboard/agents");
  const isChiefOfStaffPage = pathname.startsWith("/dashboard/chief-of-staff");
  const isCrmDetailsPage = /^\/dashboard\/crm\/[^/]+$/.test(pathname);
  const isCallIntelligencePage = pathname.startsWith(
    "/dashboard/call-intelligence",
  );
  const isCallIntelligenceSettingsPage =
    pathname === "/dashboard/call-intelligence/settings";
  const isCallIntelligenceDetailsPage =
    /^\/dashboard\/call-intelligence\/[^/]+$/.test(pathname) &&
    !isCallIntelligenceSettingsPage;
  const isSettingsPage = pathname.startsWith("/dashboard/settings");
  const settingsSection = pathname.endsWith("/security")
    ? "Security"
    : pathname.endsWith("/notifications")
      ? "Notifications"
      : pathname.endsWith("/integrations")
        ? "Integrations"
        : pathname.endsWith("/workspace")
          ? "Workspace"
          : pathname.endsWith("/ai-settings")
            ? "AI Settings"
            : "Profile";
  const title = isChiefOfStaffPage
    ? "Laura (Chief of Staff)"
    : isCallIntelligencePage
      ? "Call Intelligence"
    : isCalendarPage
      ? "Meeting Calendar"
      : isRoiPage
        ? "ROI Dashboard"
        : isSettingsPage
          ? "Settings"
          : isTaskPage
            ? "Task"
            : isAgentsPage
              ? "AI Agents"
              : isCrmPage
                ? "CRM"
                : "Dashboard";

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-[83px] items-center justify-between bg-white px-4 md:left-[260px] md:px-6">
      <div className="ml-12 min-w-0 md:ml-0">
        <h1 className="text-xl font-medium leading-normal text-[#0E1224] sm:text-2xl">
          {title}
        </h1>
        {isCallIntelligencePage ||
        isRoiPage ||
        isSettingsPage ||
        isTaskPage ||
        isCrmPage ||
        isAgentsPage ||
        isChiefOfStaffPage ? (
          <p className="hidden items-center text-sm font-medium text-[#8B93B8] sm:flex">
            Dashboard <span className="mx-2 text-[#5B7FF0]">›</span>
            {isSettingsPage && (
              <>
                <span>Settings</span>
                <span className="mx-2 text-[#5B7FF0]">›</span>
              </>
            )}
            {isCrmDetailsPage && (
              <>
                <span>CRM</span>
                <span className="mx-2 text-[#5B7FF0]">›</span>
              </>
            )}
            {isCallIntelligenceSettingsPage || isCallIntelligenceDetailsPage ? (
              <>
                <span>Call Intelligence</span>
                <span className="mx-2 text-[#5B7FF0]">›</span>
                <span className="text-[#5B7FF0]">
                  {isCallIntelligenceSettingsPage ? "Settings" : "View details"}
                </span>
              </>
            ) : (
              <span className="text-[#5B7FF0]">
                {isCallIntelligencePage
                  ? "Call Intelligence"
                  : isChiefOfStaffPage
                    ? `Ai Chief of Staff › ${searchParams.get("tab") === "executive" ? "Executive Briefings" : "Ask Laura Anything"}`
                    : isRoiPage
                    ? "ROI Dashboard"
                    : isAgentsPage
                      ? "AI Agents"
                      : isCrmDetailsPage
                        ? "View Details"
                        : isCrmPage
                          ? "CRM"
                          : isSettingsPage
                            ? settingsSection
                            : isAddTaskPage
                              ? "Add New Task"
                              : "Task"}
              </span>
            )}
          </p>
        ) : (
          <p className="mt-1 hidden truncate text-sm font-medium text-[#8B93B8] sm:block">
            Welcome back, Rifat! Here&apos;s what&apos;s happening with your
            business today.
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-lg bg-[#F5F7FF] text-[#0E1224]"
        >
          <Bell className="size-6" strokeWidth={1.6} />
          <span className="absolute right-[9px] top-[7px] flex size-3 items-center justify-center rounded-full bg-[#EF4444] text-[8px] text-white">
            3
          </span>
        </button>
        <button className="flex h-11 items-center gap-2 rounded-lg bg-[#F5F7FF] px-2 text-left">
          <Image
            src="/dashboard-avatar.png"
            alt="Rifat Hossain"
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          <span className="hidden min-w-[89px] sm:block">
            <span className="block text-xs text-[#0E1224]">Rifat Hossain</span>
            <span className="mt-1 block text-[10px] text-[#8B93B8]">CEO</span>
          </span>
          <ChevronDown className="size-4 text-[#8B93B8]" />
        </button>
      </div>
    </header>
  );
}
