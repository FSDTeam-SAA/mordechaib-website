import Image from "next/image";
import { useId } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type TaskStatCardProps = {
  icon: string;
  chartValues: number[];
  chartColor: string;
  value: string;
  label: string;
  color: string;
  background: string;
  changePercent: number;
};

export function TaskStatCard({
  icon,
  chartValues,
  chartColor,
  value,
  label,
  color,
  background,
  changePercent,
}: TaskStatCardProps) {
  const gradientId = useId().replace(/:/g, "");
  const isDecrease = changePercent < 0;
  const TrendIcon = isDecrease ? TrendingDown : TrendingUp;
  const values = chartValues.length > 1 ? chartValues : [chartValues[0] ?? 0, chartValues[0] ?? 0];
  const maxValue = Math.max(...values, 1);
  const points = values
    .map((item, index) => {
      const x = 1 + (index / (values.length - 1)) * 106;
      const y = 64 - (Math.max(0, item) / maxValue) * 58;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="relative min-h-[156px] overflow-hidden rounded-lg bg-white p-4">
      <span
        className={`flex size-10 items-center justify-center rounded-xl ${background}`}
      >
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="size-5"
        />
      </span>

      <div className="relative z-10 mt-2 max-w-[155px]">
        <p className="text-2xl font-bold leading-normal text-[#0E1224]">
          {value}
        </p>
        <p className="text-sm leading-normal text-[#8B93B8]">{label}</p>
        <div className="mt-[3px] flex items-center gap-0.5 whitespace-nowrap text-xs text-[#8B93B8]">
          <span
            className={`flex items-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold ${background} ${color}`}
          >
            <TrendIcon className="size-3" strokeWidth={2} />
            {Math.abs(changePercent)}%
          </span>
          <span>vs last week</span>
        </div>
      </div>

      <svg
        viewBox="0 0 108 65"
        aria-hidden="true"
        className="absolute bottom-4 right-4 h-[65px] w-[108px]"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`1,65 ${points} 107,65`} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke={chartColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </article>
  );
}
