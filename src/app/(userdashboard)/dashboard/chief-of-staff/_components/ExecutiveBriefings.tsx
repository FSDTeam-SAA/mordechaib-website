"use client";

import Image from "next/image";
import { CheckCircle2, LogIn, Siren, Sparkles } from "lucide-react";
import { useState } from "react";
import { ExecutiveAgentUpdates } from "./ExecutiveAgentUpdates";
import { ExecutiveMetrics } from "./ExecutiveMetrics";
import { DiscussTeamChallenges } from "./DiscussTeamChallenges";
import { WeeklyReview } from "./WeeklyReview";

const decisions = [
  [CheckCircle2, "Approval", "Budget increase for IT project", "#5B7FF0"],
  [LogIn, "Sign-off", "Q4 partnership proposal", "#F59E0B"],
  [Siren, "Escalation", "Address client complaint", "#EF4444"],
  [Sparkles, "Review", "High-value deals report", "#D24FC7"],
] as const;
const priorities = [["Launch New product", "On schedule", "Lead: Vizzy"], ["Expend Key Account", "Increased Revenue", "Lead: Steve"], ["Improved Team Efficiency", "Process Streamlined", "Lead: Dexter"]] as const;

export function ExecutiveBriefings() {
  const [quickAction, setQuickAction] = useState<"briefing" | "challenges" | "weekly">("briefing");

  return (
    <>
      <section className="rounded-lg bg-white p-3">
        <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">Quick Actions</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3"><button onClick={() => setQuickAction("briefing")} className={`flex h-8 items-center pr-3 text-sm ${quickAction === "briefing" ? "bg-[#F5F7FF] before:mr-3 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "px-3"}`}>Get today&apos;s briefing</button><button onClick={() => setQuickAction("challenges")} className={`flex h-8 items-center pr-3 text-left text-sm ${quickAction === "challenges" ? "bg-[#F5F7FF] before:mr-3 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "px-3"}`}>Discuss team challenges</button><button onClick={() => setQuickAction("weekly")} className={`flex h-8 items-center pr-3 text-left text-sm ${quickAction === "weekly" ? "bg-[#F5F7FF] before:mr-3 before:h-6 before:w-1 before:rounded-r-full before:bg-[#5B7FF0]" : "px-3"}`}>Weekly Review</button></div>
      </section>
      {quickAction === "weekly" ? <WeeklyReview /> : quickAction === "challenges" ? <DiscussTeamChallenges /> : <div className="mt-4 space-y-6 rounded-2xl bg-white p-4 sm:p-6">
        <section><h2 className="text-base font-medium">1. Today&apos;s Primary Focus (Single Strategic Objective)</h2><p className="mt-4 text-sm">One sentence defining the most important thing today.</p><p className="mt-4 rounded-lg bg-[#F5F7FF] px-3 py-2 text-sm">Close Michael Chang subcontracting agreement.</p></section>
        <ExecutiveAgentUpdates />
        <section><h2 className="text-base font-medium">3. CEO Action Items (Immediate Decisions Required)</h2><p className="mt-4 text-sm">Only items that must be done by you before noon.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{decisions.map(([Icon, title, text, color]) => <article key={title} className="rounded-lg bg-[#F5F7FF] p-4 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1A`, color }}><Icon className="size-6" /></span><h3 className="mt-2 text-lg font-bold" style={{ color }}>{title}</h3><p className="mt-1 text-sm text-[#8B93B8]">{text}</p></article>)}</div></section>
        <section><h2 className="text-base font-medium">4. Pipeline &amp; Revenue Signals (Sales + Forecast)</h2><p className="mt-4 text-sm">Three priorities aligned with your strategic direction</p><div className="mt-4 grid gap-2 md:grid-cols-3">{priorities.map((item, index) => <article key={item[0]} className="flex gap-2 rounded-lg bg-[#F5F7FF] p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#5B7FF0]/10 text-xl font-bold text-[#5B7FF0]">{index + 1}</span><div><h3 className="font-medium text-[#5B7FF0]">{item[0]}</h3><p className="mt-1 text-sm text-[#8B93B8]">{item[1]}</p><p className="text-sm">{item[2]}</p></div></article>)}</div></section>
        <ExecutiveMetrics />
        <section><h2 className="text-base font-medium">12. CEO Notes (Your Strategic Direction)</h2><p className="mt-3 text-sm">Your space:</p><div className="mt-4 flex items-center gap-4 rounded-lg bg-[#F5F7FF] p-4"><Image src="/laura.png" alt="Laura" width={60} height={60} className="size-[60px] rounded-full border border-[#8B93B8] object-cover" /><p className="text-sm sm:text-base">“Focus on partnership closure and high-value renewals, prepare for q3 executive review, maintain momentum across all teams.”– Laura</p></div></section>
      </div>}
    </>
  );
}
