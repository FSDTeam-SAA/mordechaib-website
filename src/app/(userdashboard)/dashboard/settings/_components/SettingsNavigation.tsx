"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settings = [
  ["Profile", "/settings/profile.svg", "/dashboard/settings"],
  ["Security", "/settings/security.svg", "/dashboard/settings/security"],
  ["Notifications", "/settings/notifications.svg", "/dashboard/settings/notifications"],
  ["Integrations", "/settings/integrations.svg", "/dashboard/settings/integrations"],
  ["Workspace", "/settings/workspace.svg", "/dashboard/settings/workspace"],
  ["AI Settings", "/settings/ai-settings.svg", "/dashboard/settings/ai-settings"],
] as const;

export function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <aside className="overflow-hidden rounded-lg bg-white p-3">
      <header className="border-b border-[#E4EAF8] pb-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Settings</h2>
      </header>
      <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Settings sections">
        {settings.map(([label, icon, href]) => {
          const active = pathname === href;
          return <Link
            key={label}
            href={href}
            className={cn(
              "flex min-h-9 items-center gap-2 rounded-[8px] p-2 text-left text-sm transition-colors",
              active ? "bg-[#5B7FF0] font-medium text-white" : "text-[#0E1224] hover:bg-[#F5F7FF]",
            )}
          >
            <Image src={icon} alt="" width={20} height={20} unoptimized className={cn("size-5", active && "brightness-0 invert")} />
            <span className="truncate">{label}</span>
          </Link>;
        })}
      </nav>
      <div className="mt-4 border-t border-[#E4EAF8] pt-4">
        <button type="button" className="flex min-h-9 w-full items-center gap-2 rounded-lg p-2 text-sm text-[#EF4444] transition-colors hover:bg-[#EF4444]/5">
          <Image src="/settings/delete.svg" alt="" width={20} height={20} unoptimized className="size-5" />
          Delete Workspace
        </button>
      </div>
    </aside>
  );
}
