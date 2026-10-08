import { ReactNode } from "react";
import { SettingsNavigation } from "./SettingsNavigation";

export function SettingsPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-4 p-4 pb-10 lg:grid-cols-[364px_minmax(0,1fr)]">
      <SettingsNavigation />
      {children}
    </div>
  );
}
