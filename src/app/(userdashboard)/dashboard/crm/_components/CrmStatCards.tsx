"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { CrmStatCardsSkeleton } from "./CrmStatCardsSkeleton";

export type CrmDashboardSummaryData = {
  organizationId: string;
  asOf: string;
  timezone: string;
  period: {
    key: string;
    start: string;
    end: string;
    days: number;
  };
  cards: {
    moneySaved?: {
      availability?: string;
      amount?: number;
      currency?: string;
      isEstimated?: boolean;
      comparison?: {
        current?: number;
        previous?: number;
        changePercent?: number | null;
      };
      series?: Array<{ date: string; value: number }>;
    };
    tasksToday?: {
      availability?: string;
      total?: number;
      overdue?: number;
      comparison?: {
        period?: string;
        previousValue?: number;
        changePercent?: number | null;
      };
      series?: Array<{ date: string; value: number }>;
    };
    hoursSaved?: {
      availability?: string;
      value?: number;
      minutes?: number;
      hours?: number;
      isEstimated?: boolean;
      comparison?: {
        current?: number;
        previous?: number;
        changePercent?: number | null;
      };
      series?: Array<{ date: string; value: number }>;
    };
    meetingsScheduled?: {
      availability?: string;
      total?: number;
      comparison?: {
        period?: string;
        previousValue?: number;
        changePercent?: number | null;
      };
      series?: Array<{ date: string; value: number }>;
    };
  };
};

function formatMoney(amount: number, currency = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

function formatHours(hours: number): string {
  const formatted = hours.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return `${formatted}h`;
}

export function CrmStatCards() {
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;

  const { data, isLoading } = useQuery<CrmDashboardSummaryData>({
    queryKey: ["crm-dashboard-summary", "30_DAYS"],
    enabled: status === "authenticated" && Boolean(accessToken),
    queryFn: async ({ signal }) => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/crm/dashboard/summary?period=30_DAYS`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal,
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          (Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message) || "Failed to load CRM dashboard summary",
        );
      }
      return result.data as CrmDashboardSummaryData;
    },
  });

  const stats = useMemo(() => {
    const cards = data?.cards;

    // 1. RoI - Money Saved
    const moneyAmount = cards?.moneySaved?.amount ?? 0;
    const moneyCurrency = cards?.moneySaved?.currency || "USD";
    const moneyComp = cards?.moneySaved?.comparison;
    let moneyNote = "0%";
    let moneySuffix = "vs last period";

    if (
      moneyComp &&
      moneyComp.changePercent !== null &&
      moneyComp.changePercent !== undefined
    ) {
      const cp = Math.round(moneyComp.changePercent);
      moneyNote = `${cp >= 0 ? "+" : ""}${cp}%`;
    } else if ((moneyComp?.previous ?? 0) === 0 && (moneyComp?.current ?? 0) > 0) {
      moneyNote = "+100%";
    } else if (cards?.moneySaved?.isEstimated) {
      moneyNote = "Estimated";
      moneySuffix = "30-day ROI";
    }

    // 2. Tasks Today
    const tasksTotal = cards?.tasksToday?.total ?? 0;
    const tasksOverdue = cards?.tasksToday?.overdue ?? 0;

    // 3. Hours Saved
    const hoursAmount = cards?.hoursSaved?.hours ?? cards?.hoursSaved?.value ?? 0;
    const hoursComp = cards?.hoursSaved?.comparison;
    let hoursNote = "0%";
    let hoursSuffix = "vs last period";

    if (
      hoursComp &&
      hoursComp.changePercent !== null &&
      hoursComp.changePercent !== undefined
    ) {
      const cp = Math.round(hoursComp.changePercent);
      hoursNote = `${cp >= 0 ? "+" : ""}${cp}%`;
    } else if ((hoursComp?.previous ?? 0) === 0 && (hoursComp?.current ?? 0) > 0) {
      hoursNote = "+100%";
    } else if (
      typeof cards?.hoursSaved?.minutes === "number" &&
      cards.hoursSaved.minutes > 0
    ) {
      hoursNote = `${cards.hoursSaved.minutes}m`;
      hoursSuffix = "total saved";
    } else if (cards?.hoursSaved?.isEstimated) {
      hoursNote = "Estimated";
      hoursSuffix = "30-day ROI";
    }

    // 4. Meeting Scheduled
    const meetingsTotal = cards?.meetingsScheduled?.total ?? 0;

    return [
      {
        value: formatMoney(moneyAmount, moneyCurrency),
        label: "RoI - Money Saved",
        note: moneyNote,
        suffix: moneySuffix,
        icon: "/crm/money.svg",
        chart: "/crm/money-chart.svg",
        iconBg: "bg-[#10B981]/10",
        noteClass: "bg-[#10B981]/10 text-[#10B981]",
      },
      {
        value: String(tasksTotal),
        label: "Tasks Today",
        note: `${tasksOverdue} Overdue`,
        suffix: "",
        icon: "/crm/tasks.svg",
        chart: "/crm/tasks-chart.svg",
        iconBg: "bg-[#D946EF]/10",
        noteClass: "bg-[#D946EF]/10 text-[#D24FC7]",
      },
      {
        value: formatHours(hoursAmount),
        label: "Hours Saved",
        note: hoursNote,
        suffix: hoursSuffix,
        icon: "/crm/time.svg",
        chart: "/crm/time-chart.svg",
        iconBg: "bg-[#5B9CD5]/20",
        noteClass: "bg-[#5B7FF0]/10 text-[#5B7FF0]",
      },
      {
        value: String(meetingsTotal),
        label: "Meeting Scheduled",
        note: `${meetingsTotal} Today`,
        suffix: "",
        icon: "/crm/meeting.svg",
        chart: "/crm/meeting-chart.svg",
        iconBg: "bg-[#FFAE00]/10",
        noteClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
      },
    ];
  }, [data]);

  if (status === "loading" || (isLoading && !data)) {
    return <CrmStatCardsSkeleton />;
  }

  return (
    <section
      aria-label="CRM summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="relative h-[156px] min-w-0 overflow-hidden rounded-[12px] bg-white p-4"
        >
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}
          >
            <Image src={stat.icon} alt="" width={20} height={20} />
          </div>
          <div className="mt-2 min-w-0 pr-[104px]">
            <p className="whitespace-nowrap text-2xl font-bold leading-normal">
              {stat.value}
            </p>
            <p className="whitespace-nowrap text-sm text-[#ADAAAA]">
              {stat.label}
            </p>
            <div className="mt-[3px] flex items-center gap-0.5 whitespace-nowrap">
              <span
                className={`rounded-lg px-1 py-1 text-[10px] font-bold leading-[13px] ${stat.noteClass}`}
              >
                {stat.note}
              </span>
              {stat.suffix && (
                <span className="text-xs text-[#8B93B8]">{stat.suffix}</span>
              )}
            </div>
          </div>
          <Image
            src={stat.chart}
            alt=""
            width={108}
            height={65}
            className="absolute bottom-4 right-4 h-[65px] w-[108px]"
          />
        </article>
      ))}
    </section>
  );
}
