"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Crown, Loader2, RotateCcw, TrendingDown } from "lucide-react";
import { checkoutRequest } from "@/lib/checkout-api";

type EstimateLine = { quantity: number; rateUsd: number; costUsd: number; formattedCost: string };
type UsageEstimate = {
  estimatedMonthlyCost: number;
  formattedEstimatedMonthlyCost: string;
  payAsYouGo: {
    name: string; totalCostUsd: number; formattedTotal: string;
    breakdown: { aiActions: EstimateLine; callMinutes: EstimateLine; aiMeetings: EstimateLine };
  };
  subscription: null | { name: string; displayName: string; formattedPrice: string; formattedEstimatedTotalCost: string; isWithinIncludedUsage: boolean; limits: { callMinutesPerMonth?: number; aiActionsPerMonth?: number; meetingHoursPerMonth?: number; crmContactsLimit?: number; usersIncluded?: number } };
  comparison: { isUpgradeRecommended: boolean; badge: string; message: string; formattedSavings: string | null; footnote: string };
  recommendedPlan: null | { id: string; planType: string; name: string; priceUsd: number; limits: { callMinutesPerMonth?: number; aiActionsPerMonth?: number; meetingHoursPerMonth?: number; crmContactsLimit?: number; usersIncluded?: number } };
  recommendedPlanSummary: string;
  totalEstimatedMonthlyUsd: number;
};

type Values = { calls: number; actions: number; meetings: number };
const defaults: Values = { calls: 50, actions: 500, meetings: 5 };
const emptyValues: Values = { calls: 0, actions: 0, meetings: 0 };

