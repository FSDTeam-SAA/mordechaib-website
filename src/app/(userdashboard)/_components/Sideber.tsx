"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Headphones,
  LayoutGrid,
  Menu,
  Settings,
  Sparkles,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  {
    name: "Call Intelligence",
    href: "/dashboard/call-intelligence",
    icon: Headphones,
  },
    {
    name: "Customer ",
    href: "/dashboard/customer",
    icon: UserRoundCog,
  },
  {
    name: "Ai Chief of Staff",
    href: "/dashboard/chief-of-staff",
    icon: Sparkles,
  },
  { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { name: "CRM", href: "/dashboard/crm", icon: Users },
  { name: "ROI Dashboard", href: "/dashboard/roll-dashboard", icon: BarChart3 },
  { name: "Task", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Operational Diagnostic", href: "/dashboard/operational-diagnostic", icon: ClipboardCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-40 flex size-10 items-center justify-center rounded-lg bg-white text-[#0E1224] shadow md:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-[#0E1224]/35 md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col gap-4 overflow-hidden bg-white p-4 transition-[transform,width] duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed && "md:w-[88px]",
        )}
      >
        <div className={cn("flex h-8 items-center justify-between border-b border-[#F5F7FF] pb-4 box-content", collapsed && "md:justify-center")}>
          <Link href="/" aria-label="Go to Noltra.ai home page" className={cn(collapsed && "md:hidden")}>
            <Image
              src="/logo2.png"
              alt="Noltra.ai"
              width={105}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!collapsed}
            className="hidden size-8 items-center justify-center rounded-lg bg-[#F5F7FF]/50 text-[#C6CCE2] md:flex"
          >
            {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="flex size-8 items-center justify-center rounded-lg bg-[#F5F7FF]/50 text-[#C6CCE2] md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>
        {/* <label className="flex h-10 items-center gap-2 rounded-lg border border-[#8B93B8]/10 px-[13px] text-[#8B93B8]">
          <Search className="size-5 shrink-0" />
          <input
            aria-label="Search navigation"
            placeholder="Search..."
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#8B93B8]"
          />
          <kbd className="rounded border border-[#8B93B8]/5 px-2 py-1 text-[10px]">
            ⌘K
          </kbd>
        </label> */}
        <nav className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", collapsed && "md:items-center")}>
          <div className="flex flex-col gap-2 border-b border-[#E4EAF8] pb-2">
            {navigation.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-label={collapsed ? item.name : undefined}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex h-12 items-center gap-2 rounded-[8px] text-base font-medium transition-colors",
                    collapsed ? "px-4 md:w-12 md:justify-center md:px-0" : "px-4",
                    active
                      ? "border-l-2 border-[#5B7FF0] bg-[#5B7FF0]/10 text-[#5B7FF0]"
                      : "text-[#6B6B6B] hover:bg-[#F5F7FF] hover:text-[#5B7FF0]",
                  )}
                >
                  <item.icon className="size-6 shrink-0" strokeWidth={1.6} />
                  <span className={cn("whitespace-nowrap", collapsed && "md:hidden")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/dashboard/support"
            aria-label={collapsed ? "Help & Support" : undefined}
            title={collapsed ? "Help & Support" : undefined}
            className={cn("flex h-12 items-center gap-2 rounded-lg text-base font-medium hover:bg-[#F5F7FF]", collapsed ? "px-4 md:w-12 md:justify-center md:px-0" : "px-4", pathname.startsWith("/dashboard/support") ? "border-l-2 border-[#5B7FF0] bg-[#5B7FF0]/10 text-[#5B7FF0]" : "text-[#6B6B6B]")}
          >
            <Headphones className="size-6" strokeWidth={1.6} />
            <span className={cn("whitespace-nowrap", collapsed && "md:hidden")}>Help &amp; Support</span>
          </Link>
        </nav>
        <div className={cn("rounded-[12px] bg-[linear-gradient(100deg,#5F08FA_34%,#D946EF_148%)] px-4 py-2 text-white", collapsed && "md:hidden")}>
          <div className="flex items-center gap-2">
            <Crown className="size-5 fill-white" />
            <span className="text-base">Upgrade Plan</span>
          </div>
          <p className="mt-2 text-xs leading-normal text-white/80">
            Unlock Premium features and advanced integrations.
          </p>
          <button
            type="button"
            className="mt-2 flex h-10 w-full items-center justify-between rounded-[10px] bg-white px-4 text-sm font-medium text-[#5B7FF0]"
          >
            Manage Subscription
            <ChevronRight className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
