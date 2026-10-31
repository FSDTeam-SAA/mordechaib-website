"use client";

import Link from "next/link";
import { Bell, ChevronDown, Loader2, LogOut, UserRound } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import NotificationPanel from "./NotificationPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type HeaderProps = {
  sidebarCollapsed: boolean;
};

type HeaderProfile = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  profileImage?: string | null;
  avatar?: string | null;
};

type MeResponse = {
  success?: boolean;
  data?: HeaderProfile;
};

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const accessToken = session?.user.accessToken;

  const profileQuery = useQuery({
    queryKey: ["auth-me", session?.user.id],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response.json().catch(() => ({}))) as MeResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error("Unable to load profile");
      }

      return result.data;
    },
  });

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", closeProfileMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => setIsProfileMenuOpen(false), [pathname]);

  const profile = profileQuery.data;
  const firstName = profile?.firstName || session?.user.firstName || "User";
  const lastName = profile?.lastName || session?.user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || session?.user.email || "";
  const role = session?.user.role
    ? session.user.role.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Member";
  const avatar =
    profile?.avatarUrl ??
    profile?.profileImage ??
    profile?.avatar ??
    session?.user.profileImage ??
    undefined;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    localStorage.removeItem("accessToken");
    queryClient.clear();
    await signOut({ callbackUrl: "/" });
  };
  const isTaskPage = pathname.startsWith("/dashboard/tasks");
  const isAddTaskPage = pathname === "/dashboard/tasks/add-task";
  const isRoiPage = pathname.startsWith("/dashboard/roll-dashboard");
  const isCalendarPage = pathname.startsWith("/dashboard/calendar");
  const isCrmPage = pathname.startsWith("/dashboard/crm");
  const isAgentsPage = pathname.startsWith("/dashboard/agents");
  const isOperationalDiagnosticPage = pathname.startsWith("/dashboard/operational-diagnostic");
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
        : isOperationalDiagnosticPage
          ? "Operational Diagnostic"
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
    <header className={`fixed left-0 right-0 top-0 z-30 flex h-[83px] items-center justify-between bg-white px-4 transition-[left] duration-300 md:px-6 ${sidebarCollapsed ? "md:left-[88px]" : "md:left-[280px]"}`}>
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
        isOperationalDiagnosticPage ||
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
                      : isOperationalDiagnosticPage
                        ? "Operational Diagnostic"
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
            Welcome back, {firstName}! Here&apos;s what&apos;s happening with your
            business today.
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          aria-label="Notifications"
          aria-controls="notifications-panel"
          aria-expanded={isNotificationsOpen}
          className="relative flex size-11 items-center justify-center rounded-lg bg-[#F5F7FF] text-[#0E1224]"
          onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
          type="button"
        >
          <Bell className="size-6" strokeWidth={1.6} />
          {unreadNotificationCount > 0 && (
            <span className="absolute right-[9px] top-[7px] flex size-3 min-w-3 items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[8px] text-white">
              {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
            </span>
          )}
        </button>
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
            className="flex h-11 items-center gap-2 rounded-lg bg-[#F5F7FF] px-2 text-left transition hover:bg-[#EEF2FF]"
          >
            <Avatar className="size-9 border border-[#E4EAF8]">
              <AvatarImage src={avatar} alt={fullName} className="object-cover" />
              <AvatarFallback className="bg-[#E9EEFF] text-xs font-semibold text-[#5B7FF0]">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden min-w-[89px] max-w-36 sm:block">
              <span className="block truncate text-xs text-[#0E1224]">{fullName}</span>
              <span className="mt-1 block truncate text-[10px] text-[#8B93B8]">{role}</span>
            </span>
            <ChevronDown className={`size-4 text-[#8B93B8] transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileMenuOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-[280px] overflow-hidden rounded-xl border border-[#E4EAF8] bg-white shadow-[0_16px_40px_rgba(14,18,36,0.14)]">
              <div className="flex items-center gap-3 border-b border-[#E4EAF8] p-4">
                <Avatar className="size-11 border border-[#E4EAF8]">
                  <AvatarImage src={avatar} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-[#E9EEFF] text-sm font-semibold text-[#5B7FF0]">{initials || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0E1224]">{fullName}</p>
                  <p className="mt-1 truncate text-xs text-[#8B93B8]">{email}</p>
                  <p className="mt-0.5 text-[11px] text-[#8B93B8]">{role}</p>
                </div>
              </div>
              <div className="p-2">
                <Link role="menuitem" href="/dashboard/settings" className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-[#30384F] transition hover:bg-[#F5F7FF]">
                  <UserRound className="size-4 text-[#5B7FF0]" /> Profile settings
                </Link>
                <button type="button" role="menuitem" onClick={() => { setIsProfileMenuOpen(false); setIsLogoutModalOpen(true); }} className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-[#EF4444] transition hover:bg-red-50">
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={setUnreadNotificationCount}
      />
      <Dialog open={isLogoutModalOpen} onOpenChange={(open) => { if (!isSigningOut) setIsLogoutModalOpen(open); }}>
        <DialogContent showClose={false} overlayClassName="bg-black/30 backdrop-blur-[3px]" className="w-[calc(100%-32px)] max-w-[480px] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#E4EAF8] p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]"><LogOut className="size-5" /></span>
            <DialogTitle className="text-xl font-medium text-[#0E1224]">Confirm Logout</DialogTitle>
          </div>
          <div className="p-5 sm:p-6">
            <DialogDescription className="text-base leading-6 text-[#64748B]">Are you sure you want to log out of your account?</DialogDescription>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSigningOut} className="h-11 border-[#5B7FF0] text-[#5B7FF0] hover:bg-[#F5F7FF] hover:text-[#5B7FF0]">Cancel</Button></DialogClose>
              <Button type="button" onClick={() => void handleLogout()} disabled={isSigningOut} className="h-11 bg-[#EF4444] text-white hover:bg-[#DC2626]">
                {isSigningOut ? <><Loader2 className="mr-2 size-4 animate-spin" /> Logging out...</> : "Log out"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
