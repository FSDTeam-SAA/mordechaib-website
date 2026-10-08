export type ChiefTab = "ask" | "executive";

export function ChiefNavigation({ activeTab, onTabChange }: { activeTab: ChiefTab; onTabChange: (tab: ChiefTab) => void }) {
  return (
    <div className="py-4">
      <nav aria-label="Chief of Staff sections" className="flex gap-2 rounded-lg bg-white p-2 sm:px-3">
        <button onClick={() => onTabChange("ask")} className={`flex-1 rounded-lg px-3 py-2.5 text-xs sm:text-sm ${activeTab === "ask" ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}>Ask Laura Anything</button>
        <button onClick={() => onTabChange("executive")} className={`flex-1 rounded-lg px-3 py-2.5 text-xs sm:text-sm ${activeTab === "executive" ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}>Executive Briefings</button>
      </nav>
    </div>
  );
}