function Slider({ label, value, max, step, color, onChange }: { label: string; value: number; max: number; step: number; color: string; onChange: (value: number) => void }) {
  const percent = value / max * 100;
  return <label className="block rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_6px_20px_rgba(80,94,160,0.07)] backdrop-blur sm:p-5"><span className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[#0E1224]">{label}</span><span className="text-[11px] font-medium text-[#9AA3BC]">0 — {max.toLocaleString()}</span></span><div className="relative mb-1 mt-8 h-2.5 rounded-full bg-[#E8EBF3] shadow-inner" style={{"--slider-color":color} as React.CSSProperties}><div className="h-full rounded-full shadow-[0_0_12px_var(--slider-color)]" style={{width:`${percent}%`,backgroundColor:color}}/><span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-[0_2px_8px_rgba(14,18,36,0.22)]" style={{left:`clamp(10px, ${percent}%, calc(100% - 10px))`,borderColor:color}}/><span className="absolute -top-11 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white shadow-lg after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-x-transparent after:border-b-transparent after:border-t-[var(--slider-color)]" style={{left:`clamp(28px, ${percent}%, calc(100% - 28px))`,backgroundColor:color}}>{value.toLocaleString()}</span><input type="range" min="0" max={max} step={step} value={value} onChange={event=>onChange(Number(event.target.value))} aria-label={label} className="absolute -inset-y-3 left-0 z-10 h-8 w-full cursor-pointer opacity-0"/></div></label>;
}

const UsageEstimator = () => {
  const [values,setValues]=useState<Values>(defaults);
  const [queryValues,setQueryValues]=useState<Values>(defaults);
  useEffect(()=>{const timer=window.setTimeout(()=>setQueryValues(values),350);return()=>window.clearTimeout(timer);},[values]);
  const estimateQuery=useQuery({
    queryKey:["subscription-plan-estimate",queryValues],
    queryFn:({signal})=>checkoutRequest<UsageEstimate>(`/subscription-plans/estimate?${new URLSearchParams({monthlyActions:String(queryValues.actions),monthlyCalls:String(queryValues.calls),monthlyMeetings:String(queryValues.meetings)})}`,{signal}),
    placeholderData:previous=>previous,
  });
  const estimate=estimateQuery.data;
  const update=(key:keyof Values)=>(value:number)=>setValues(current=>({...current,[key]:value}));
  const showUpgradeOptions=()=>document.getElementById("pricing-plans")?.scrollIntoView({behavior:"smooth",block:"start"});

  return <section aria-labelledby="smart-calculator-title" className="relative mx-auto w-full max-w-[900px]">
    <div aria-hidden="true" className="absolute -left-12 top-16 size-40 rounded-full bg-[#5B7FF0]/15 blur-3xl"/><div aria-hidden="true" className="absolute -right-12 bottom-12 size-40 rounded-full bg-[#D946EF]/15 blur-3xl"/>
    <div className="relative rounded-[26px] bg-gradient-to-br from-[#AAB9FF] via-white to-[#E4A9F2] p-px shadow-[0_24px_70px_rgba(74,90,160,0.18)]">
    <div className="relative overflow-hidden rounded-[25px] bg-[linear-gradient(145deg,#FFFFFF_0%,#F8F9FF_52%,#FDF8FF_100%)] p-4 sm:p-7 lg:p-9">
      <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-64 bg-[radial-gradient(circle_at_top_right,rgba(91,127,240,0.14),transparent_68%)]"/>
      <div className="relative flex flex-col gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left"><div><h3 id="smart-calculator-title" className="text-2xl font-bold tracking-[-0.03em] text-[#0E1224] sm:text-[32px]">Smart Upgrade Calculator</h3><p className="mt-1 max-w-xl text-sm leading-relaxed text-[#7A849D]">Fine-tune your expected usage and instantly discover the smartest plan for your workflow.</p></div><button type="button" onClick={()=>setValues(emptyValues)} className="mx-auto inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE3F5] bg-white/80 px-4 text-xs font-semibold text-[#5B7FF0] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:mx-0"><RotateCcw className="size-3.5"/>Reset</button></div>

      <div className="relative mt-8 grid gap-3 sm:mt-9">
        <Slider label="Monthly Call Minutes" value={values.calls} max={2000} step={10} color="#5B7FF0" onChange={update("calls")}/>
        <Slider label="Monthly AI Actions" value={values.actions} max={10000} step={100} color="#D94DCE" onChange={update("actions")}/>
        <Slider label="Monthly AI Meetings" value={values.meetings} max={100} step={1} color="#10B981" onChange={update("meetings")}/>
      </div>

      <div className="relative mt-6 min-h-[180px] overflow-hidden rounded-2xl border border-[#C9EEDC] bg-[linear-gradient(120deg,#EBFFF6_0%,#F5FFFB_50%,#F8F5FF_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6">
        <div aria-hidden="true" className="absolute -right-10 -top-16 size-44 rounded-full bg-[#5B7FF0]/10 blur-3xl"/>
        {estimateQuery.isFetching&&<Loader2 className="absolute right-4 top-4 size-4 animate-spin text-[#5B7FF0]"/>}
        {estimateQuery.isError&&!estimate?<div role="alert" className="flex min-h-[110px] flex-col items-center justify-center text-center"><p className="text-sm text-red-500">{estimateQuery.error.message}</p><button type="button" onClick={()=>void estimateQuery.refetch()} className="mt-2 text-sm font-semibold text-[#5B7FF0] underline">Try again</button></div>:estimate?<>
          <div className="relative flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-[#14804A]">Estimated monthly cost: <span className="text-lg">{estimate.formattedEstimatedMonthlyCost}</span></p>{estimate.comparison.isUpgradeRecommended?<button type="button" onClick={showUpgradeOptions} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"><CheckCircle2 className="size-3.5"/>Upgrade and save</button>:<span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"><CheckCircle2 className="size-3.5"/>{estimate.comparison.badge}</span>}</div>
          <div className="relative mt-4 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className="rounded-xl border border-white bg-white/70 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-[#7A849D]">Pay as you go</p><p className="mt-1 text-2xl font-bold text-[#0E1224] sm:text-3xl">{estimate.payAsYouGo.formattedTotal}</p><p className="mt-1 text-[11px] text-[#8B93B8]">Based on selected usage</p></div><span className="hidden self-center rounded-full border border-[#E3E8F4] bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase text-[#8B93B8] shadow-sm sm:block">vs</span><div className="rounded-xl border border-[#5B7FF0]/15 bg-white/70 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-[#7A849D]">{estimate.subscription?.displayName||"Subscription"}</p><p className="mt-1 text-2xl font-bold text-[#5B7FF0] sm:text-3xl">{estimate.subscription?.formattedPrice||"Not available"}</p><p className="mt-1 text-[11px] text-[#8B93B8]">Predictable monthly pricing</p></div></div>
          <div className={`relative mt-4 overflow-hidden rounded-xl border p-4 ${estimate.comparison.isUpgradeRecommended?"border-[#C9D4FF] bg-gradient-to-r from-[#EEF2FF] to-[#FAF1FF]":"border-[#BFEAD7] bg-gradient-to-r from-[#EDFFF6] to-white"}`}>
            <div aria-hidden="true" className="absolute -right-8 -top-12 size-28 rounded-full bg-[#8B5CF6]/10 blur-2xl"/>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${estimate.comparison.isUpgradeRecommended?"bg-gradient-to-br from-[#5B7FF0] to-[#D94DCE]":"bg-gradient-to-br from-[#10B981] to-[#5B7FF0]"}`}><Crown className="size-5"/></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A849D]">Recommended for you</p><h4 className="mt-1 text-xl font-bold text-[#0E1224]">{estimate.recommendedPlan?.name||estimate.recommendedPlanSummary}</h4><p className="mt-1 text-xs leading-relaxed text-[#596078]">{estimate.comparison.message}</p></div></div><div className="shrink-0 sm:text-right"><p className="text-2xl font-bold text-[#5B7FF0]">{estimate.recommendedPlan?.priceUsd===0?estimate.payAsYouGo.formattedTotal:`$${estimate.recommendedPlan?.priceUsd??0}/month`}</p>{estimate.comparison.formattedSavings&&<p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]"><TrendingDown className="size-3.5"/>Save {estimate.comparison.formattedSavings}</p>}</div></div>
            {estimate.recommendedPlan&&<div className="relative mt-3 flex flex-wrap gap-2 border-t border-[#DCE3F5] pt-3">{estimate.recommendedPlan.limits.aiActionsPerMonth!=null&&<span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-[#596078]"><strong className="text-[#0E1224]">{estimate.recommendedPlan.limits.aiActionsPerMonth.toLocaleString()}</strong> AI actions included</span>}{estimate.recommendedPlan.limits.callMinutesPerMonth!=null&&<span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-[#596078]"><strong className="text-[#0E1224]">{estimate.recommendedPlan.limits.callMinutesPerMonth.toLocaleString()}</strong> call minutes included</span>}{estimate.recommendedPlan.limits.usersIncluded!=null&&<span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-[#596078]"><strong className="text-[#0E1224]">{estimate.recommendedPlan.limits.usersIncluded}</strong> users included</span>}</div>}
          </div>
          <div className="relative mt-3 grid gap-2 text-xs text-[#596078] sm:grid-cols-3"><span className="rounded-lg bg-white/70 px-3 py-2"><span className="block font-medium text-[#0E1224]">AI actions</span><span className="mt-1 block">{estimate.payAsYouGo.breakdown.aiActions.quantity.toLocaleString()} × ${estimate.payAsYouGo.breakdown.aiActions.rateUsd}</span><strong className="mt-1 block text-sm text-[#0E1224]">{estimate.payAsYouGo.breakdown.aiActions.formattedCost}</strong></span><span className="rounded-lg bg-white/70 px-3 py-2"><span className="block font-medium text-[#0E1224]">Call minutes</span><span className="mt-1 block">{estimate.payAsYouGo.breakdown.callMinutes.quantity.toLocaleString()} × ${estimate.payAsYouGo.breakdown.callMinutes.rateUsd}</span><strong className="mt-1 block text-sm text-[#0E1224]">{estimate.payAsYouGo.breakdown.callMinutes.formattedCost}</strong></span><span className="rounded-lg bg-white/70 px-3 py-2"><span className="block font-medium text-[#0E1224]">AI meetings</span><span className="mt-1 block">{estimate.payAsYouGo.breakdown.aiMeetings.quantity.toLocaleString()} × ${estimate.payAsYouGo.breakdown.aiMeetings.rateUsd}</span><strong className="mt-1 block text-sm text-[#0E1224]">{estimate.payAsYouGo.breakdown.aiMeetings.formattedCost}</strong></span></div>
        </>:<div className="flex min-h-[110px] items-center justify-center"><Loader2 className="size-6 animate-spin text-[#5B7FF0]"/></div>}
      </div>
      {estimate?.comparison.footnote&&<p className="mt-3 text-center text-[11px] leading-relaxed text-[#8B93B8]">{estimate.comparison.footnote}</p>}
    </div></div>
  </section>;
};

export default UsageEstimator;
