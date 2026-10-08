"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BarChart3, RefreshCw, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Availability = "AVAILABLE" | "UNAVAILABLE";

type Comparison = {
  period: string;
  previousValue: number;
  changePercent: number;
};

type SummaryResponse = {
  success?: boolean;
  message?: string | string[];
  data?: {
    cards?: {
      moneySaved?: {
        availability: Availability;
        amount: number | null;
        currency: string | null;
        isEstimated: boolean;
      };
      tasksToday?: {
        availability: Availability;
        total: number;
        overdue: number;
        comparison: Comparison;
      };
      hoursSaved?: {
        availability: Availability;
        minutes: number | null;
        hours: number | null;
        isEstimated: boolean;
      };
      meetingsScheduled?: {
        availability: Availability;
        total: number;
        comparison: Comparison;
      };
    };
  };
};

type KpiCard = {
  value: string;
  label: string;
  badge: string;
  suffix?: string;
  icon: string;
  chart: string;
  color: string;
  tint: string;
};

const cardStyles = [
  {
    label: "RoI - Money Saved",
    icon: "/dashboard-cards/money.svg",
    chart: "/dashboard-cards/money-chart.svg",
    color: "#10B981",
    tint: "bg-[#10B981]/10",
  },
  {
    label: "Tasks Today",
    icon: "/dashboard-cards/tasks.svg",
    chart: "/dashboard-cards/tasks-chart.svg",
    color: "#D24FC7",
    tint: "bg-[#D24FC7]/10",
  },
  {
    label: "Hours Saved",
    icon: "/dashboard-cards/hours.svg",
    chart: "/dashboard-cards/hours-chart.svg",
    color: "#5B7FF0",
    tint: "bg-[#5B7FF0]/10",
  },
  {
    label: "Meeting Scheduled",
    icon: "/dashboard-cards/meetings.svg",
    chart: "/dashboard-cards/meetings-chart.svg",
    color: "#F59E0B",
    tint: "bg-[#F59E0B]/10",
  },
] as const;

function messageOf(result: Pick<SummaryResponse, "message">) {
  return Array.isArray(result.message)
    ? result.message.join(", ")
    : result.message || "Unable to load dashboard summary.";
}

function formatCurrency(amount: number, currency: string | null) {
  if (!currency) return `$ ${amount.toLocaleString()}`;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatHours(hours: number | null, minutes: number | null) {
  const value = hours ?? (minutes === null ? null : minutes / 60);
  return value === null ? "—" : `${Number(value.toFixed(1))}h`;
}

function comparisonBadge(comparison?: Comparison) {
  if (!comparison) {
    return { badge: "No comparison", suffix: undefined };
  }

  return {
    badge: `${comparison.changePercent}%`,
    suffix:
      comparison.period === "PREVIOUS_DAY"
        ? "vs previous day"
        : "vs previous period",
  };
}

function DashboardKpiCardsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading dashboard summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cardStyles.map((card) => (
        <article
          key={card.label}
          className="relative min-h-[156px] overflow-hidden rounded-lg bg-white p-4"
        >
          <div className="animate-pulse">
            <span className={`flex size-10 rounded-xl ${card.tint}`} />
            <div className="mt-2 max-w-[155px] space-y-2">
              <div className="h-7 w-24 rounded bg-[#F5F7FF]" />
              <div className="h-4 w-28 rounded bg-[#F5F7FF]" />
              <div className="h-6 w-20 rounded-lg bg-[#F5F7FF]" />
            </div>
            <div className="absolute bottom-4 right-4 h-[65px] w-[108px] rounded bg-[#F5F7FF]" />
          </div>
        </article>
      ))}
    </section>
  );
}

