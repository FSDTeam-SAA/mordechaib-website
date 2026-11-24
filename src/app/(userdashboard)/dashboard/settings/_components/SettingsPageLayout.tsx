import { ReactNode } from "react";
import { SettingsNavigation } from "./SettingsNavigation";

export function SettingsPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-3 min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 lg:grid-cols-[minmax(208px,24%)_minmax(0,1fr)]">
      <SettingsNavigation />
      {children}
    </div>
  );
}
