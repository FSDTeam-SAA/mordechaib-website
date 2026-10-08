import { ReactNode } from "react";

type ChartShellProps = { title: string; subtitle?: string; controls?: ReactNode; children: ReactNode; className?: string };

export function ChartShell({ title, subtitle, controls, children, className = "" }: ChartShellProps) {
  return <article className={`min-w-0 rounded-xl bg-white p-4 sm:p-6 ${className}`}><header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-medium text-[#0E1224]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#8B93B8]">{subtitle}</p>}</div>{controls}</header>{children}</article>;
}

export function PeriodTabs() {
  return <div className="flex items-center gap-2" aria-label="Chart period">{["7D", "30D", "3M"].map((period, index) => <button key={period} type="button" className={`rounded-lg bg-[#5B9CD5]/10 px-2 py-1 text-xs ${index === 0 ? "text-[#5B7FF0]" : "text-[#8B93B8]"}`}>{period}</button>)}</div>;
}