function DashboardKpiCardsState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : BarChart3;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="col-span-full flex min-h-[156px] flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
        <Icon
          className={`size-8 ${isError ? "text-[#EF4444]" : "text-[#8B93B8]"}`}
        />
        <p className="mt-2 text-sm font-medium text-[#0E1224]">
          {isError
            ? "Dashboard summary could not be loaded"
            : "No dashboard summary found"}
        </p>
        <p className="mt-1 text-sm text-[#8B93B8]">
          {error || "There is no KPI data available for this workspace yet."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-[#5B7FF0] px-4 text-sm font-medium text-white"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        )}
      </article>
    </section>
  );
}

export function DashboardKpiCards() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;

  const summaryQuery = useQuery({
    queryKey: ["organizer-dashboard", "summary", 7],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer-dashboard/summary?days=7`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as SummaryResponse;

      if (response.status === 404) return null;
      if (!response.ok || !result.success) {
        throw new Error(messageOf(result));
      }

      return result.data ?? null;
    },
  });

  if (sessionStatus === "loading" || summaryQuery.isLoading) {
    return <DashboardKpiCardsSkeleton />;
  }

  if (summaryQuery.isError) {
    return (
      <DashboardKpiCardsState
        error={
          summaryQuery.error instanceof Error
            ? summaryQuery.error.message
            : "Please try again."
        }
        onRetry={() => void summaryQuery.refetch()}
      />
    );
  }

  if (!summaryQuery.data?.cards) {
    return <DashboardKpiCardsState />;
  }

  const { moneySaved, tasksToday, hoursSaved, meetingsScheduled } =
    summaryQuery.data.cards;
  const meetingsComparison = comparisonBadge(meetingsScheduled?.comparison);

  const cards: KpiCard[] = [
    {
      ...cardStyles[0],
      value:
        moneySaved?.availability === "AVAILABLE" && moneySaved.amount !== null
          ? formatCurrency(moneySaved.amount, moneySaved.currency)
          : "—",
      badge:
        moneySaved?.availability === "AVAILABLE"
          ? moneySaved.isEstimated
            ? "Estimated"
            : "Available"
          : "Unavailable",
    },
    {
      ...cardStyles[1],
      value: String(tasksToday?.total ?? 0),
      badge: `${tasksToday?.overdue ?? 0} Overdue`,
    },
    {
      ...cardStyles[2],
      value:
        hoursSaved?.availability === "AVAILABLE"
          ? formatHours(hoursSaved.hours, hoursSaved.minutes)
          : "—",
      badge:
        hoursSaved?.availability === "AVAILABLE"
          ? hoursSaved.isEstimated
            ? "Estimated"
            : "Available"
          : "Unavailable",
    },
    {
      ...cardStyles[3],
      value: String(meetingsScheduled?.total ?? 0),
      badge: meetingsComparison.badge,
      suffix: meetingsComparison.suffix,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative min-h-[156px] overflow-hidden rounded-lg bg-white p-4"
        >
          <span
            className={`flex size-10 items-center justify-center rounded-xl ${card.tint}`}
          >
            <Image
              src={card.icon}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="size-5"
            />
          </span>
          <div className="relative z-10 mt-2 max-w-[155px]">
            <p className="text-2xl font-bold leading-normal text-[#0E1224]">
              {card.value}
            </p>
            <p className="text-sm leading-normal text-[#8B93B8]">
              {card.label}
            </p>
            <div className="mt-[3px] flex items-center gap-0.5 whitespace-nowrap text-xs text-[#8B93B8]">
              <span
                className={`flex items-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold ${card.tint}`}
                style={{ color: card.color }}
              >
                {card.suffix && (
                  <TrendingUp className="size-3" strokeWidth={2} />
                )}
                {card.badge}
              </span>
              {card.suffix && <span>{card.suffix}</span>}
            </div>
          </div>
          <Image
            src={card.chart}
            alt=""
            width={108}
            height={65}
            unoptimized
            className="absolute bottom-4 right-4 h-[65px] w-[108px]"
          />
        </article>
      ))}
    </section>
  );
}
