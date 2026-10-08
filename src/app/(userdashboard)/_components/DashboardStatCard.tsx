import { TrendingUp, type LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  note: string;
  badge: string;
  color: string;
  background: string;
};

export function DashboardStatCard({
  icon: Icon,
  value,
  label,
  note,
  badge,
  color,
  background,
}: DashboardStatCardProps) {
  return (
    <article className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between">
        <span className={`flex size-10 items-center justify-center rounded-lg ${background} ${color}`}>
          <Icon className="size-5" />
        </span>
        <span className="text-xs text-[#8B93B8]">{note}</span>
      </div>
      <div className="mt-2">
        <strong className="text-2xl font-medium text-[#0E1224]">{value}</strong>
        <p className="mt-1 text-sm text-[#8B93B8]">{label}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-[#8B93B8]">
          <span className={`rounded-full px-2 py-1 ${background} ${color}`}>{badge}</span>
          {badge === "18%" && <span>vs last week</span>}
          <TrendingUp className={`ml-auto size-8 ${color}`} />
        </div>
      </div>
    </article>
  );
}
