"use client";

import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { downloadRoiReport, getRoiDashboard, RoiDashboard, RoiRange } from "@/lib/roi-dashboard-api";
import { GrowthOverviewChart } from "./GrowthOverviewChart";
import { KpiCards } from "./KpiCards";
import { MonthlySavingsChart } from "./MonthlySavingsChart";
import { ProjectionBanner } from "./ProjectionBanner";
import { SavingsBreakdown } from "./SavingsBreakdown";
import { TasksByAgentChart } from "./TasksByAgentChart";
import { TimeSavedByCategory } from "./TimeSavedByCategory";

type RoiContextValue = { data: RoiDashboard; range: RoiRange; setRange: (range: RoiRange) => void; downloading: boolean; download: () => Promise<void> };
const RoiContext = createContext<RoiContextValue | null>(null);
export function useRoiDashboard() { const value = useContext(RoiContext); if (!value) throw new Error("ROI dashboard context is missing."); return value; }

function Loading() { return <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4"><div className="grid gap-3 sm:grid-cols-2 min-[1200px]:grid-cols-4">{[1,2,3,4].map(x=><div key={x} className="h-28 animate-pulse rounded-lg bg-white"/>)}</div><div className="h-14 animate-pulse rounded-lg bg-white"/><div className="grid gap-3 xl:grid-cols-2">{[1,2].map(x=><div key={x} className="h-80 animate-pulse rounded-xl bg-white"/>)}</div></div>; }

export function RoiDashboardClient() {
  const { data: session, status } = useSession();
  const token = session?.user.accessToken || "";
  const [range, setRange] = useState<RoiRange>("30_DAYS");
  const [downloading, setDownloading] = useState(false);
  const query = useQuery({ queryKey: ["roi-dashboard", range], queryFn: () => getRoiDashboard(token, range), enabled: status === "authenticated" && Boolean(token) });
  const download = async () => { if (!token || downloading) return; setDownloading(true); try { await downloadRoiReport(token, range); toast.success("ROI report downloaded."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to download report."); } finally { setDownloading(false); } };
  if (status === "loading" || query.isPending) return <Loading/>;
  if (!query.data) return <div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5"><div className="flex min-h-56 flex-col items-center justify-center rounded-xl bg-white p-5 text-center"><AlertCircle className="size-10 text-red-500"/><h2 className="mt-2.5 text-[1.0625rem]/[1.75rem] font-semibold">ROI dashboard could not be loaded</h2><p className="mt-1 text-sm text-[#8B93B8]">{query.error instanceof Error ? query.error.message : "Please sign in and try again."}</p>{token&&<button onClick={()=>void query.refetch()} className="mt-[1.125rem] rounded-lg bg-[#5B7FF0] px-[1.125rem] py-2 text-sm text-white">Try again</button>}</div></div>;
  return <RoiContext.Provider value={{data:query.data,range,setRange,downloading,download}}><div className="min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 space-y-3 sm:space-y-4"><KpiCards/><ProjectionBanner/><section className="grid gap-3 xl:grid-cols-2"><MonthlySavingsChart/><GrowthOverviewChart/></section><section className="grid gap-3 lg:grid-cols-2 min-[1400px]:grid-cols-3"><TasksByAgentChart/><TimeSavedByCategory/><SavingsBreakdown/></section></div></RoiContext.Provider>;
}
