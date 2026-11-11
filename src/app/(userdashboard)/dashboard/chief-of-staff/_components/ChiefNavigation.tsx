export type ChiefTab = "ask" | "executive";

export function ChiefNavigation({ activeTab, onTabChange }: { activeTab: ChiefTab; onTabChange: (tab: ChiefTab) => void }) {
  return (
    <div className="pb-3 sm:pb-4">
      <nav aria-label="Chief of Staff sections" className="grid grid-cols-2 gap-2 rounded-lg bg-white p-2 sm:px-3">
        <button type="button" onClick={() => onTabChange("ask")} className={`min-h-11 rounded-lg px-2 py-2 text-xs sm:px-3 sm:text-sm ${activeTab === "ask" ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}>Ask Laura Anything</button>
        <button type="button" onClick={() => onTabChange("executive")} className={`min-h-11 rounded-lg px-2 py-2 text-xs sm:px-3 sm:text-sm ${activeTab === "executive" ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}>Executive Briefings</button>
      </nav>
    </div>
  );
}
