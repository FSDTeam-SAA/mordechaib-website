import Image from "next/image";
import type { CallMetric } from "./types";

export function CallMetricCards({ metrics }: { metrics: CallMetric[] }) {
  return <section aria-label="Call summary" className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => <article key={metric.label} className="relative h-[132px] min-w-0 overflow-hidden rounded-lg bg-white p-4"><div className={`flex size-10 items-center justify-center rounded-xl ${metric.iconBackground}`}><Image src={metric.icon} alt="" width={20} height={20} /></div><p className="mt-2 text-2xl font-bold leading-none text-[#0E1224]">{metric.value}</p><p className="mt-2 text-sm text-[#8B93B8]">{metric.label}</p><Image src={metric.chart} alt="" width={108} height={66} className="absolute bottom-4 right-4 h-[66px] w-[108px]" /></article>)}</section>;
}
